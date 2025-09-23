<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">My Kanban Board</h1>
    <p class="mt-2 text-gray-600">Welcome, {{ auth.user?.Name }}</p>

    <div class="kanban-board mt-6">
      <div
        v-for="column in columns"
        :key="column.status"
        class="kanban-column"
      >
        <h2 class="text-lg font-semibold mb-3">{{ column.label }}</h2>

        <draggable
          :list="tasksByStatus[column.status]"
          group="tasks"
          item-key="id"
          @end="onDragEnd($event, column.status)"
        >
          <template #item="{ element: task }">
            <div class="kanban-card cursor-pointer">
              <p class="font-medium">{{ task.title }}</p>
              <p class="text-sm text-gray-500">{{ task.description }}</p>
            </div>
          </template>

          <template #footer>
            <div v-if="tasksByStatus[column.status].length === 0" class="text-gray-400 text-sm">
              No tasks assigned to you
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import draggable from "vuedraggable";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const auth = useAuthStore();
const tasks = ref([]);
const loading = ref(false);

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

// Fetch tasks from backend
const fetchTasks = async () => {
  try {
    const res = await axios.get("/tasks");
    // Filter task assigned_to current user
    tasks.value = res.data.filter(task => task.assigned_to === auth.user?.id);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
  }
};
onMounted(fetchTasks);

const updateTasksByStatus = () => {
  tasksByStatus.todo = tasks.value.filter(t => t.status === "todo");
  tasksByStatus.in_progress = tasks.value.filter(t => t.status === "in_progress");
  tasksByStatus.done = tasks.value.filter(t => t.status === "done");
};
watch(tasks, updateTasksByStatus, { deep: true });
onMounted(updateTasksByStatus);

// Handle drag & drop
const onDragEnd = async (evt, toColumnStatus) => {
  const task = evt.item.__vueParentComponent.ctx.element;
  if (!task) return;

  try {
    loading.value = true;
    const res = await axios.patch(`/tasks/${task.id}/status`, { status: toColumnStatus });
    task.status = res.data.status;
    updateTasksByStatus();
  } catch (err) {
    console.error("Failed to update task status", err.response || err);
    alert(err.response?.data?.message || "Failed to update task");
    fetchTasks();
  } finally {
    loading.value = false;
  }
};
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
  cursor: grab;
}
.kanban-card:active {
  cursor: grabbing;
}
</style>
