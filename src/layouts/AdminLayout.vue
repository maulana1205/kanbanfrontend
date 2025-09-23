<template>
  <div class="layout">
    <Sidebar />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import feather from "feather-icons";

const isOpen = ref(true);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  document.querySelector(".sidebar")?.classList.toggle("collapsed");
};

onMounted(() => {
  nextTick(() => feather.replace());
});
</script>

