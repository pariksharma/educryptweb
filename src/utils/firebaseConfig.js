import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8ISZRq949XJrbNeZm0gK54d9Q3zAzBtI",
  authDomain: "lab-elsaq-education.firebaseapp.com",
  databaseURL: "https://lab-elsaq-education-default-rtdb.firebaseio.com",
  projectId: "lab-elsaq-education",
  storageBucket: "lab-elsaq-education.appspot.com",
  messagingSenderId: "413835077933",
  appId: "1:413835077933:web:e9ad389b4f0e203dfa0ba4",
  measurementId: "G-1527TMN738"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app);  // Log to verify Firebase initialization

// Initialize Firebase Authentication and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
