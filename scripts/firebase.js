// scripts/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2CadxMwGT9Li0P5aHGorGh07ZxYqx6_o",
  authDomain: "fresh-462110.firebaseapp.com",
  projectId: "fresh-462110",
  storageBucket: "fresh-462110.appspot.com",
  messagingSenderId: "1070639256758",
  appId: "1:1070639256758:web:630db0f0134525e603c217",
  measurementId: "G-SN6L5QJXNC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };