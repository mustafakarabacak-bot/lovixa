// firebase.js (auth hariç sadece storage + firestore modülleri)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey:            "AIzaSyB2CadxMwGT9L10P5aHGorGh07ZxYqx6_o",
  authDomain:        "fresh-462110.firebaseapp.com",
  projectId:         "fresh-462110",
  storageBucket:     "fresh-462110.appspot.com",
  messagingSenderId: "1070639256758",
  appId:             "1:1070639256758:web:630db0f0134525e603c217",
  measurementId:     "G-W5CLG9SJXC"
};

// Başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 🔼 Fotoğraf yükleme
export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// 📥 Kullanıcı profil verisi kaydet
export async function saveUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data);
}

// 📤 Kullanıcı profil verisi al
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}