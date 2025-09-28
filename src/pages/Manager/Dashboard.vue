<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">📊 Dashboard</h1>
        <p class="text-gray-600">Welcome, {{ auth.user?.Name }}</p>
      </div>
         <!-- Tombol Create Task -->
      <router-link
        to="/leader/create-task"
        class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        + Create Task
      </router-link>
    </div>

    <!-- Chart + Top Performers -->
    <div class="stats">
      <!-- Chart -->
      <div class="chart-card">
        <h2 class="text-lg font-semibold mb-4 text-center">
          📈 Task Status Distribution
        </h2>
        <div class="h-64">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="ranking-card">
        <h2 class="text-lg font-semibold mb-4">🏆 Top Performers</h2>
        <div v-if="topUsers.length === 0" class="text-gray-500">
          No data available
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="(user, index) in topUsers"
            :key="user.id"
            class="flex items-center justify-between p-2 rounded border text-sm"
            :class="[
              index === 0 ? 'bg-yellow-100 border-yellow-400' :
              index === 1 ? 'bg-gray-100 border-gray-400' :
              index === 2 ? 'bg-amber-200 border-amber-500' :
              'bg-white border-gray-200'
            ]"
          >
            <span class="font-medium text-gray-800">{{ user.Name }}</span>
            <span class="text-xs text-gray-500">{{ user.doneCount }} done</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.status"
        class="kanban-column"
        @dragover.prevent
        @drop="dropTask(col.status)"
      >
        <h2>{{ col.label }}</h2>

        <!-- Grouping per tanggal -->
        <div
          v-for="dayGroup in groupedTasksByStatus(col.status)"
          :key="dayGroup.date"
          class="mb-4"
        >
          <h3 class="font-semibold text-sm text-gray-500 mb-2">{{ dayGroup.date }}</h3>
          <div
            v-for="task in dayGroup.tasks"
            :key="task.id"
            class="kanban-card"
            draggable="true"
            @dragstart="dragStart(task)"
          >
            <h3 class="font-semibold">{{ task.title }}</h3>
            <p v-if="task.description" class="text-sm text-gray-700 mt-1">{{ task.description }}</p>
            <p v-if="task.detail_task" class="text-sm text-gray-600">{{ task.detail_task }}</p>

            <small class="block mt-1 text-xs">📌 {{ task.division }} | 👥 {{ task.team ?? "-" }}</small>
            <small class="block mt-1 text-xs">🏷 Function: {{ task.task_function ?? task.Function ?? "-" }}</small>
            <small class="block mt-1 text-xs">⚡ Priority: {{ task.priority ?? "Normal" }}</small>
            <small class="block mt-1 text-xs">🗓 {{ task.start_date ?? "-" }} → {{ task.finish_date ?? "-" }}</small>

            <!-- SLA -->
            <small class="block mt-1 text-xs">
              ⏱ SLA: {{ task.sla ?? "-" }} hari
              <span
                v-if="task.sla_status === 'overdue'"
                class="text-red-500 font-bold"
              >
                (Over SLA)
              </span>
              <span
                v-else-if="task.sla_status === 'on_time'"
                class="text-green-600 font-bold"
              >
                (On SLA)
              </span>
              <span v-else class="text-gray-400">(Unknown)</span>
            </small>

            <small class="block mt-1 text-xs">👤 Creator: {{ task.creator?.Name ?? "-" }}</small>
            <small class="block mt-1 text-xs">🎯 Assignee: {{ task.assignee?.Name ?? "-" }}</small>

            <!-- Progress Bar -->
            <div class="progress-wrapper mt-2 relative">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :class="task.sla_status === 'overdue' ? 'bg-red-500' : 'bg-green-500'"
                  :style="{ width: computedProgress(task) + '%' }"
                ></div>
              </div>
              <!-- teks persentase sekarang diposisikan di atas kanan -->
              <div class="progress-text-inside">
                {{ computedProgress(task) }}%
              </div>
            </div>

            <small class="block mt-1 text-xs">📦 {{ task.qty ?? "-" }} {{ task.uom ?? "" }} | 🏢 {{ task.vendor ?? "-" }}</small>
            <small class="block mt-1 text-xs">🔑 FDT ID: {{ task.fdt_id ?? "-" }}</small>

            <p v-if="task.remark" class="mt-2 text-sm text-red-600">📝 Remark: {{ task.remark }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/tasks";
import { ref, onMounted, computed, watch } from "vue";
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
const chartCanvas = ref(null);
let chartInstance = null;

// Drag & Drop
function dragStart(task) { draggedTask.value = task; }
async function dropTask(newStatus) {
  if (!draggedTask.value) return;
  const allowedStatuses = columns.map(c => c.status);
  if (!allowedStatuses.includes(newStatus)) { draggedTask.value = null; return; }
  await taskStore.updateStatus(draggedTask.value.id, newStatus);
  draggedTask.value = null;
}

// Filter tasks
const today = new Date().toISOString().slice(0,10);
const filteredTasksByStatus = (status) => {
  return taskStore.byStatus(status)
    .filter(task => {
      if (task.status === "done" && task.updated_at.slice(0,10) !== today && task.sla_status === "on_time") return false;
      if (["in_progress","review"].includes(task.status) && task.sla_status === "overdue") return true;
      return true;
    });
};

// Grouping per tanggal
const groupedTasksByStatus = (status) => {
  const tasks = filteredTasksByStatus(status);
  const groupMap = {};
  tasks.forEach(task => {
    const date = task.updated_at.slice(0,10);
    if (!groupMap[date]) groupMap[date] = [];
    groupMap[date].push(task);
  });
  return Object.keys(groupMap)
    .sort((a,b) => b.localeCompare(a))
    .map(date => ({ date, tasks: groupMap[date] }));
};

// Chart
function renderChart() {
  if (!chartCanvas.value) return;
  if (chartInstance) chartInstance.destroy();
  const statuses = ["todo","in_progress","review","done"];
  const counts = statuses.map(s => filteredTasksByStatus(s).length);

  chartInstance = new Chart(chartCanvas.value, {
    type: "doughnut",
    data: {
      labels: ["Todo","In Progress","Review","Done"],
      datasets: [{ data: counts, backgroundColor: ["#f59e0b","#3b82f6","#8b5cf6","#10b981"] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });
}

// Top Performers
const topUsers = computed(() => {
  const userMap = {};
  taskStore.tasks.forEach(t => {
    if (t.status === "done" && t.assignee) {
      if (!userMap[t.assignee.id]) userMap[t.assignee.id] = { id: t.assignee.id, Name: t.assignee.Name, doneCount: 0 };
      userMap[t.assignee.id].doneCount++;
    }
  });
  return Object.values(userMap).sort((a,b) => b.doneCount - a.doneCount);
});

// Progress otomatis
function computedProgress(task) {
  if (task.status === "todo") return 0;
  if (task.status === "in_progress" || task.status === "review") return 50;
  if (task.status === "done") return 100;
  return task.progress ?? 0;
}

onMounted(async () => {
  await taskStore.fetchTasks();
  renderChart();
  setInterval(async () => {
    await taskStore.fetchTasks();
    renderChart();
  }, 60000);
});

watch(() => taskStore.tasks.map(t => t.status), () => renderChart());
</script>

<style scoped>
.stats { display: flex; gap: 2rem; margin: 2rem 0; flex-wrap: wrap; }
.chart-card, .ranking-card { flex: 1; min-width: 250px; background: white; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.kanban-board { display: flex; gap: 1rem; margin-top: 2rem; overflow-x: auto; padding-bottom: 1rem; }
.kanban-column { flex: 1; min-width: 280px; background: #f9fafb; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.kanban-column h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.25rem; }
.kanban-card { background: white; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.75rem; box-shadow: 0 1px 4px rgba(0,0,0,0.1); cursor: grab; transition: transform 0.2s, box-shadow 0.2s; }
.kanban-card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }

/* Progress Bar Styling */
.progress-wrapper { margin-top: 0.5rem; position: relative; }
.progress-bar { width: 100%; background: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden; }
.progress-fill { height: 8px; border-radius: 9999px; transition: width 0.3s ease; }

/* teks persentase sekarang muncul di atas kanan bar */
.progress-text-inside {
  position: absolute;
  top: -18px;
  right: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}
</style>
