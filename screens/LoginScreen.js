// screens/LoginScreen.js
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../src/config/firebaseConfig";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: Constants.expoConfig.extra.GOOGLE_EXPO_CLIENT_ID,
    androidClientId: Constants.expoConfig.extra.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: Constants.expoConfig.extra.GOOGLE_IOS_CLIENT_ID,
    webClientId: Constants.expoConfig.extra.GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/icons/app-icon.png")} style={styles.logo} />
      <Text style={styles.title}>Lovixa</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Google ile Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    color: "white",
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#DB4437",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
