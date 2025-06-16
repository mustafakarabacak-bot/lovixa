// firebase.js
import { initializeApp }   from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth }         from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore }    from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDslfjDqEpqQekNxh9e4OqYYkxdf2TUI7E",
  authDomain:        "silicon-park-462509-r3.firebaseapp.com",
  projectId:         "silicon-park-462509-r3",
  storageBucket:     "silicon-park-462509-r3.appspot.com",
  messagingSenderId: "463275849598",
  appId:             "1:463275849598:web:19ffa6e6e5e1ff5077252f"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ✨ Oturum kalıcılığı – tarayıcı kapansa da token saklanır
await setPersistence(auth, browserLocalPersistence);