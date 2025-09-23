<template>
  <div class="auth">
    <h2 class="title">Register</h2>

    <form @submit.prevent="doRegister">
      <div class="form-group">
        <input v-model="form.name" placeholder="Full Name" required />
      </div>

      <div class="form-group">
        <input v-model="form.email" placeholder="Email" type="email" required />
      </div>

      <div class="form-group">
        <input v-model="form.password" placeholder="Password" type="password" required />
      </div>

      <div class="form-group">
        <input v-model="form.password_confirmation" placeholder="Confirm Password" type="password" required />
      </div>

      <div class="form-group">
        <input v-model="form.NIK" placeholder="NIK" />
      </div>

      <div class="form-group">
        <input v-model="form.Division" placeholder="Division" />
      </div>

      <div class="form-group">
        <input v-model="form.Team" placeholder="Team" />
      </div>

      <div class="form-group">
        <input v-model="form.Job_Function_KPI" placeholder="Job Function / KPI" />
      </div>

      <div class="form-group">
        <select v-model="form.role" class="input" required>
          <option disabled value="">-- Pilih Role --</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="leader">Leader</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <button type="submit" :disabled="loading">
        <span v-if="loading">Registering...</span>
        <span v-else>Register</span>
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const form = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  NIK: "",
  Division: "",
  Team: "",
  Job_Function_KPI: "",
  role: "",
  status: "active",
});

const loading = ref(false);
const error = ref(null);
const success = ref(null);

async function doRegister() {
  error.value = null;
  success.value = null;
  loading.value = true;
  try {
    await auth.register(form.value);
    success.value = "Register berhasil!";
    // reset form
    form.value = {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      NIK: "",
      Division: "",
      Team: "",
      Job_Function_KPI: "",
      role: "",
      status: "active",
    };
  } catch (e) {
    error.value =
      e.response?.data?.message || "Register failed, please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

input,
select {
  display: block;
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #2563eb;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  text-align: center;
}

.success {
  margin-top: 1rem;
  color: #16a34a;
  text-align: center;
}
</style>
