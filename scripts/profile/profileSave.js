// scripts/profile/profileSave.js

import { auth, db } from '../firebase.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export async function saveProfile({ fullName, username, bio }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı oturumu yok");

  const ref = doc(db, "users", user.uid);
  await updateDoc(ref, {
    fullName: fullName.trim(),
    username: username.replace(/^@/, '').trim(),
    bio: bio.trim()
  });
}