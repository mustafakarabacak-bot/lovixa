// scripts/profile/uploader.js

import { storage, db, auth } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export async function uploadAvatar(file, callback) {
  const user = auth.currentUser;
  if (!user || !file) return;

  const storageRef = ref(storage, `avatars/${user.uid}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "users", user.uid), {
    photoURL: downloadURL
  });

  if (callback) callback(downloadURL);
}

export async function uploadStory(file, caption = "", callback) {
  const user = auth.currentUser;
  if (!user || !file) return;

  const ext = file.type.startsWith("video") ? "video" : "image";
  const path = `stories/${user.uid}/${Date.now()}-${file.name}`;
  const storyRef = ref(storage, path);

  await uploadBytes(storyRef, file);
  const mediaURL = await getDownloadURL(storyRef);

  await addDoc(collection(db, "stories"), {
    uid: user.uid,
    caption,
    type: ext,
    url: mediaURL,
    createdAt: serverTimestamp()
  });

  if (callback) callback(mediaURL);
}