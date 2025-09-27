<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">My Tasks</h1>
    <p class="mt-2 text-gray-600">Welcome, {{ auth.user?.Name }}</p>

    <div class="kanban-board mt-6">
      <div v-for="col in columns" :key="col.status" class="kanban-column">
        <h2 class="text-lg font-semibold mb-3">{{ col.label }}</h2>

        <div v-for="task in tasksByStatus[col.status]" :key="task.id" class="kanban-card">
          <p class="font-medium">{{ task.title }}</p>
          <p class="text-sm text-gray-500" v-if="task.description">{{ task.description }}</p>

          <small class="block mt-1 text-xs">
            ⚡ Priority: {{ task.priority ?? "Normal" }}
          </small>
          <small class="block mt-1 text-xs">
            ⏱ SLA: {{ task.sla ?? "-" }} hari
            <span v-if="task.over_sla_days > 0" class="text-red-500 font-bold">(Over SLA {{ task.over_sla_days }} hari)</span>
          </small>

          <div class="mt-2 flex gap-2">
            <button v-if="task.status === 'todo'" @click="updateTaskStatus(task, 'in_progress')" class="px-2 py-1 text-sm bg-blue-500 text-white rounded">Start Progress</button>
            <button v-if="task.status === 'in_progress'" @click="updateTaskStatus(task, 'done')" class="px-2 py-1 text-sm bg-green-500 text-white rounded">Mark as Done</button>
          </div>

          <!-- Remark input hanya jika over SLA & in_progress -->
          <div v-if="task.status === 'in_progress' && task.over_sla_days > 0" class="mt-2">
            <textarea
              v-model="task.remark"
              placeholder="Add remark why task is still in progress..."
              class="w-full p-2 border rounded text-sm"
              @blur="updateRemark(task)"
            ></textarea>
          </div>

          <!-- Display remark -->
          <p v-if="task.remark" class="mt-1 text-sm text-red-600">📝 {{ task.remark }}</p>
        </div>

        <div v-if="tasksByStatus[col.status].length === 0" class="text-gray-400 text-sm mt-2">No tasks</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/tasks";

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

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const updateTasksByStatus = () => {
  const userTasks = taskStore.tasks.filter(t => t.assigned_to === auth.user?.id);

  // todo
  tasksByStatus.todo = userTasks
    .filter(t => t.status === "todo")
    .sort((a, b) => (b.over_sla_days ?? 0) - (a.over_sla_days ?? 0));

  // in_progress
  tasksByStatus.in_progress = userTasks
    .filter(t => t.status === "in_progress")
    .sort((a, b) => (b.over_sla_days ?? 0) - (a.over_sla_days ?? 0));

  // done, reset jika bukan over SLA dan finish sebelum hari ini
  tasksByStatus.done = userTasks
    .filter(t => {
      if (t.status !== "done") return false;
      if (t.over_sla_days > 0) return true; // tetap tampilkan over SLA
      const finishedDate = t.updated_at?.slice(0,10);
      return finishedDate === today; // hanya tampilkan yang selesai hari ini
    })
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
};

const updateTaskStatus = async (task, newStatus) => {
  const oldStatus = task.status;
  task.status = newStatus;

  try {
    await taskStore.updateStatus(task.id, newStatus);
    updateTasksByStatus();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update task");
    task.status = oldStatus;
    updateTasksByStatus();
  }
};

const updateRemark = async (task) => {
  try {
    await taskStore.updateTask(task.id, { remark: task.remark });
    updateTasksByStatus();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update remark");
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
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  font-size: 0.95rem;
}
textarea {
  resize: vertical;
}
</style>
