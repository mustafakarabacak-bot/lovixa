import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loginUser = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const login = async (inputs) => {
    setLoading(true);
    setError(null);

    try {
      if (!inputs.email || !inputs.password) {
        throw new Error("E-posta ve şifre alanları zorunludur.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, inputs.email, inputs.password);
      const user = userCredential.user;

      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Kullanıcı bulunamadı.");
      }

      const userDoc = userSnap.data();
      localStorage.setItem("user-info", JSON.stringify(userDoc));
      loginUser(userDoc);
      navigate("/home"); // Giriş sonrası ana sayfaya yönlendirme
    } catch (err) {
      setError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, login };
};

export default useLogin;
