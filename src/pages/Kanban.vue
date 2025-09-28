<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">My Tasks</h1>
    <p class="mt-2 text-gray-600">Welcome, {{ auth.user?.Name }}</p>

    <div class="kanban-board mt-6">
      <div v-for="col in columns" :key="col.status" class="kanban-column">
        <h2 class="text-lg font-semibold mb-3">{{ col.label }}</h2>

        <div
          v-for="task in tasksByStatus[col.status]"
          :key="task.id"
          class="kanban-card"
        >
          <p class="font-medium">{{ task.title }}</p>
          <p class="text-sm text-gray-500" v-if="task.description">
            {{ task.description }}
          </p>

          <small class="block mt-1 text-xs">
            ⚡ Priority: {{ task.priority ?? "Normal" }}
          </small>

          <!-- SLA dengan Over/On SLA -->
          <small class="block mt-1 text-xs">
            ⏱ SLA: {{ task.sla ?? "-" }} hari
            <span v-if="task.over_sla_days > 0" class="text-red-500 font-bold">
              (Over SLA {{ task.over_sla_days }} hari)
            </span>
            <span v-else class="text-green-600 font-bold">(On SLA)</span>
          </small>

          <small class="block mt-1 text-xs">
            📌 {{ task.division }} | 👥 {{ task.team ?? "-" }}
          </small>
          <small class="block mt-1 text-xs">
            🏷 Function: {{ task.task_function ?? task.Function ?? "-" }}
          </small>
          <small class="block mt-1 text-xs">
            🗓 {{ task.start_date ?? "-" }} → {{ task.finish_date ?? "-" }}
          </small>
          <small class="block mt-1 text-xs">
            📦 {{ task.qty ?? "-" }} {{ task.uom ?? "" }} | 🏢 {{ task.vendor ?? "-" }}
          </small>
          <small class="block mt-1 text-xs">🔑 FDT ID: {{ task.fdt_id ?? "-" }}</small>

          <div class="mt-2 flex gap-2">
            <button
              v-if="task.status === 'todo'"
              @click="updateTaskStatus(task, 'in_progress')"
              class="px-2 py-1 text-sm bg-blue-500 text-white rounded"
            >
              Start Progress
            </button>
            <button
              v-if="task.status === 'in_progress'"
              @click="updateTaskStatus(task, 'done')"
              class="px-2 py-1 text-sm bg-green-500 text-white rounded"
            >
              Mark as Done
            </button>
          </div>

          <!-- Remark input hanya untuk task over SLA -->
          <div v-if="task.status === 'in_progress' && task.over_sla_days > 0" class="mt-2">
            <textarea
              v-model="task.remark"
              placeholder="Add remark why task is still in progress..."
              class="w-full p-2 border rounded text-sm"
            ></textarea>
            <button
              @click="saveRemark(task)"
              class="mt-2 px-2 py-1 text-sm bg-yellow-500 text-white rounded flex items-center gap-2"
              :disabled="loadingRemark[task.id]"
            >
              <span v-if="loadingRemark[task.id]" class="loader"></span>
              Save Remark
            </button>
          </div>

          <!-- Display remark -->
          <p v-if="task.remark" class="mt-1 text-sm text-red-600">
            📝 {{ task.remark }}
          </p>
        </div>

        <div v-if="tasksByStatus[col.status].length === 0" class="text-gray-400 text-sm mt-2">
          No tasks
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/tasks";
import axios from "@/plugins/axios";

const auth = useAuthStore();
const taskStore = useTaskStore();

const columns = [
  { status: "todo", label: "📋 Todo" },
  { status: "in_progress", label: "⚡ In Progress" },
  { status: "done", label: "✅ Done" },
];

const tasksByStatus = reactive({
  todo: [],
  in_progress: [],
  done: [],
});

const today = new Date().toISOString().slice(0, 10);

// Loading state untuk remark
const loadingRemark = reactive({});

const computeOverSla = (task) => {
  if (!task.sla) return 0;
  const start = task.start_date ? new Date(task.start_date) : new Date(task.created_at);
  const diffTime = new Date() - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays - Number(task.sla);
};

const updateTasksByStatus = () => {
  taskStore.tasks.forEach(t => {
    t.over_sla_days = computeOverSla(t);
  });

  const userTasks = taskStore.tasks.filter(
    (t) => t.assigned_to === auth.user?.id
  );

  tasksByStatus.todo = userTasks
    .filter((t) => t.status === "todo")
    .sort((a, b) => (b.over_sla_days ?? 0) - (a.over_sla_days ?? 0));

  tasksByStatus.in_progress = userTasks
    .filter((t) => t.status === "in_progress")
    .sort((a, b) => (b.over_sla_days ?? 0) - (a.over_sla_days ?? 0));

  tasksByStatus.done = userTasks
    .filter((t) => {
      if (t.status !== "done") return false;
      if (t.over_sla_days > 0) return true;
      const finishedDate = t.updated_at ? t.updated_at.slice(0, 10) : null;
      return finishedDate === today;
    })
    .sort((a, b) => new Date(b.updated_at ?? 0) - new Date(a.updated_at ?? 0));
};

const updateTaskStatus = async (task, newStatus) => {
  const oldStatus = task.status;
  task.status = newStatus;

  try {
    await taskStore.updateStatus(task.id, newStatus, task.remark ?? "");
    updateTasksByStatus();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update task");
    task.status = oldStatus;
    updateTasksByStatus();
  }
};

const saveRemark = async (task) => {
  loadingRemark[task.id] = true;
  try {
    await axios.patch(`/tasks/${task.id}/remark`, { remark: task.remark ?? '' });
    updateTasksByStatus();
    alert('Remark saved successfully');
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save remark');
  } finally {
    loadingRemark[task.id] = false;
  }
};

onMounted(async () => {
  await taskStore.fetchTasks();
  updateTasksByStatus();

  setInterval(async () => {
    await taskStore.fetchTasks();
    updateTasksByStatus();
  }, 60000);
});
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
.kanban-column {
  flex: 1;
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 10px;
  min-height: 200px;
}
.kanban-column h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.kanban-card {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
}
textarea {
  resize: vertical;
}
button {
  cursor: pointer;
}
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
