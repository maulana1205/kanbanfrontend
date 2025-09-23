<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
    <div class="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
      <h2 class="text-3xl font-bold text-center text-white mb-6">
        Welcome Back 👋
      </h2>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-white">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            class="mt-1 w-full rounded-lg border border-white/40 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:ring-2 focus:ring-pink-400 focus:outline-none"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-white">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="mt-1 w-full rounded-lg border border-white/40 bg-white/20 px-3 py-2 text-white placeholder-gray-200 focus:ring-2 focus:ring-pink-400 focus:outline-none"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-300 text-sm text-center">
          {{ error }}
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>🚀 Login</span>
        </button>
      </form>

      <!-- Register Link -->
      <p class="mt-6 text-center text-sm text-gray-200">
        Don’t have an account?
        <router-link to="/register" class="text-yellow-300 hover:underline">
          Sign up
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  email: "",
  password: "",
});

const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(form);

    if (auth.user?.role === "admin") {
      router.push("/admin/dashboard");
    } else if (auth.user?.role === "leader") {
      router.push("/leader/dashboard");
    } else if (auth.user?.role === "manager") {
      router.push("/manager/dashboard");
    } else {
      router.push("/user/kanban");
    }
  } catch (e) {
    error.value = "Invalid email or password!";
  } finally {
    loading.value = false;
  }
};
</script>
