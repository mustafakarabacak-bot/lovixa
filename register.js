import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzUyATE4CUGvtIeZ5pf0hLreaFF4p3rSM",
  authDomain: "silicon-park-462509-r3.firebaseapp.com",
  projectId: "silicon-park-462509-r3",
  storageBucket: "silicon-park-462509-r3.appspot.com",
  messagingSenderId: "463275849598",
  appId: "1:463275849598:web:19ffa6e6e5e1ff5077252f",
  measurementId: "G-8CTH7CQ2SS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("register-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Lütfen e-posta ve şifre girin.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Kayıt başarılı!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Kayıt hatası:", error);
    alert("Kayıt başarısız: " + error.message);
  }
});