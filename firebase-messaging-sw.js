/*  firebase-messaging-sw.js  |  Lovixa Push Service Worker  */
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

/* ---------- Firebase Init ---------- */
firebase.initializeApp({
  apiKey:            "AIzaSyB2CadxMwGT9Li0P5aHGorGh07ZxYqx6_o",
  authDomain:        "fresh-462110.firebaseapp.com",
  projectId:         "fresh-462110",
  storageBucket:     "fresh-462110.appspot.com",
  messagingSenderId: "1070639256758",
  appId:             "1:1070639256758:web:630db0f0134525e603c217",
  measurementId:     "G-SN6L5QJXNC"
});
const messaging = firebase.messaging();

/* ---------- Mini IndexedDB util ---------- */
const DB_NAME = "lovixa_pref", STORE = "prefs";
function idb(cb){
  return new Promise((res,rej)=>{
    const open=indexedDB.open(DB_NAME,1);
    open.onupgradeneeded=()=>open.result.createObjectStore(STORE);
    open.onsuccess=()=>cb(open.result.transaction(STORE,"readwrite").objectStore(STORE),res);
    open.onerror=e=>rej(e);
  });
}
const getPref = key => idb((st,res)=>res(st.get(key))).then(r=>r?.result);
const setPref = (key,val)=>idb((st,res)=>res(st.put(val,key)));
const addMute  = chatId => getPref("muted").then(m=>setPref("muted",[...(m||[]),chatId]));
const isMuted  = chatId => getPref("muted").then(m=>(m||[]).includes(chatId));

/* ---------- Background Push Handler ---------- */
messaging.onBackgroundMessage(async payload=>{
  const n = payload.notification??{};
  const d = payload.data??{};
  const chatId   = d.chatId || null;
  const nType    = d.type   || "text";      // text | image | follow
  const muted    = chatId ? await isMuted(chatId) : false;
  if(muted) return;                         // sessize alınmış → gösterme

  const title = n.title || "Lovixa";
  const body  = n.body  || (nType==="follow" ? `${d.username || "Bir kullanıcı"} seni takip etti` : "");
  const icon  = n.icon  || "/icons/logo96.png";

  const actions = [
    { action:"reply",     title:"Yanıtla",  type:"text" },
    { action:"markRead",  title:"Okundu"  },
    { action:"mute",      title:"Sessize Al" }
  ];

  self.registration.showNotification(title,{
    body, icon, actions,
    data:{ click_action:n.click_action || d.click_action || "/", chatId, nType }
  });
});

/* ---------- Notification Click / Actions ---------- */
self.addEventListener("notificationclick", event=>{
  const { action, reply } = event;
  const { click_action, chatId } = event.notification.data||{};
  event.notification.close();

  // --- Action: Reply ---
  if(action==="reply" && reply){
    // reply text'i açık sekmeye ilet
    event.waitUntil(
      clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
        for(const c of list){
          c.postMessage({ cmd:"inline-reply", chatId, text:reply });
          if(c.url.includes(`/chat.html`) && "focus" in c) return c.focus();
        }
        return clients.openWindow(`/chat.html?uid=${chatId?.split("_").find(u=>c.url.includes(u))||""}`);
      })
    );
    return;
  }

  // --- Action: Okundu ---
  if(action==="markRead" && chatId){
    event.waitUntil(setPref(`read_${chatId}`, Date.now()));
    return;
  }

  // --- Action: Sessize Al ---
  if(action==="mute" && chatId){
    event.waitUntil(addMute(chatId));
    return;
  }

  /* Default behaviour → pencere aç/focus */
  event.waitUntil(
    clients.matchAll({ type:"window", includeUncontrolled:true }).then(list=>{
      for(const c of list){ if(c.url===click_action && "focus" in c) return c.focus(); }
      return clients.openWindow(click_action);
    })
  );
});
