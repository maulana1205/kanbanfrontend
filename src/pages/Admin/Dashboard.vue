<template>
  <div>
    <h1>Admin Dashboard</h1>
    <p>Welcome, {{ auth.user?.Name }}</p>
    <!-- Kanban Board -->
    <div class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.status"
        class="kanban-column"
      >
        <h2>{{ col.label }}</h2>
        <div
          v-for="task in taskStore.byStatus(col.status)"
          :key="task.id"
          class="kanban-card"
          draggable="true"
          @dragstart="dragStart(task)"
          @dragover.prevent
          @drop="dropTask(col.status)"
        >
          <h3>{{ task.title }}</h3>
          <p v-if="task.description">{{ task.description }}</p>
          <small>📌 {{ task.division }} | 👤 {{ task.assignee?.Name ?? "" }}</small>
        </div>
      </div>
    </div>
    <!-- Charts Section -->
    <div class="stats">
      <div class="chart-card">
        <h2>Task Status Distribution</h2>
        <canvas id="taskStatusChart"></canvas>
      </div>

      <!-- Ranking Section -->
<div class="ranking-card">
  <h2 class="text-lg font-semibold mb-4">🏆 Top Performers</h2>
  <div v-if="topUsers.length === 0" class="text-gray-500">No data available</div>
  <ul v-else class="space-y-3">
    <li
      v-for="(user, index) in topUsers"
      :key="user.id"
      class="flex items-center justify-between p-3 rounded-lg shadow-sm border"
      :class="[
        index === 0 ? 'bg-yellow-100 border-yellow-400' :
        index === 1 ? 'bg-gray-100 border-gray-400' :
        index === 2 ? 'bg-amber-200 border-amber-500' :
        'bg-white border-gray-200'
      ]"
    >
      <!-- Rank Badge -->
      <span
        class="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white"
        :class="[
          index === 0 ? 'bg-yellow-500' :
          index === 1 ? 'bg-gray-500' :
          index === 2 ? 'bg-orange-500' :
          'bg-blue-500'
        ]"
      >
        {{ index + 1 }}
      </span>

      <!-- User Info -->
      <div class="flex-1 ml-3">
        <p class="font-medium text-gray-800">{{ user.name }}</p>
        <p class="text-sm text-gray-500">{{ user.doneCount }} tasks done</p>
      </div>

      <!-- Trophy/Icon -->
      <span v-if="index === 0">🏅</span>
      <span v-else-if="index === 1">🥈</span>
      <span v-else-if="index === 2">🥉</span>
    </li>
  </ul>
</div>
    </div>

  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/tasks";
import { onMounted, ref, computed, watch } from "vue";
import Chart from "chart.js/auto";

const auth = useAuthStore();
const taskStore = useTaskStore();

const columns = [
  { status: "todo", label: "📋 Todo" },
  { status: "in_progress", label: "⚡ In Progress" },
  { status: "review", label: "🔎 Review" },
  { status: "done", label: "✅ Done" },
];

const draggedTask = ref(null);
let chartInstance = null;

// drag-drop handlers
function dragStart(task) {
  draggedTask.value = task;
}
async function dropTask(newStatus) {
  if (!draggedTask.value) return;
  await taskStore.updateStatus(draggedTask.value.id, newStatus);
  draggedTask.value = null;
}

// Chart data
function renderChart() {
  const ctx = document.getElementById("taskStatusChart");
  if (!ctx) return;

  // Destroy chart if already exists
  if (chartInstance) chartInstance.destroy();

  const statuses = ["todo", "in_progress", "review", "done"];
  const counts = statuses.map(s => taskStore.byStatus(s).length);

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Todo", "In Progress", "Review", "Done"],
      datasets: [
        {
          data: counts,
          backgroundColor: ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"],
        },
      ],
    },
  });
}

// Ranking (top users by done tasks)
const topUsers = computed(() => {
  const userMap = {};
  taskStore.tasks.forEach(t => {
    if (t.status === "done" && t.assignee) {
      if (!userMap[t.assignee.id]) {
        userMap[t.assignee.id] = { id: t.assignee.id, name: t.assignee.name, doneCount: 0 };
      }
      userMap[t.assignee.id].doneCount++;
    }
  });
  return Object.values(userMap).sort((a, b) => b.doneCount - a.doneCount).slice(0, 5);
});

onMounted(async () => {
  await taskStore.fetchTasks();
  renderChart();
});

// Re-render chart if tasks change
watch(
  () => taskStore.tasks,
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<style scoped>
.stats {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}
.chart-card, .ranking-card {
  flex: 1;
  min-width: 250px;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.ranking-card ol {
  padding-left: 1.2rem;
}
.kanban-board {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}
.kanban-column {
  flex: 1;
  min-width: 250px;
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 10px;
}
.kanban-column h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.kanban-card {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  cursor: grab;
  transition: transform 0.2s;
}
.kanban-card:active {
  cursor: grabbing;
  transform: scale(1.02);
}
</style>
