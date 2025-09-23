<!-- src/pages/Admin/Profile.vue -->
<template>
  <div class="profile">
    <h1 class="title">My Profile</h1>

    <div class="card">
      <p><strong>Name:</strong> {{ auth.user?.name }}</p>
      <p><strong>Email:</strong> {{ auth.user?.email }}</p>
      <p><strong>Role:</strong> {{ auth.user?.role }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<style scoped>
.profile {
  padding: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
