import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user-info")) || null,
  login: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem("user-info");
    set({ user: null });
  },
}));

export default useAuthStore;
