// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// ✅ Auth
import Login from "@/pages/Login.vue";

// ✅ User
import Kanban from "@/pages/Kanban.vue";          // <-- langsung dari pages
import UserProfile from "@/pages/User/Profile.vue";
import UserLayout from "@/layouts/UserLayout.vue";

// ✅ Admin
import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminDashboard from "@/pages/Admin/Dashboard.vue";
import ManageUsers from "@/pages/Admin/ManageUsers.vue";
import AdminProfile from "@/pages/Admin/Profile.vue";
import Register from "@/pages/Admin/Register.vue";

// ✅ Leader
import LeaderLayout from "@/layouts/LeaderLayout.vue";
import LeaderDashboard from "@/pages/Leader/Dashboard.vue";
import LeaderProfile from "@/pages/Leader/Profile.vue";

// ✅ Manager
import ManagerLayout from "@/layouts/ManagerLayout.vue";
import ManagerDashboard from "@/pages/Manager/Dashboard.vue";
import ManagerProfile from "@/pages/Manager/Profile.vue";

const routes = [
  { path: "/login", component: Login },

  // 🔹 Admin
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "dashboard", component: AdminDashboard },
      { path: "users", component: ManageUsers },
      { path: "profile", component: AdminProfile },
      { path: "register", component: Register },
    ],
  },

  // 🔹 Leader
  {
    path: "/leader",
    component: LeaderLayout,
    meta: { requiresAuth: true, role: "leader" },
    children: [
      { path: "dashboard", component: LeaderDashboard },
      { path: "profile", component: LeaderProfile },
      { path: "create-task", component: () => import("@/pages/Leader/CreateTask.vue") },
    ],
  },

  // 🔹 Manager
  {
    path: "/manager",
    component: ManagerLayout,
    meta: { requiresAuth: true, role: "manager" },
    children: [
      { path: "dashboard", component: ManagerDashboard },
      { path: "profile", component: ManagerProfile },
      { path: "create-task", component: () => import("@/pages/Manager/CreateTask.vue") },
    ],
  },

  // 🔹 User
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true, role: "user" },
    children: [
      { path: "profile", component: UserProfile },
      { path: "kanban", component: Kanban },   // ✅ sesuai lokasi file
    ],
  },

  // fallback
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Guard
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (auth.token && !auth.user) {
    try {
      await auth.fetchProfile();
    } catch {
      auth.logout();
    }
  }

  // root redirect
  if (to.path === "/") {
    if (!auth.user) return next("/login");
    if (auth.user.role === "admin") return next("/admin/dashboard");
    if (auth.user.role === "leader") return next("/leader/dashboard");
    if (auth.user.role === "manager") return next("/manager/dashboard");
    return next("/user/kanban");
  }

  // auth check
  if (to.meta.requiresAuth && !auth.token) return next("/login");

  // role check
  if (to.meta.role && auth.user?.role !== to.meta.role) {
    if (auth.user.role === "admin") return next("/admin/dashboard");
    if (auth.user.role === "leader") return next("/leader/dashboard");
    if (auth.user.role === "manager") return next("/manager/dashboard");
    return next("/user/kanban");
  }

  next();
});

export default router;
