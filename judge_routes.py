import json
from flask import Blueprint, request, jsonify, current_app
import requests
import os
from firebase_admin import firestore
from pypdf import PdfReader
from datetime import datetime
import pytz # Handles IST time properly

# --- 1. Blueprint Initialization ---
# Maintains your original separate file structure for Authority logic.
judge_bp = Blueprint('judge', __name__)

# --- Global Access Helper ---
def get_global_vars():
    """
    Retrieves configuration (API keys and DB instances) 
    directly from the main Flask app context.
    """
    api_key = current_app.config.get('GEMINI_API_KEY')
    model_name = current_app.config.get('GEMINI_MODEL')
    db = current_app.config.get('FIRESTORE_DB')
    
    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY", "")
    if not model_name:
        model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-preview-09-2025")
        
    return {'db': db, 'GEMINI_API_KEY': api_key, 'GEMINI_MODEL': model_name}

# --- 2. Routes ---

@judge_bp.route('/api/cases/<case_id>/decision', methods=['POST'])
def update_judicial_decision(case_id):
    """
    Updates the 'judicial_status' field for a specific prisoner in Firestore.
    """
    globals_ = get_global_vars()
    db = globals_['db']
    
    if db is None:
        return jsonify({"error": "Database connection not established."}), 500

    try:
        data = request.get_json(force=True)
        decision_status = data.get('status') 
        
        if not decision_status:
            return jsonify({"error": "Request must include a 'status' field."}), 400

        # Targeted update of the document in the 'bail_predictions' collection.
        db.collection('bail_predictions').document(case_id).update({
            "judicial_status": decision_status,
            "decision_timestamp": firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            "status": "success", 
            "message": f"Judicial record updated: {decision_status}."
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to update record", "details": str(e)}), 500

from pypdf import PdfReader

@judge_bp.route('/api/summarize-pdf', methods=['POST'])
def summarize_pdf():
    """ Receives PDF from laptop, extracts text, and returns AI summary """
    if 'file' not in request.files:
        return jsonify({"error": "No file detected"}), 400
    
    file = request.files['file']
    globals_ = get_global_vars()
    
    try:
        # Extract text from the binary file stream
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

        if len(text.strip()) < 50:
            return jsonify({"error": "PDF text is too short or unreadable."}), 400

        # Send to Gemini
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{globals_['GEMINI_MODEL']}:generateContent?key={globals_['GEMINI_API_KEY']}"
        prompt = f"Provide a judicial summary of this case file:\n\n{text[:10000]}"
        
        res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
        summary = res.json()['candidates'][0]['content']['parts'][0]['text']
        
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@judge_bp.route('/api/cases/<case_id>/reset', methods=['POST'])
def reset_judicial_decision(case_id):
    """ Clears the judicial_status in Firestore to unlock buttons for testing """
    globals_ = get_global_vars()
    db = globals_['db']
    try:
        # We update the status to an empty string or 'Pending'
        db.collection('bail_predictions').document(case_id).update({
            "judicial_status": "",
            "decision_timestamp": firestore.SERVER_TIMESTAMP
        })
        return jsonify({"status": "success", "message": "Decision reset successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@judge_bp.route('/api/chat', methods=['POST'])
def judge_ai_chat():
    """
    Context-aware chatbot with localized time awareness for the Judge.
    """
    globals_ = get_global_vars()
    data = request.get_json(force=True)
    user_query = data.get('query')
    case_context = data.get('context', {})

    if not user_query:
        return jsonify({"error": "Empty queries are not permitted."}), 400

    # Force IST time for prompt accuracy
    ist = pytz.timezone('Asia/Kolkata')
    current_time_ist = datetime.now(ist).strftime("%I:%M %p")

    GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{globals_['GEMINI_MODEL']}:generateContent?key={globals_['GEMINI_API_KEY']}"

    # Prompt updated only to include local time awareness.
    prompt = f"""
    You are an AI Judicial Assistant aiding a Sessions Judge. 
    The current local time is {current_time_ist}. 
    Greet the Judge correctly based on this time (e.g., Good Evening if it is night).
    
    Reference this Prisoner Context:
    - Name: {case_context.get('prisonerName', 'N/A')}
    - Charges: {case_context.get('offenseCategory', 'N/A')}
    - AI Summary: {case_context.get('prediction_details', {}).get('reason', 'No summary available.')}
    
    Judge's Inquiry: {user_query}
    Provide a professional, neutral, and fact-based response.
    """

    try:
        res = requests.post(GEMINI_API_URL, json={"contents": [{"parts": [{"text": prompt}]}]})
        res.raise_for_status()
        ai_response = res.json()['candidates'][0]['content']['parts'][0]['text']
        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": "Chat module failed", "details": str(e)}), 500