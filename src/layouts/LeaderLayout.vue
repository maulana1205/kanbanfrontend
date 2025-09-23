<template>
  <div class="min-h-screen flex flex-col">
    <Navbar title="Leader Panel" bgColor="bg-green-600" base="leader" />
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>
