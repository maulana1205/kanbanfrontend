<template>
  <div class="min-h-screen flex flex-col">
    <Navbar title="Manager Panel" bgColor="bg-blue-600" base="manager" />
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>
