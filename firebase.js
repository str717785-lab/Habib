// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYNU7wTq9_1-TdIVuG-yxAlKjeFb9Rm_M",
  authDomain: "video-cms-b7c1e.firebaseapp.com",
  projectId: "video-cms-b7c1e",
  storageBucket: "video-cms-b7c1e.firebasestorage.app",
  messagingSenderId: "991575420179",
  appId: "1:991575420179:web:23459a09aa36f868e37ee6",
  measurementId: "G-S9R2HDC5FZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
