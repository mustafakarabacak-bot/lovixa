import { registerWithEmail } from "./auth.js";

document.getElementById("register-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  registerWithEmail(email, password)
    .then(() => {
      alert("Kayıt başarılı! Yönlendiriliyorsunuz...");
      window.location.href = "/dashboard.html";
    })
    .catch((error) => {
      alert("Hata: " + error.message);
    });
});