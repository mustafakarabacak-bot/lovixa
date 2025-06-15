// screens/DashboardScreen.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import BottomNav from "../components/BottomNav";

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hikaye Barı */}
        <View style={styles.storiesContainer}>
          <Text style={styles.sectionTitle}>Hikayeler</Text>
          {/* Buraya yatay hikaye bileşeni eklenecek */}
        </View>

        {/* Önerilen Kullanıcılar */}
        <View style={styles.recommendedContainer}>
          <Text style={styles.sectionTitle}>Önerilen Kullanıcılar</Text>
          {/* Buraya önerilen kullanıcı kartları eklenecek */}
        </View>

        {/* Gönderi Akışı */}
        <View style={styles.feedContainer}>
          <Text style={styles.sectionTitle}>Gönderiler</Text>
          {/* Buraya gönderi kartları eklenecek */}
        </View>
      </ScrollView>

      {/* Alt Navigasyon */}
      <BottomNav />
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollContent: {
    paddingBottom: 80, // Alt navigasyon boşluğu
  },
  sectionTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    padding: 16,
  },
  storiesContainer: {
    marginBottom: 10,
  },
  recommendedContainer: {
    marginBottom: 10,
  },
  feedContainer: {
    marginBottom: 10,
  },
});
