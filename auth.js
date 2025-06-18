import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyB2CadxMwGT9Li0P5aHGorGh07ZxYqx6_o",
  authDomain: "fresh-462110.firebaseapp.com",
  projectId: "fresh-462110",
  storageBucket: "fresh-462110.firebasestorage.app",
  messagingSenderId: "1070639256758",
  appId: "1:1070639256758:web:630db0f0134525e603c217",
  measurementId: "G-SN6L5QJXNC"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Oturumun tarayıcıda kalıcı olmasını sağla
setPersistence(auth, browserLocalPersistence);

// Google sağlayıcısı
const provider = new GoogleAuthProvider();

// E-posta ile kullanıcı kaydı
export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// E-posta veya kullanıcı adı ile giriş
export function loginWithEmailOrUsername(identifier, password) {
  // Şimdilik sadece e-posta ile giriş yapar.
  // Kullanıcı adı desteği eklenecekse burada Firestore sorgusu gerekir.
  return signInWithEmailAndPassword(auth, identifier, password);
}

// Google ile oturum açma
export function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

// Kullanıcının oturum durumunu izle
export function watchAuthState(callback) {
  onAuthStateChanged(auth, callback);
}

// Oturumu kapat
export function logout() {
  return signOut(auth);
}