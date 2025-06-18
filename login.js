import { loginWithEmailOrUsername, loginWithGoogle } from "./auth.js";

document.getElementById("login-btn").addEventListener("click", () => {
  const id = document.getElementById("identifier").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!id || !pass) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  loginWithEmailOrUsername(id, pass)
    .then(() => {
      window.location.href = "/dashboard.html";
    })
    .catch((err) => {
      alert("Hata: " + err.message);
    });
});

document.getElementById("google-btn").addEventListener("click", () => {
  loginWithGoogle()
    .then(() => {
      window.location.href = "/dashboard.html";
    })
    .catch((err) => {
      alert("Google ile giriş başarısız: " + err.message);
    });
});