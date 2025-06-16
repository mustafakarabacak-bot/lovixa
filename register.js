import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDslfjDqEpqQekNxh9e4OqYYkxdf2TUI7E",
  authDomain: "silicon-park-462509-r3.firebaseapp.com",
  projectId: "silicon-park-462509-r3",
  storageBucket: "silicon-park-462509-r3.appspot.com",
  messagingSenderId: "463275849598",
  appId: "1:463275849598:web:19ffa6e6e5e1ff5077252f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set successfully");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

document.getElementById("register-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Lütfen e-posta ve şifre girin.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Kayıt hatası: " + err.message);
    console.error("[Email Sign-Up]", err);
  }
});

document.getElementById("google-register-btn").addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Google ile kayıt hatası: " + err.message);
    console.error("[Google Sign-Up]", err);
  }
});