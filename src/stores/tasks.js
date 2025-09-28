import { defineStore } from "pinia";
import axios from "@/plugins/axios";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
  }),
  getters: {
    byStatus: (state) => (status) => state.tasks.filter(t => t.status === status),
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

    // Update hanya status task
    async updateStatus(id, status) {
      const res = await axios.patch(`/tasks/${id}/status`, { status });
      // Update task lokal
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) this.tasks[index].status = res.data.task.status;
    },

    // Update hanya remark task
    async updateRemark(id, remark) {
      const res = await axios.patch(`/tasks/${id}/remark`, { remark });
      // Update task lokal
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) this.tasks[index].remark = res.data.task.remark;
    }
  }
});
