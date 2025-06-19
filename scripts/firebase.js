// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { db } from '../scripts/firebase.js";
const firebaseConfig = {
  apiKey: "AIzaSyB2CadxMwGT9Li0P5aHGorGh07ZxYqx6_o",
  authDomain: "fresh-462110.firebaseapp.com",
  projectId: "fresh-462110",
  storageBucket: "fresh-462110.appspot.com",
  messagingSenderId: "1070639256758",
  appId: "1:1070639256758:web:630db0f0134525e603c217",
  measurementId: "G-SN6L5QJXNC"
};

// Uygulamayı başlat
export const app = initializeApp(firebaseConfig);
