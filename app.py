import os

import pandas as pd

import requests

import json

from flask import Flask, request, jsonify

from flask_cors import CORS

import firebase_admin

from firebase_admin import credentials, initialize_app, firestore

from firebase_admin.exceptions import FirebaseError

from google.cloud.firestore_v1.base_client import BaseClient

from requests.exceptions import HTTPError

#from flask import Blueprint, request, jsonify, current_app



# Import the Blueprint from the new file

from legal_aid_routes import legal_aid_bp
from judge_routes import judge_bp



# ====================================================================

# 1. Initialization and Configuration

# ====================================================================

app = Flask(__name__)

# Enable CORS for a client running at http://localhost:3000

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})



# Configuration variables (Set these environment variables or replace defaults)

# NOTE: Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key for testing (Option B)

FIREBASE_SERVICE_ACCOUNT_PATH = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "bail-reckoner-c1c83-firebase-adminsdk-fbsvc-c8d2fb57c7.json")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyD6EAuVkl9rFltUmn-Z0HGHw0mMUiCgDmE")

GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025"

# CRITICAL FIX: Ensure the API key variable is used in the URL

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"



# Configuration for CSV data loading

DATASET_FILE_PATH = os.environ.get("DATASET_FILE_PATH", "a(2).csv")

global_dataframe = None # Global variable to hold the DataFrame



db: BaseClient = None



# ====================================================================

# 2. Data and Firebase Initialization

# ====================================================================

def create_mock_dataframe():

    """Creates a basic mock DataFrame for when the real CSV is missing."""

    data = {

        'statute': ['Assault', 'Theft', 'Drug Trafficking'],

        'offense_category': ['Felony', 'Misdemeanor', 'Felony'],

        'penalty': ['Severe', 'Minor', 'Moderate'],

        'age': [45, 22, 38],

        'prior_convictions': [3, 0, 1]

    }

    return pd.DataFrame(data)



def load_data():

    """Loads the CSV data into a global DataFrame or creates a mock DataFrame."""

    global global_dataframe

    if os.path.exists(DATASET_FILE_PATH):

        try:

            global_dataframe = pd.read_csv(DATASET_FILE_PATH)

            print(f"✅ Data loaded successfully from {DATASET_FILE_PATH}. Rows: {len(global_dataframe)}")

        except Exception as e:

            print(f"❌ Error loading data from {DATASET_FILE_PATH}: {e}")

            # Fallback to mock data if file exists but fails to load

            global_dataframe = create_mock_dataframe()

    else:

        print(f"⚠️ Data file not found at {DATASET_FILE_PATH}. Creating mock data for LLM context.")

        global_dataframe = create_mock_dataframe()



def initialize_firestore():

    """Initializes the Firebase Admin SDK and Firestore client."""

    global db

   

    # Check if the service account file exists before proceeding

    if not os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):

        print("❌ Firebase Admin SDK path is invalid or file is missing. Firestore saving is disabled.")

        db = None

        return



    try:

        # Check if app is already initialized to avoid re-initialization errors

        if not firebase_admin._apps:

            # Use the service account key file path

            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)

            initialize_app(cred)

       

        db = firestore.client()

        print("✅ Connected to Firebase Firestore.")

    except FirebaseError as e:

        print(f"❌ Firebase Initialization Error: {e}")

        db = None

    except Exception as e:

        print(f"❌ Error during Firebase setup: {e}")

        db = None



# Initialize data and Firebase when the app starts

load_data()

initialize_firestore()



# ====================================================================

# *** PASS GLOBAL VARS TO APP CONFIG AND REGISTER BLUEPRINT ***

# ====================================================================

# ====================================================================
# *** PASS GLOBAL VARS TO APP CONFIG AND REGISTER BLUEPRINT ***
# ====================================================================

# 1. Pass these to app.config so 'legal_aid_routes.py' can use them
# (This is CRITICAL for the separate file to access keys and DB)
app.config['FIRESTORE_DB'] = db
app.config['GEMINI_API_KEY'] = GEMINI_API_KEY
app.config['GEMINI_MODEL'] = GEMINI_MODEL

# 2. Register the Legal Aid Blueprint
# We do NOT add a url_prefix here, so the route remains '/generate_document'
app.register_blueprint(legal_aid_bp)
# 3. Register the Judge Blueprint
app.register_blueprint(judge_bp) # Add this line

# ====================================================================

# 3. LLM Prediction Function (Replaces CatBoost Model)

# ====================================================================

def get_llm_prediction(case_data: dict):

    """

    Calls the Gemini API to get a structured bail eligibility prediction.

    """

    if not GEMINI_API_KEY:

        raise ValueError("GEMINI_API_KEY is not set.")



    # 1. Augment instruction with data sample if available

    data_context = ""

    if global_dataframe is not None and not global_dataframe.empty:

        # Using .to_string() to avoid the 'tabulate' dependency issue

        sample = global_dataframe.head(3).to_string(index=False)

        data_context = f"""

        For historical context, here are the first few rows of the dataset used to inform prior decisions (use this ONLY for establishing context, not for prediction):

        {sample}

        """



    # 2. Construct the detailed legal prompt

    legal_instruction = f"""

    You are an expert legal analyst. Analyze the following prisoner's profile to determine bail eligibility.

    Your decision must be returned STRICTLY as a JSON object matching the provided schema.



    {data_context}



    Input Profile:

    - Prisoner Name: {case_data.get('prisonerName', 'Unknown')}

    - Age: {case_data.get('age', 30)}

    - Prior Convictions: {case_data.get('priorConvictions', 0)}

    - Statute/Code: {case_data.get('statute', 'General Offense')}

    - Offense Category: {case_data.get('offenseCategory', 'Misdemeanor')}

    - Penalty Class: {case_data.get('penalty', 'Moderate')}

    - Risk of Flight/Escape: {'HIGH' if case_data.get('riskOfEscape') else 'LOW'}

    - Risk of Witness Tampering/Influence: {'HIGH' if case_data.get('riskOfInfluence') else 'LOW'}

    - Served Half Term: {'YES' if case_data.get('servedHalfTerm') else 'NO'}



    Based on these factors, determine if bail should be granted (1) or denied (0).

    Provide the probability of denial (probability_no_bail) and granting (probability_bail) based on the severity of risk factors, summing to 100.

    Provide a concise reason for the eligibility verdict, focusing on the most influential factors (e.g., high risk of flight).

    """



    # 3. Define the payload for the Gemini API call

    payload = {

        "contents": [{"parts": [{"text": legal_instruction}]}],

        "generationConfig": {

            "responseMimeType": "application/json",

            "responseSchema": {

                "type": "OBJECT",

                "properties": {

                    "bail_eligibility": {"type": "number", "description": "1 if eligible, 0 if not eligible."},

                    "probability_no_bail": {"type": "number", "description": "Percentage probability of denial (0-100)."},

                    "probability_bail": {"type": "number", "description": "Percentage probability of granting (0-100)."},

                    "reason": {"type": "string", "description": "Concise justification for the decision."},

                },

                "required": ["bail_eligibility", "probability_no_bail", "probability_bail", "reason"]

            }

        }

    }



    # 4. Make the API request

    headers = {'Content-Type': 'application/json'}

    response = requests.post(GEMINI_API_URL, headers=headers, json=payload)

    response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)



    # 5. Parse the structured JSON response

    result = response.json()

    json_string = result.get('candidates')[0].get('content').get('parts')[0].get('text')

   

    # The response is a string containing JSON, so we parse it again

    parsed_json = json.loads(json_string)



    return parsed_json



# ====================================================================

# 4. Prediction Endpoint (with AUTO-SAVE Logic)

# ====================================================================

@app.route('/predict', methods=['POST'])

def predict():

    """Handles the bail eligibility prediction request and automatically saves the record."""

    raw_data = request.get_json(force=True)

   

    if not GEMINI_API_KEY:

        return jsonify({"error": "LLM API Key not configured on the server."}), 500



    try:

        # 1. Get structured prediction from the LLM

        prediction_data = get_llm_prediction(raw_data)



        bail_eligibility = prediction_data.get('bail_eligibility')

        is_eligible = bail_eligibility == 1

       

        # 2. Prepare the final result response for the frontend

        result = {

            "bail_eligibility": bail_eligibility,

            "probability_no_bail": round(prediction_data.get('probability_no_bail'), 2),

            "probability_bail": round(prediction_data.get('probability_bail'), 2),

            "reason": prediction_data.get('reason'),

            "message": "The Prisoner is **Eligible for Bail**." if is_eligible else "The Prisoner is **Not Eligible for Bail**.",

            "verdict_style": "success" if is_eligible else "danger"

        }



        # 3. *** AUTO-SAVE LOGIC ***

        if db:

            # Combine Input data (raw_data) and Prediction Result (result)

            case_record = {

                **raw_data,

                "prediction_details": result,  

                "timestamp": firestore.SERVER_TIMESTAMP

            }

           

            try:

                # Use 'bail_predictions' collection for auto-saved LLM results

                db.collection('bail_predictions').add(case_record)

                app.logger.info("Case successfully auto-saved to Firestore.")

            except Exception as e:

                # Log the DB error, but continue sending the result to the user

                app.logger.error(f"Failed to auto-save prediction record to Firestore: {e}")

        # 4. Return result to frontend

        return jsonify(result)



    except requests.exceptions.HTTPError as errh:

        app.logger.error(f"HTTP Error from LLM: {errh}")

        return jsonify({"error": "LLM Service Error", "details": str(errh)}), 503

    except Exception as e:

        app.logger.error(f"Prediction failed: {e}")

        return jsonify({"error": "Server Error during Prediction", "details": str(e)}), 500



# ====================================================================

# 5. Save Case to Firestore (Manual Endpoint)

# ====================================================================

@app.route('/api/cases/save', methods=['POST'])

def save_case():

    """Saves a case record to Firestore (manual endpoint, for legacy or separate use)."""

    if db is None:

        return jsonify({"error": "Firestore not initialized."}), 500



    try:

        case_data = request.get_json(force=True)

        case_data['timestamp'] = firestore.SERVER_TIMESTAMP



        # Use 'bail_cases' collection for manual saves (differentiating from auto-saved predictions)

        doc_ref = db.collection('bail_cases').add(case_data)

       

        return jsonify({

            "message": "✅ Case saved successfully to Firestore!",

            "document_id": doc_ref[1].id

        }), 200

    except Exception as e:

        app.logger.error(f"Failed to save case: {e}")

        return jsonify({"error": "❌ Failed to save case", "details": str(e)}), 500



# ====================================================================

# 6. Get All Cases

# ====================================================================

@app.route('/api/cases', methods=['GET'])

def get_cases():

    """Fetches all case records from Firestore (fetches from 'bail_cases')."""

    if db is None:

        return jsonify({"error": "Firestore not initialized."}), 500



    try:

        # Fetch documents from the 'bail_predictions' collection (auto-saved results)

        cases_ref = db.collection('bail_predictions').stream()

       

        cases = []

        for doc_snapshot in cases_ref:

            doc_data = doc_snapshot.to_dict()

            # Convert Firestore Timestamp to ISO string for JSON serialization

            if 'timestamp' in doc_data and doc_data['timestamp'] is not None:

                doc_data['timestamp'] = doc_data['timestamp'].isoformat()

           

            cases.append({**doc_data, "id": doc_snapshot.id})

           

        return jsonify({"cases": cases}), 200

    except Exception as e:

        app.logger.error(f"Failed to fetch cases: {e}")

        return jsonify({"error": "❌ Failed to fetch cases", "details": str(e)}), 500



# ====================================================================

# 7. Run Server

# ====================================================================

if __name__ == '__main__':

    # Flask will automatically use the PORT environment variable if run in a container/service.

    port = int(os.environ.get('PORT', 5000))

    app.run(debug=True, host='0.0.0.0', port=port)