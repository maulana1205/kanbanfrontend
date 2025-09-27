<template>
  <header :class="`${bgColor} text-white px-6 py-4 flex justify-between items-center`">
    <!-- Kiri: Title + Dashboard -->
    <div class="flex items-center space-x-4">
      <h1 class="text-lg font-bold">{{ title }}</h1>
      <router-link
        :to="`/${base}/dashboard`"
        class="text-sm font-medium hover:underline"
      >
        Dashboard
      </router-link>
    </div>

    <!-- Kanan: User Dropdown -->
    <div class="relative">
      <button
        @click="toggleUserMenu"
        class="flex items-center bg-gray-50 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100"
      >
        <img
  :src="user?.avatar
    ? `${user.avatar}?t=${Date.now()}`
    : `https://ui-avatars.com/api/?name=${user?.Name}&background=0D8ABC&color=fff`"
  class="w-8 h-8 rounded-full object-cover"
/>

        <span class="ml-2 text-sm font-medium">{{ user?.Name }}</span>
        <i data-feather="chevron-down" class="w-4 h-4 ml-2 text-gray-500"></i>
      </button>

      <div
        v-if="showUserMenu"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
      >
        <router-link
          :to="`/${base}/profile`"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Profil
        </router-link>
        <div class="border-t border-gray-100 my-1"></div>
        <a
          href="#"
          @click.prevent="handleLogout"
          class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
        >
          Keluar
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import feather from "feather-icons";

defineProps({
  title: String,
  bgColor: String,
  base: String
});

const auth = useAuthStore();
const router = useRouter();
const user = auth.user;
const showUserMenu = ref(false);

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function handleLogout() {
  auth.logout();
  router.push("/login");
}

onMounted(() => {
  feather.replace();
});
</script>
