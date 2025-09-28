// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// ✅ Auth
import Login from "@/pages/Login.vue";

// ✅ User
import Kanban from "@/pages/Kanban.vue";
import UserProfile from "@/pages/User/Profile.vue";
import UserLayout from "@/layouts/UserLayout.vue";

// ✅ Admin
import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminDashboard from "@/pages/Admin/Dashboard.vue";
import ManageUsers from "@/pages/Admin/ManageUsers.vue";
import AdminProfile from "@/pages/Admin/Profile.vue";
import Register from "@/pages/Admin/Register.vue";
import Reports from "@/pages/Admin/Reports.vue";


// ✅ Leader
import LeaderLayout from "@/layouts/LeaderLayout.vue";
import LeaderDashboard from "@/pages/Leader/Dashboard.vue";
import LeaderProfile from "@/pages/Leader/Profile.vue";

// ✅ Manager
import ManagerLayout from "@/layouts/ManagerLayout.vue";
import ManagerDashboard from "@/pages/Manager/Dashboard.vue";
import ManagerProfile from "@/pages/Manager/Profile.vue";

const routes = [
  { path: "/login", name: "login", component: Login },

  // 🔹 Admin
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "dashboard", name: "admin.dashboard", component: AdminDashboard },
      { path: "users", name: "admin.users", component: ManageUsers },
      { path: "profile", name: "admin.profile", component: AdminProfile },
      { path: "register", name: "admin.register", component: Register },
      { path: "reports", name: "Reports", component: Reports }
    ],
  },

  // 🔹 Leader
  {
    path: "/leader",
    component: LeaderLayout,
    meta: { requiresAuth: true, role: "leader" },
    children: [
      { path: "dashboard", name: "leader.dashboard", component: LeaderDashboard },
      { path: "profile", name: "leader.profile", component: LeaderProfile },
      {
        path: "create-task",
        name: "leader.createTask",
        component: () => import("@/pages/Leader/CreateTask.vue"),
      },
    ],
  },

  // 🔹 Manager
  {
    path: "/manager",
    component: ManagerLayout,
    meta: { requiresAuth: true, role: "manager" },
    children: [
      { path: "dashboard", name: "manager.dashboard", component: ManagerDashboard },
      { path: "profile", name: "manager.profile", component: ManagerProfile },
      {
        path: "create-task",
        name: "manager.createTask",
        component: () => import("@/pages/Manager/CreateTask.vue"),
      },
    ],
  },

  // 🔹 User
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true, role: "user" },
    children: [
      { path: "profile", name: "user.profile", component: UserProfile },
      { path: "kanban", name: "user.kanban", component: Kanban },
    ],
  },

  // fallback → arahkan ke login
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Guard
let redirecting = false; // 🔑 tambahan untuk cegah loop

router.beforeEach(async (to, from, next) => {
  if (redirecting) {
    redirecting = false;
    return next(false); // stop biar ga infinite
  }

  const auth = useAuthStore();

  // debug log
  console.log("➡️ navigating:", from.fullPath, "→", to.fullPath);

  // ambil profile jika token ada tapi user kosong
  if (auth.token && !auth.user) {
    try {
      await auth.fetchProfile();
    } catch {
      auth.logout();
    }
  }

  // root redirect
  if (to.path === "/") {
    if (!auth.user) return next({ name: "login" });
    redirecting = true;
    if (auth.user.role === "admin") return next({ name: "admin.dashboard" });
    if (auth.user.role === "leader") return next({ name: "leader.dashboard" });
    if (auth.user.role === "manager") return next({ name: "manager.dashboard" });
    if (auth.user.role === "user") return next({ name: "user.kanban" });
  }

  // auth check
  if (to.meta.requiresAuth && !auth.token) {
    if (to.name !== "login") {
      redirecting = true;
      return next({ name: "login" });
    }
  }

  // role check
  if (to.meta.role && auth.user?.role !== to.meta.role) {
    redirecting = true;
    if (auth.user.role === "admin") return next({ name: "admin.dashboard" });
    if (auth.user.role === "leader") return next({ name: "leader.dashboard" });
    if (auth.user.role === "manager") return next({ name: "manager.dashboard" });
    if (auth.user.role === "user") return next({ name: "user.kanban" });
  }

  return next();
});

export default router;
