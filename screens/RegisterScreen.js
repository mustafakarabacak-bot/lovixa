// screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../src/config/firebaseConfig";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
    gender: "",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, birthDate, gender } = formData;
    if (!firstName || !lastName || !email || !password || !birthDate || !gender) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        birthDate,
        gender,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Başarılı", "Hesabınız oluşturuldu.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput
        style={styles.input}
        placeholder="Ad"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("firstName", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Soyad"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("lastName", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        keyboardType="email-address"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("email", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("password", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Doğum Tarihi (GG/AA/YYYY)"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("birthDate", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cinsiyet"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("gender", val)}
      />
      <TouchableOpacity
