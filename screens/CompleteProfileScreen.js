// screens/CompleteProfileScreen.js
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
import { auth, db } from "../src/config/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

const CompleteProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    hobbies: "",
    spotifyCode: "",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleComplete = async () => {
    const { firstName, lastName, birthDate, hobbies, spotifyCode } = formData;

    if (!firstName || !lastName || !birthDate || !hobbies) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        birthDate,
        hobbies,
        spotifyCode,
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Tebrikler!", "Profiliniz tamamlandı.");
      // İleri sayfaya yönlendirme burada yapılır
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilini Tamamla</Text>
      <TextInput
        style={styles.input}
        placeholder="İsim"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("firstName", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Soyisim"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("lastName", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Doğum Tarihi (GG/AA/YYYY)"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("birthDate", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Hobiler / İlgi Alanları"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("hobbies", val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Spotify Kodunuz (isteğe bağlı)"
        placeholderTextColor="#999"
        onChangeText={(val) => handleChange("spotifyCode", val)}
      />
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Tamamla</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CompleteProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    color: "white",
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
