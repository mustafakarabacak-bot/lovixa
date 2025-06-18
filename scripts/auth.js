// auth.js

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

import { app } from './firebase.js';  // firebase.js içinde initializeApp yapılmış olmalı

// Auth servisini başlat
const auth = getAuth(app);

// Oturumun kalıcı olması sağlanır
await setPersistence(auth, browserLocalPersistence);

// Google auth sağlayıcısı
const provider = new GoogleAuthProvider();

// E-posta ile kayıt
export async function registerWithEmail(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// E-posta (veya sonra ekleyeceğimiz kullanıcı adı) ile giriş
export async function loginWithEmailOrUsername(identifier, password) {
  // Şu an sadece e-posta destekleniyor
  return await signInWithEmailAndPassword(auth, identifier, password);
}

// Google ile giriş
export async function loginWithGoogle() {
  return await signInWithPopup(auth, provider);
}

// Oturumu kapat
export async function logout() {
  return await signOut(auth);
}

// Kullanıcının oturum durumunu dinle
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
