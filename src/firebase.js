// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnpnLY0PURJ2-X3KZimmbQXvoFe65QJSM",
  authDomain: "rishtamanager-ef43b.firebaseapp.com",
  projectId: "rishtamanager-ef43b",
  storageBucket: "rishtamanager-ef43b.firebasestorage.app",
  messagingSenderId: "664526534255",
  appId: "1:664526534255:web:0c89692a48f94bf7f97f9a",
  measurementId: "G-K41X3TKYXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);