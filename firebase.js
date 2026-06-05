// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBYNU7wTq9_1-TdIVuG-yxAlKjeFb9Rm_M",
    authDomain: "video-cms-b7c1e.firebaseapp.com",
    projectId: "video-cms-b7c1e",
    storageBucket: "video-cms-b7c1e.firebasestorage.app",
    messagingSenderId: "991575420179",
    appId: "1:991575420179:web:23459a09aa36f868e37ee6",
    measurementId: "G-S9R2HDC5FZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
