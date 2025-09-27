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

      <!-- Function Dropdown -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Function</label>
        <select
          v-model="form.task_function"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Select function</option>
          <option v-for="f in functions" :key="f" :value="f">{{ f }}</option>
        </select>
        <span v-if="errors.task_function" class="text-red-500 text-sm">{{ errors.task_function }}</span>
      </div>

      <!-- Assigned To -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Assign To (optional)</label>
        <select
          v-model="form.assigned_to"
          class="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select User --</option>
          <option
            v-for="user in filteredUsers"
            :key="user.id"
            :value="user.id"
          >
            {{ user.email }}
          </option>
        </select>
        <span v-if="errors.assigned_to" class="text-red-500 text-sm">{{ errors.assigned_to }}</span>
      </div>

      <!-- Priority -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Priority</label>
        <select v-model="form.priority" class="w-full border border-gray-300 rounded px-3 py-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <!-- Start Date -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Start Date</label>
        <input v-model="form.start_date" type="date" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- SLA -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">SLA (days)</label>
        <input v-model.number="form.sla" type="number" min="1" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- Qty -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Qty</label>
        <input v-model.number="form.qty" type="number" min="0" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- UOM -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">UOM</label>
        <input v-model="form.uom" type="text" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- Vendor -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">Vendor</label>
        <input v-model="form.vendor" type="text" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- FDT ID -->
      <div class="mb-4">
        <label class="block mb-1 font-medium">FDT ID</label>
        <input v-model="form.fdt_id" type="text" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>

      <!-- Submit -->
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
      task_function: '',
      assigned_to: '',
      priority: 'medium',
      start_date: '',
      sla: null,
      qty: null,
      uom: '',
      vendor: '',
      fdt_id: '',
    });

    const errors = reactive({});
    const loading = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');
    const users = ref([]);
    const divisions = ref([]);
    const teams = ref([]);
    const functions = ref([]);
    const currentUserRole = ref('');

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('/profile'); 
        currentUserRole.value = res.data.role;
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/users');
        users.value = res.data;
        divisions.value = [...new Set(users.value.map(u => u.Division || u.division).filter(Boolean))];
        teams.value = [...new Set(users.value.map(u => u.Team || u.team).filter(Boolean))];
        functions.value = [...new Set(users.value.map(u => u.Function || u.function).filter(Boolean))];
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    onMounted(() => {
      fetchUsers();
      fetchCurrentUser();
    });

    watch([() => form.division, () => form.team, () => form.task_function], () => {
      form.assigned_to = '';
    });

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const division = user.Division || user.division;
        const team = user.Team || user.team;
        const func = user.Function || user.function;

        const divisionMatch = form.division ? division?.trim() === form.division.trim() : true;
        const teamMatch = form.team ? team?.trim() === form.team.trim() : true;
        const functionMatch = form.task_function ? func?.trim() === form.task_function.trim() : true;

        let roleMatch = true;
        if (currentUserRole.value === 'leader') roleMatch = user.role === 'user';
        else if (currentUserRole.value === 'manager') roleMatch = user.role === 'leader';

        return divisionMatch && teamMatch && functionMatch && roleMatch;
      });
    });

    const submitTask = async () => {
      loading.value = true;
      Object.keys(errors).forEach(k => (errors[k] = ''));
      successMessage.value = '';
      errorMessage.value = '';

      try {
        await axios.post('/tasks', form);
        successMessage.value = 'Task created successfully!';
        Object.assign(form, {
          title: '',
          description: '',
          division: '',
          team: '',
          task_function: '',
          assigned_to: '',
          priority: 'medium',
          start_date: '',
          sla: null,
          qty: null,
          uom: '',
          vendor: '',
          fdt_id: '',
        });
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
      functions,
      filteredUsers,
    };
  },
};
</script>

<style scoped>
div[max-height]::-webkit-scrollbar {
  width: 6px;
}
div[max-height]::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
