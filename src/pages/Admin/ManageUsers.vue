<template>
  <div>
    <h1 class="text-xl font-bold mb-4">Manage Users</h1>

    <!-- Create User -->
    <form @submit.prevent="handleCreate" class="mb-6 space-y-3">
      <input v-model="form.NIK" placeholder="NIK" class="input" />
      <input v-model="form.Name" placeholder="Name" class="input" />
      <input v-model="form.Division" placeholder="Division" class="input" />
      <input v-model="form.Team" placeholder="Team" class="input" />
      <input v-model="form.Job_Function_KPI" placeholder="Job Function KPI" class="input" />
      <input v-model="form.status" placeholder="Status" class="input" />
      <input v-model="form.region" placeholder="Region" class="input" />
      <input v-model="form.email" placeholder="Email" type="email" class="input" />
      <input v-model="form.password" placeholder="Password" type="password" class="input" />
      <select v-model="form.role" class="input">
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="leader">Leader</option>
        <option value="manager">Manager</option>
      </select>
      <button type="submit" class="btn">Add User</button>
    </form>

    <!-- User Table -->
    <table class="table-auto w-full border">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2">NIK</th>
          <th class="p-2">Name</th>
          <th class="p-2">Division</th>
          <th class="p-2">Email</th>
          <th class="p-2">Role</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in store.users" :key="user.id" class="border-t">
          <td class="p-2">{{ user.NIK }}</td>
          <td class="p-2">{{ user.Name }}</td>
          <td class="p-2">{{ user.Division }}</td>
          <td class="p-2">{{ user.email }}</td>
          <td class="p-2">{{ user.role }}</td>
          <td class="p-2">
            <button class="btn-edit" @click="editUser(user)">Edit</button>
            <button class="btn-delete" @click="store.deleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Modal -->
    <div v-if="editingUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-96">
        <h2 class="text-lg font-semibold mb-4">Edit User</h2>
        <input v-model="editForm.Name" placeholder="Name" class="input" />
        <input v-model="editForm.email" placeholder="Email" type="email" class="input" />
        <input v-model="editForm.password" placeholder="New Password (optional)" type="password" class="input" />
        <button class="btn" @click="handleUpdate">Save</button>
        <button class="btn-cancel" @click="editingUser = null">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";

const store = useUserStore();

const form = ref({
  NIK: "",
  Name: "",
  Division: "",
  Team: "",
  Job_Function_KPI: "",
  status: "",
  region: "",
  email: "",
  password: "",
  role: "user",
});

const editingUser = ref(null);
const editForm = ref({});

function editUser(user) {
  editingUser.value = user;
  editForm.value = { ...user, password: "" };
}

async function handleCreate() {
  await store.createUser(form.value);
  form.value = { NIK: "", Name: "", Division: "", Team: "", Job_Function_KPI: "", status: "", region: "", email: "", password: "", role: "user" };
}

async function handleUpdate() {
  await store.updateUser(editingUser.value.id, editForm.value);
  editingUser.value = null;
}

onMounted(() => {
  store.fetchUsers();
});
</script>

<style scoped>
.input {
  display: block;
  width: 100%;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 6px;
}
.btn {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-right: 0.5rem;
}
.btn-edit {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  margin-right: 0.25rem;
}
.btn-delete {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}
.btn-cancel {
  background: #6b7280;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  margin-left: 0.25rem;
}
</style>
