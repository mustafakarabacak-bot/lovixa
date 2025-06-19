// /scripts/fcm.js  | Lovixa FCM Client Handler
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getMessaging, getToken, onMessage,
  deleteToken
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./firebase.js";

// ✅ FCM Setup
const app       = initializeApp({ /* config burada değilse boş bırak */ });
const auth      = getAuth(app);
const messaging = getMessaging(app);

navigator.serviceWorker.register("/firebase-messaging-sw.js")
.then(reg => {
  messaging.useServiceWorker(reg);
  console.log("[FCM] Servis worker başarıyla bağlandı.");

  onAuthStateChanged(auth, async user => {
    if (!user) return;
    try {
      const token = await getToken(messaging, {
        vapidKey: "LJ4RzUe_DE4S4xC-gVyc1MZIrJTePbLfKJDyudWbzAg",
        serviceWorkerRegistration: reg
      });

      if (token) {
        console.log("[FCM] Token alındı:", token);
        await updateDoc(doc(db, "users", user.uid), { fcmToken: token });
      } else {
        console.warn("[FCM] Token alınamadı, izin gerek.");
      }
    } catch (err) {
      console.error("[FCM] Token alma hatası:", err);
    }
  });
}).catch(err => console.error("[FCM] Servis worker hatası:", err));

// ✅ Foreground mesajlar için push gösterimi
onMessage(messaging, payload => {
  const { title, body, icon, click_action } = payload.notification || {};
  const n = new Notification(title || "Lovixa", {
    body: body || "",
    icon: icon || "/icons/logo96.png",
    data: { click_action: click_action || "/" }
  });

  n.onclick = () => window.open(n.data.click_action, "_blank");
});
