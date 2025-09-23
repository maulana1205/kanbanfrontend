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

        <router-link to="/admin/tasks" class="menu-item" active-class="active">
          <i data-feather="list"></i>
          <span v-if="isOpen">Tasks</span>
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

      <!-- User menu + Logout -->
      <div class="mt-auto">
        <!-- User profile dropdown -->
        <div class="relative user-menu mb-3">
          <button
            @click.stop="toggleUserMenu"
            class="flex items-center w-full bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700"
          >
            <img
              :src="user?.avatar ?? `https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`"
              class="w-8 h-8 rounded-full object-cover"
            />
            <span v-if="isOpen" class="ml-3 text-sm font-medium text-gray-200">{{ user?.name }}</span>
            <i data-feather="chevron-down" class="w-4 h-4 ml-2 text-gray-400"></i>
          </button>

          <!-- Dropdown -->
          <div
            v-if="showUserMenu"
            class="absolute left-0 bottom-12 w-full bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <router-link
              to="/admin/profile"
              class="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              <i data-feather="user" class="inline-block w-4 h-4 mr-2"></i>
              Profile
            </router-link>
          </div>
        </div>

        <!-- Logout -->
        <div class="logout">
          <button @click="logout">
            <i data-feather="log-out"></i>
            <span v-if="isOpen">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main" :class="{ collapsed: !isOpen }">
      <button class="toggle-btn" @click="isOpen = !isOpen">
        <i data-feather="menu"></i>
      </button>
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

// ambil user dari store
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

.logo {
  width: 30px;
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

.logout {
  margin-top: auto;
}

.logout button {
  width: 100%;
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.logout button:hover {
  background: #dc2626;
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
  background: #2563eb;
  border: none;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
}
</style>
