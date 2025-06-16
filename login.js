import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Giriş başarılı!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Hata: " + error.message);
  }
});

document.getElementById("google-btn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    alert("Google ile giriş başarılı: " + user.email);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Google giriş hatası: " + error.message);
    console.error(error);
  }
});