<template>
  <div class="p-6 bg-white rounded shadow-md max-w-lg mx-auto">
    <h2 class="text-xl font-semibold mb-4">Create New Task</h2>

    <form @submit.prevent="submitTask">
      <!-- Title -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Title</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Enter task title"
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
        <span v-if="errors.title" class="text-red-500 text-sm">{{ errors.title }}</span>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Description</label>
        <textarea
          v-model="form.description"
          placeholder="Enter task description"
          class="w-full border border-gray-300 rounded px-3 py-2"
        ></textarea>
        <span v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</span>
      </div>

      <!-- Division Dropdown -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Division</label>
        <select
          v-model="form.division"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Select division</option>
          <option v-for="d in divisions" :key="d" :value="d">{{ d }}</option>
        </select>
        <span v-if="errors.division" class="text-red-500 text-sm">{{ errors.division }}</span>
      </div>

      <!-- Team Dropdown -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Team</label>
        <select
          v-model="form.team"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Select team</option>
          <option v-for="t in teams" :key="t" :value="t">{{ t }}</option>
        </select>
        <span v-if="errors.team" class="text-red-500 text-sm">{{ errors.team }}</span>
      </div>

      <!-- Assigned To (filtered by division & team) -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Assign To (optional)</label>
        <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded p-2">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            @click="form.assigned_to = user.id"
            :class="[
              'cursor-pointer px-3 py-2 rounded',
              form.assigned_to === user.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            ]"
          >
            {{ user.email }}
          </div>
          <div v-if="filteredUsers.length === 0" class="text-gray-400 text-sm">No users available</div>
        </div>
        <span v-if="errors.assigned_to" class="text-red-500 text-sm">{{ errors.assigned_to }}</span>
      </div>

      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Submitting...' : 'Create Task' }}
      </button>
    </form>

    <p v-if="successMessage" class="mt-4 text-green-600">{{ successMessage }}</p>
    <p v-if="errorMessage" class="mt-4 text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, computed, watch } from 'vue';

export default {
  name: 'CreateTask',
  setup() {
    const form = reactive({
      title: '',
      description: '',
      division: '',
      team: '',
      assigned_to: '',
    });

    const errors = reactive({});
    const loading = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');
    const users = ref([]);

    const divisions = ref([]);
    const teams = ref([]);

    // Ambil daftar user
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/users');
        users.value = res.data;

        // Ambil daftar unique division & team dari users
        divisions.value = [...new Set(users.value.map(u => u.Division).filter(Boolean))];
        teams.value = [...new Set(users.value.map(u => u.Team).filter(Boolean))];
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    onMounted(fetchUsers);

    // Reset assigned_to saat division atau team berubah
    watch([() => form.division, () => form.team], () => {
      form.assigned_to = '';
    });

    // Filter user berdasarkan division & team
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const divisionMatch = form.division
          ? user.Division?.trim() === form.division.trim()
          : true;
        const teamMatch = form.team
          ? user.Team?.trim() === form.team.trim()
          : true;
        return divisionMatch && teamMatch;
      });
    });

    const submitTask = async () => {
      loading.value = true;
      Object.keys(errors).forEach(k => (errors[k] = ''));
      successMessage.value = '';
      errorMessage.value = '';

      try {
        await axios.post('/tasks', {
          title: form.title,
          description: form.description,
          division: form.division, // sesuai kolom tasks.division
          team: form.team,         // sesuai kolom tasks.team
          assigned_to: form.assigned_to,
        });

        successMessage.value = 'Task created successfully!';

        // Reset form
        form.title = '';
        form.description = '';
        form.division = '';
        form.team = '';
        form.assigned_to = '';
      } catch (err) {
        if (err.response && err.response.status === 422) {
          const respErrors = err.response.data.errors;
          Object.keys(respErrors).forEach(key => {
            errors[key] = respErrors[key][0];
          });
        } else {
          errorMessage.value = 'Something went wrong!';
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      errors,
      loading,
      submitTask,
      successMessage,
      errorMessage,
      divisions,
      teams,
      filteredUsers,
    };
  },
};
</script>

<style scoped>
/* Optional scrollbar style untuk assigned to list */
div[max-height]::-webkit-scrollbar {
  width: 6px;
}
div[max-height]::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
