// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCn41MfSovkTfFGq9ihe3OQNE7IfWPv-0",
  authDomain: "bail-reckoner-c1c83.firebaseapp.com",
  projectId: "bail-reckoner-c1c83",
  storageBucket: "bail-reckoner-c1c83.firebasestorage.app",
  messagingSenderId: "783846976336",
  appId: "1:783846976336:web:9cc73bd6709e7ed27f9a55",
  measurementId: "G-H7N9GZ767F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);