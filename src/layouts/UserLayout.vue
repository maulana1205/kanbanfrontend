<template>
  <div class="min-h-screen flex flex-col">
    <NavbarUser title="User Panel" bgColor="bg-purple-600" base="user" />
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavbarUser from "../components/NavbarUser.vue";
</script>
