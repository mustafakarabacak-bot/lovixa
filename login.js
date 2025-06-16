/*************************
 *  Firebase Konfigürasyon
 *************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDslfjDqEpqQekNxh9e4OqYYkxdf2TUI7E",
  authDomain:        "silicon-park-462509-r3.firebaseapp.com",
  projectId:         "silicon-park-462509-r3",
  storageBucket:     "silicon-park-462509-r3.appspot.com",
  messagingSenderId: "463275849598",
  appId:             "1:463275849598:web:19ffa6e6e5e1ff5077252f"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

/*  Oturum tarayıcı kapanınca da kalsın  */
setPersistence(auth, browserLocalPersistence);

/****************************************************************
 *  E-posta / Şifre Girişi
 ****************************************************************/
document.getElementById("login-btn").addEventListener("click", async () => {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Lütfen e-posta ve şifre girin.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("E-posta/Şifre hatası: " + err.message);
  }
});

/****************************************************************
 *  Google ile Giriş
 ****************************************************************/
document.getElementById("google-btn").addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Google giriş hatası: " + err.message);
    console.error("[Google Sign-In]", err);
  }
});