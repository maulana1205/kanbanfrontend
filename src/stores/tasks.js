import { defineStore } from "pinia";
import axios from "@/plugins/axios";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [], // full list
  }),
  getters: {
    byStatus: (state) => (status) => state.tasks.filter(t => t.status === status)
  },
  actions: {
    async fetchTasks() {
      const res = await axios.get("/tasks");
      this.tasks = res.data;
    },
    async addTask(payload) {
      await axios.post("/tasks", payload);
      await this.fetchTasks();
    },
    async updateTask(id, payload) {
      await axios.put(`/tasks/${id}`, payload);
      await this.fetchTasks();
    },
    async deleteTask(id) {
      await axios.delete(`/tasks/${id}`);
      this.tasks = this.tasks.filter(t => t.id !== id);
    },
    async updateStatus(id, status) {
      await axios.patch(`/tasks/${id}/status`, { status });
      await this.fetchTasks();
    }
  }
});
