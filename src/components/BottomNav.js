// components/BottomNav.js
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Home, Search, Plus, Bell, User } from "lucide-react-native";

const BottomNav = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
        <Home color="#fff" size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Explore")}>
        <Search color="#fff" size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("NewPost")}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
        <Bell color="#fff" size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <User color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#222",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    zIndex: 100,
  },
});
