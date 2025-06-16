// login.js
import { auth }                             from "./firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// --- DOM bağlama ----------------------------------------------------------
const emailEl   = document.getElementById("email");
const passEl    = document.getElementById("password");
const loginBtn  = document.getElementById("login-btn");
const googleBtn = document.getElementById("google-btn");

// --- Email / Şifre --------------------------------------------------------
loginBtn.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  const pass  = passEl.value;

  if (!email || !pass) {
    alert("Lütfen e-posta ve şifre giriniz.");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    location.href = "dashboard.html";
  } catch (err) {
    alert("Giriş başarısız: " + err.code);
    console.error("[LOGIN]", err);
  }
});

// --- Google OAuth --------------------------------------------------------
googleBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    location.href = "dashboard.html";
  } catch (err) {
    alert("Google giriş hatası: " + err.code);
    console.error("[GOOGLE LOGIN]", err);
  }
});