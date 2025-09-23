import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";
import '@/assets/tailwind.css'
import './style.css'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// setelah pinia aktif baru panggil store
const auth = useAuthStore();
if (auth.token) {
  auth.setAuthHeader();
  auth.fetchProfile().catch(() => auth.logout());
}

app.mount("#app");
