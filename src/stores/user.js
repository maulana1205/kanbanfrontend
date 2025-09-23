import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get("/users");
        this.users = data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },

    async createUser(payload) {
      await axiosInstance.post("/users", payload);
      await this.fetchUsers();
    },

    async updateUser(id, payload) {
      await axiosInstance.put(`/users/${id}`, payload);
      await this.fetchUsers();
    },

    async deleteUser(id) {
      await axiosInstance.delete(`/users/${id}`);
      await this.fetchUsers();
    },
  },
});
