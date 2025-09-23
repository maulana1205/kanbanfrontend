import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";

axios.defaults.baseURL = "http://127.0.0.1:8000/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    setAuthHeader() {
      if (this.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    },

    async login(credentials) {
      try {
        const res = await axios.post("/login", credentials);
        this.token = res.data.token;
        localStorage.setItem("token", this.token);

        this.setAuthHeader();
        await this.fetchProfile();

      } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
      }
    },

    async fetchProfile() {
      this.setAuthHeader();
      const res = await axios.get("/profile");
      this.user = res.data;
    },

    async logout() {
      try {
        this.setAuthHeader();
        await axios.post("/logout");
      } catch (e) {
        console.warn("Logout error:", e.response?.data || e.message);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
        this.setAuthHeader();

        // ✅ Redirect aman tanpa loop
        if (router.currentRoute.value.path !== "/login") {
          await router.replace("/login");
        }
      }
    },
  },
});
