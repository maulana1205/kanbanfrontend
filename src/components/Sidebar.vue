<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: !isOpen }]">
      <div class="brand">
        <span v-if="isOpen">Admin Panel</span>
      </div>

      <!-- Menu utama -->
      <nav class="menu">
        <router-link to="/admin/dashboard" class="menu-item" active-class="active">
          <i data-feather="home"></i>
          <span v-if="isOpen">Dashboard</span>
        </router-link>

        <router-link to="/admin/users" class="menu-item" active-class="active">
          <i data-feather="users"></i>
          <span v-if="isOpen">Users</span>
        </router-link>

        <router-link to="/admin/reports" class="menu-item" active-class="active">
          <i data-feather="file-text"></i>
          <span v-if="isOpen">Reports</span>
        </router-link>

        <router-link to="/admin/register" class="menu-item" active-class="active">
          <i data-feather="user-plus"></i>
          <span v-if="isOpen">Register Admin</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main" :class="{ collapsed: !isOpen }">
      <!-- Navbar -->
      <nav class="navbar flex justify-between items-center mb-6 p-2 bg-blue-600 shadow rounded text-white">
        <div class="flex items-center">
          <button class="toggle-btn mr-3 bg-white text-blue-600" @click="isOpen = !isOpen">
            <i data-feather="menu"></i>
          </button>
        </div>

        <div class="relative">
          <button @click="toggleUserMenu" class="flex items-center space-x-2 text-white">
  <img
    :src="user?.avatar ?? `https://ui-avatars.com/api/?name=${user?.Name ?? user?.Name}&background=0D8ABC&color=fff`"
    class="w-8 h-8 rounded-full object-cover border-2 border-white"
  />
  <span class="text-white font-medium ml-2">{{ user?.Name ?? user?.Name }}</span>
  <i data-feather="chevron-down" class="w-4 h-4"></i>
</button>

          <div v-if="showUserMenu" class="absolute right-0 mt-2 w-40 bg-white shadow rounded z-50">
            <router-link to="/admin/profile" class="block px-4 py-2 hover:bg-gray-100 text-gray-800">Profile</router-link>
            <button @click="logout" class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
          </div>
        </div>
      </nav>

      <!-- Page content -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import feather from "feather-icons";

const isOpen = ref(true);
const showUserMenu = ref(false);
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const user = auth.user;

function logout() {
  auth.logout();
  router.push("/login");
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

onMounted(() => nextTick(() => feather.replace()));
watch(() => route.fullPath, () => nextTick(() => feather.replace()));
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: #111827;
  color: #f9fafb;
  padding: 1.5rem 1rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 70px;
}

.brand {
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.menu {
  flex-grow: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.menu-item:hover {
  background: #1f2937;
  color: #f9fafb;
}

.menu-item.active {
  background: #2563eb;
  color: white;
}

/* Main Content */
.main {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  padding: 1rem;
  background: #f9fafb;
  min-height: 100vh;
}

.main.collapsed {
  margin-left: 70px;
}

/* Toggle button */
.toggle-btn {
  background: white;
  border: none;
  color: #2563eb;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2563eb;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: white;
}

.navbar h1,
.navbar span {
  color: white;
}
</style>
