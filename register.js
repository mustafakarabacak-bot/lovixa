// register.js
import { auth }                             from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const emailEl   = document.getElementById("email");
const passEl    = document.getElementById("password");
const regBtn    = document.getElementById("register-btn");
const googleBtn = document.getElementById("google-register-btn");

// --- Email / Şifre --------------------------------------------------------
regBtn.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  const pass  = passEl.value;

  if (!email || pass.length < 6) {
    alert("Geçerli e-posta ve min 6 karakter şifre giriniz.");
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    location.href = "dashboard.html";
  } catch (err) {
    alert("Kayıt başarısız: " + err.code);
    console.error("[REGISTER]", err);
  }
});

// --- Google OAuth --------------------------------------------------------
googleBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    location.href = "dashboard.html";
  } catch (err) {
    alert("Google kayıt hatası: " + err.code);
    console.error("[GOOGLE REGISTER]", err);
  }
});