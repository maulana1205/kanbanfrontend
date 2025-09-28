<script setup>
import { ref } from 'vue'
import axiosInstance from '@/plugins/axios' // pastikan sudah export default / named di axios.js

const status = ref('')
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const message = ref('')

const exportExcel = async () => {
  loading.value = true
  message.value = ''

  try {
    const response = await axiosInstance({
      url: '/export/tasks',
      method: 'GET',
      responseType: 'blob',
      params: {
        status: status.value,
        start_date: startDate.value,
        end_date: endDate.value,
      },
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `tasks_${new Date().toISOString().slice(0,10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    message.value = '✅ Berhasil mengunduh laporan task.'
  } catch (error) {
    console.error(error)
    message.value = '❌ Gagal mengunduh laporan task.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
    <h1 class="text-2xl font-bold mb-4">📑 Export Task</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select v-model="status" class="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-200">
          <option value="">Semua</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>

      <!-- Tanggal Mulai -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
        <input type="date" v-model="startDate" class="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-200" />
      </div>

      <!-- Tanggal Selesai -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
        <input type="date" v-model="endDate" class="w-full px-3 py-2 border rounded focus:ring focus:ring-blue-200" />
      </div>
    </div>

    <button
      @click="exportExcel"
      :disabled="loading"
      class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ loading ? 'Mengunduh...' : 'Export Excel' }}
    </button>

    <p v-if="message" class="mt-4 text-sm" :class="message.includes('Berhasil') ? 'text-green-600' : 'text-red-600'">
      {{ message }}
    </p>
  </div>
</template>
