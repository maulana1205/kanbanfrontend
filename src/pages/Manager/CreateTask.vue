<template>
  <div class="p-6 bg-white rounded shadow-md max-w-lg mx-auto">
    <h2 class="text-xl font-semibold mb-4">Create New Task</h2>

    <form @submit.prevent="submitTask">
      <!-- Title -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Title</label>
        <input v-model="form.title" type="text" class="w-full border rounded px-3 py-2" required />
      </div>

      <!-- Description -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Description</label>
        <textarea v-model="form.description" class="w-full border rounded px-3 py-2" rows="3"></textarea>
      </div>

      <!-- Division -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Division</label>
        <select v-model="form.division" class="w-full border rounded px-3 py-2" required>
          <option disabled value="">-- Select Division --</option>
          <option v-for="division in divisions" :key="division" :value="division">{{ division }}</option>
        </select>
      </div>

      <!-- Team -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Team</label>
        <select v-model="form.team" class="w-full border rounded px-3 py-2" required>
          <option disabled value="">-- Select Team --</option>
          <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
        </select>
      </div>

      <!-- Assign To -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Assign To (Email)</label>
        <select v-model="form.assigned_to" class="w-full border rounded px-3 py-2">
          <option disabled value="">-- Select User --</option>
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }}</option>
        </select>
      </div>

      <!-- Function -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Function</label>
        <input v-model="form.task_function" type="text" class="w-full border rounded px-3 py-2" />
      </div>

      <!-- Detail Task -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Detail Task</label>
        <textarea v-model="form.detail_task" class="w-full border rounded px-3 py-2" rows="2"></textarea>
      </div>

      <!-- Priority -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Priority</label>
        <select v-model="form.priority" class="w-full border rounded px-3 py-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <!-- Submit -->
      <div class="mt-6">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Task
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const form = ref({
  title: "",
  description: "",
  division: "",
  team: "",
  assigned_to: "",
  task_function: "",
  detail_task: "",
  priority: "medium",
  start_date: "",
  sla: 1,
  progress: 0,
  uom: "",
  qty: 0,
  vendor: "",
  fdt_id: null,
});

const divisions = ref(["IT", "HR", "Finance"]);
const teams = ref(["Team A", "Team B", "Team C"]);
const users = ref([]);

const fetchUsers = async () => {
  try {
    const res = await axios.get("/api/users");
    users.value = res.data;
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
};

const submitTask = async () => {
  try {
    await axios.post("/api/tasks", form.value);
    alert("Task created successfully!");
    form.value = {
      title: "",
      description: "",
      division: "",
      team: "",
      assigned_to: "",
      task_function: "",
      detail_task: "",
      priority: "medium",
      start_date: "",
      sla: 1,
      progress: 0,
      uom: "",
      qty: 0,
      vendor: "",
      fdt_id: null,
    };
  } catch (err) {
    console.error("Error creating task", err);
  }
};

onMounted(() => fetchUsers());
</script>
