import pandas as pd
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from imblearn.over_sampling import SMOTE
from sklearn.metrics import classification_report # NEW IMPORT
import joblib

# --- 1. Load Data & Setup ---
df = pd.read_csv('a(2).csv')
cols_to_exclude = ['case_id', 'bail_eligibility', 'penalty_severity']
target = 'bail_eligibility'
features = [col for col in df.columns if col not in cols_to_exclude]

X = df[features]
y = df[target]

# --- 2. Preprocessing & Encoding ---
categorical_features = X.select_dtypes(include=['object', 'bool']).columns.tolist()

# Convert boolean columns to integers safely
for col in categorical_features[:]:
    if X[col].dtype == 'bool':
        X.loc[:, col] = X[col].astype(int) 
        categorical_features.remove(col) # Remove booleans from the categorical list

# Apply one-hot encoding to the remaining categorical (object) features
X_encoded = pd.get_dummies(X, columns=categorical_features, drop_first=True)

# --- 3. Split and Apply SMOTE to Training Data ---
X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42, stratify=y)

print(f"Original Training Sample Size (Minority): {y_train.sum()}")

# SMOTE Initialization: k_neighbors=3 fixes the error for small minority class size
smote = SMOTE(sampling_strategy='minority', random_state=42, k_neighbors=3) 

X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

print(f"Resampled Training Sample Size (Minority): {y_train_res.sum()}")
print(f"Resampled Training Sample Size (Majority): {len(y_train_res) - y_train_res.sum()}")

# --- 4. Train Model ---
model = CatBoostClassifier(
    iterations=200, 
    learning_rate=0.05, 
    depth=6, 
    verbose=0, 
    random_seed=42,
    loss_function='Logloss'
)

model.fit(X_train_res, y_train_res, eval_set=(X_test, y_test))

# --- 5. Evaluate and Save (Finalized) ---
y_pred = model.predict(X_test)
accuracy = model.score(X_test, y_test)

print("\n--- CLASSIFICATION REPORT (Test Set) ---")
# Generates Precision, Recall, F1-Score for each class (0=False, 1=True)
print(classification_report(y_test, y_pred))

print(f"Model Accuracy on Test Set (after SMOTE): {accuracy*100:.2f}%")

# Save the trained model and the list of features (CRUCIAL for Flask input order)
joblib.dump(model, 'catboost_bail_reckoner_model.pkl')
joblib.dump(X_encoded.columns.tolist(), 'model_features.pkl') 
print("Model and final feature list saved successfully.")