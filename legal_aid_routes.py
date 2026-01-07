import json
from flask import Blueprint, request, jsonify, current_app
import requests
import os

# --- 1. Blueprint Initialization ---
legal_aid_bp = Blueprint('legal_aid', __name__)

# --- Global Access Helper ---
def get_global_vars():
    """
    Retrieves configuration from the main Flask app context.
    """
    api_key = current_app.config.get('GEMINI_API_KEY')
    model_name = current_app.config.get('GEMINI_MODEL')
    db = current_app.config.get('FIRESTORE_DB')

    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY", "")
    
    if not model_name:
        model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-preview-09-2025")

    return {
        'db': db, 
        'GEMINI_API_KEY': api_key,
        'GEMINI_MODEL': model_name
    }

# --- 2. LLM Generation Logic ---
def generate_document_via_llm(client_name, lawyer_name, offense_details, api_key, model_name):
    GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    # --- STRICT CHECKLIST-BASED TEMPLATE ---
    # This prompt is structured exactly according to the 'Information Required in Bail Application' checklist image.
    document_instruction = f"""
You are a senior Supreme Court Advocate.
Your task is to generate the CONTENT for a Bail Application, strictly following the TEMPLATE and CHECKLIST below.

**CASE DATA:**
- Accused: {client_name}
- Advocate: {lawyer_name}
- Offense: {offense_details}

**INSTRUCTIONS:**
1. **STRICT ADHERENCE:** You must include ALL elements from the standard checklist (Court Details, FIR Info, Grounds, Undertakings, Closing).
2. **FORMAT:** Use the exact headings and layout provided in the template.
3. **CONTENT:** Generate dynamic content *only* for the bracketed sections [like this].
4. **ALIGNMENT:** The "FILED BY" section must be indented to the far right using exactly 120 spaces.
5. **BLANKS:** Use long underscores "______________________" for unknown details.

**--- BEGIN TEMPLATE (FOLLOW EXACTLY) ---**

                                IN THE COURT OF THE SESSIONS JUDGE / MAGISTRATE
                                AT [DISTRICT NAME], [STATE]

BAIL APPLICATION NO. ______________________ OF 202X

IN THE MATTER OF:

STATE OF [STATE NAME]
(At the instance of SHO, P.S. [Police Station Name])
                                                                    ... COMPLAINANT
        VERSUS

{client_name.upper()}
S/o [Father's Name]
R/o [Complete Address]
[City, State]
(Currently in Judicial Custody)
                                                                    ... APPLICANT / ACCUSED

                                **FIR INFORMATION**

FIR NUMBER: ______________________
FIR DATE:   ______________________
POLICE STATION: ______________________
SECTIONS INVOKED: {offense_details}
ARREST DATE: ______________________

**APPLICATION U/S 439 CR.P.C. FOR GRANT OF REGULAR BAIL**

MOST RESPECTFULLY SHOWETH:

1.  **PRELIMINARY SUBMISSION:**
    [Generate a paragraph stating the applicant is a law-abiding citizen, has been falsely implicated in the present case, and has been in custody since the Arrest Date mentioned above.]

2.  **BRIEF FACTS OF THE PROSECUTION CASE:**
    [Generate a concise summary of the allegations based on '{offense_details}'. Conclude by stating these allegations are false, exaggerated, and fabricated.]

**GROUNDS FOR BAIL**

The Applicant seeks bail on the following grounds:

A.  **ALLEGATIONS ARE FALSE AND EXAGGERATED:**
    [Generate an argument stating that the FIR is a result of manipulation/misunderstanding and the allegations do not stand up to scrutiny.]

B.  **NO CUSTODIAL INTERROGATION REQUIRED:**
    That the Applicant has joined the investigation (or is willing to do so). All necessary recoveries have been effected. Continued judicial custody serves no purpose and acts as pre-trial punishment.

C.  **SPECIFIC DEFENSE (NATURE OF OFFENSE):**
    [Generate a specific legal defense based on '{offense_details}'. E.g., if fraud, argue it is a civil dispute; if assault, argue lack of intent/provocation.]

D.  **STRONG COMMUNITY TIES & NO FLIGHT RISK:**
    That the Applicant is a permanent resident of the address mentioned above with family and immovable assets. There is absolutely no risk of the Applicant absconding or fleeing from justice.

E.  **NO PRIOR CRIMINAL RECORD:**
    That the Applicant has clean antecedents and has never been convicted in any criminal case previously.

**UNDERTAKINGS**

The Applicant hereby undertakes that, if granted bail, they shall:

1.  Appear before the Investigating Officer or the Hon'ble Court whenever required.
2.  Not tamper with the prosecution evidence in any manner.
3.  Not influence, threaten, or induce any prosecution witnesses.
4.  Not leave the country without the prior permission of this Hon'ble Court.
5.  Abide by any additional conditions this Hon'ble Court may deem fit to impose.

**PRAYER**

In light of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

(a) **GRANT** Regular Bail to the Applicant, {client_name.upper()}, in connection with the aforesaid FIR;
(b) Pass any other order or direction which this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE APPLICANT SHALL EVER REMAIN DUTY BOUND.

**VERIFICATION**

I, {client_name.upper()}, the Applicant above named, do hereby solemnly affirm and declare that the contents of the above application are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.

Verified at [City] on this ______________________ day of ______________________, 202X.

                                                                                                        ______________________
                                                                                                        DEPONENT / APPLICANT

Place: ______________________
Date:  ______________________

                                                                                                        FILED BY:

                                                                                                        ______________________
                                                                                                        ({lawyer_name.upper()})
                                                                                                        ADVOCATE FOR THE APPLICANT
                                                                                                        Enrollment No: ______________________
                                                                                                        Chamber No: ______________________
                                                                                                        Mobile: ______________________

**--- END TEMPLATE ---**
"""

    payload = {
        "contents": [{"parts": [{"text": document_instruction}]}],
        "generationConfig": {
            "temperature": 0.1, # Strict adherence to template
            "maxOutputTokens": 3000
        }
    }

    try:
        response = requests.post(GEMINI_API_URL, headers={'Content-Type': 'application/json'}, json=payload)
        response.raise_for_status()
        result = response.json()
        
        text = result.get('candidates')[0].get('content').get('parts')[0].get('text')
        clean_text = text.replace("```markdown", "").replace("```", "").strip()
        
        return clean_text
    except Exception as e:
        raise Exception(f"LLM Generation Failed: {str(e)}")

# --- 3. The Route ---
@legal_aid_bp.route('/generate_document', methods=['POST'])
def generate_document_route():
    globals_ = get_global_vars()
    api_key = globals_['GEMINI_API_KEY']
    model_name = globals_['GEMINI_MODEL']
    
    if not api_key:
        return jsonify({"error": "LLM API Key not configured."}), 500
    
    request_data = request.get_json(force=True)
    
    client_name = request_data.get('client_name')
    lawyer_name = request_data.get('lawyer_name')
    offense_details = request_data.get('offense_details')

    if not all([client_name, lawyer_name, offense_details]):
        return jsonify({"error": "Missing: client_name, lawyer_name, or offense_details"}), 400

    try:
        generated_text = generate_document_via_llm(
            client_name, lawyer_name, offense_details, api_key, model_name
        )
        
        return jsonify({
            "status": "success",
            "document_type": "Bail Application Draft",
            "generated_document": generated_text
        })

    except Exception as e:
        return jsonify({"error": "Server Error", "details": str(e)}), 500