// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import App from "next/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA579feKEOm5ZUKWT32Cg1zmX1b8_z8ux8",
  authDomain: "article-app-60905.firebaseapp.com",
  projectId: "article-app-60905",
  storageBucket: "article-app-60905.firebasestorage.app",
  messagingSenderId: "742936221921",
  appId: "1:742936221921:web:6a86cb58d7b37e72ddbfa0",
  measurementId: "G-N8HSX4Y5BF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {db,auth};