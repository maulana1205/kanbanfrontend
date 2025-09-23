<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Profil Leader</h2>
    <p><strong>Nama:</strong> {{ auth.user?.name }}</p>
    <p><strong>Email:</strong> {{ auth.user?.email }}</p>
    <p><strong>Role:</strong> {{ auth.user?.role }}</p>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();
</script>
