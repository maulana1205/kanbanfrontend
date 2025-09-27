<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from '@/plugins/axios'
import feather from 'feather-icons'

const profile = ref({})
const avatarFile = ref(null)
const avatarFilePreview = ref(null)
const message = ref('')
const errorMessage = ref('')

const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const showPassword = ref({
  current: false,
  new: false,
  confirm: false
})

onMounted(async () => {
  await refreshProfile()
  feather.replace()
})

const refreshProfile = async () => {
  try {
    const res = await axios.get('/me')
    profile.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat profil:', err)
    errorMessage.value = 'Gagal memuat profil.'
  }
}

const handleFileInput = (e) => {
  avatarFile.value = e.target.files[0]

  if (avatarFile.value) {
    const reader = new FileReader()
    reader.onload = (event) => {
      avatarFilePreview.value = event.target.result
    }
    reader.readAsDataURL(avatarFile.value)
  } else {
    avatarFilePreview.value = null
  }
}

const handleAvatarChange = async () => {
  if (!avatarFile.value) return

  const formData = new FormData()
  formData.append('avatar', avatarFile.value)

  try {
    await axios.post('/me/avatar', formData)
    message.value = 'Avatar berhasil diperbarui.'
    errorMessage.value = ''
    avatarFile.value = null
    avatarFilePreview.value = null
    await refreshProfile()
  } catch (error) {
    errorMessage.value = 'Gagal memperbarui avatar.'
    message.value = ''
    console.error(error)
  }
}

const updatePassword = async () => {
  message.value = ''
  errorMessage.value = ''

  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    errorMessage.value = 'Konfirmasi password tidak cocok.'
    return
  }

  try {
    await axios.post('/me/password', passwordForm.value)
    message.value = 'Password berhasil diperbarui.'
    errorMessage.value = ''
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
  } catch (error) {
    if (error.response && error.response.data) {
      const errors = error.response.data.errors
      if (errors) {
        errorMessage.value = Object.values(errors).flat().join(', ')
      } else {
        errorMessage.value = error.response.data.message || 'Gagal memperbarui password.'
      }
    } else {
      errorMessage.value = 'Terjadi kesalahan jaringan.'
    }
    message.value = ''
    console.error(error)
  }
}

const toggleEye = (field) => {
  showPassword.value[field] = !showPassword.value[field]
  nextTick(() => feather.replace())
}
</script>

<template>
  <div class="max-w-2xl mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-6 text-center">Profil Pengguna</h2>

    <div v-if="message" class="mb-4 text-sm text-green-600 text-center">{{ message }}</div>
    <div v-if="errorMessage" class="mb-4 text-sm text-red-600 text-center">{{ errorMessage }}</div>

    <!-- Avatar -->
    <div class="flex justify-center mb-6">
      <img
        v-if="avatarFilePreview"
        :src="avatarFilePreview"
        alt="Preview Avatar"
        class="w-24 h-24 rounded-full object-cover border shadow"
      />
      <img
        v-else-if="profile.avatar"
        :src="profile.avatar"
        alt="Avatar"
        class="w-24 h-24 rounded-full object-cover border shadow"
      />
      <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
        N/A
      </div>
    </div>

    <!-- Nama -->
    <div class="mb-4">
      <label class="block text-gray-700">Nama</label>
      <input type="text" :value="profile.Name" disabled class="w-full border px-4 py-2 rounded bg-gray-100" />
    </div>

    <!-- Email -->
    <div class="mb-4">
      <label class="block text-gray-700">Email</label>
      <input type="email" :value="profile.email" disabled class="w-full border px-4 py-2 rounded bg-gray-100" />
    </div>

    <!-- Upload Avatar -->
    <div class="mb-6">
      <label class="block text-gray-700 mb-2">Ganti Avatar</label>

      <!-- Tombol pilih file -->
      <label
        class="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
      >
        Pilih File
        <input
          type="file"
          class="hidden"
          @change="handleFileInput"
        />
      </label>

      <!-- Nama file yang dipilih -->
      <span v-if="avatarFile" class="ml-2 text-gray-700">{{ avatarFile.name }}</span>

      <!-- Preview avatar sementara -->
      <div v-if="avatarFilePreview" class="mt-2">
        <img
          :src="avatarFilePreview"
          alt="Preview Avatar"
          class="w-24 h-24 rounded-full object-cover border shadow"
        />
      </div>

      <!-- Tombol Upload -->
      <button
        @click="handleAvatarChange"
        class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Upload Avatar
      </button>
    </div>

    <hr class="my-6" />

    <!-- Ganti Password -->
    <h3 class="text-lg font-semibold mb-4">Ganti Password</h3>

    <div class="mb-4">
      <label class="block text-gray-700">Password Lama</label>
      <div class="relative">
        <input
          :type="showPassword.current ? 'text' : 'password'"
          v-model="passwordForm.current_password"
          class="w-full border px-4 py-2 rounded pr-10"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
          @click="toggleEye('current')"
        >
          <i :data-feather="showPassword.current ? 'eye-off' : 'eye'"></i>
        </button>
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-gray-700">Password Baru</label>
      <div class="relative">
        <input
          :type="showPassword.new ? 'text' : 'password'"
          v-model="passwordForm.new_password"
          class="w-full border px-4 py-2 rounded pr-10"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
          @click="toggleEye('new')"
        >
          <i :data-feather="showPassword.new ? 'eye-off' : 'eye'"></i>
        </button>
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-gray-700">Konfirmasi Password</label>
      <div class="relative">
        <input
          :type="showPassword.confirm ? 'text' : 'password'"
          v-model="passwordForm.new_password_confirmation"
          class="w-full border px-4 py-2 rounded pr-10"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
          @click="toggleEye('confirm')"
        >
          <i :data-feather="showPassword.confirm ? 'eye-off' : 'eye'"></i>
        </button>
      </div>
    </div>

    <button @click="updatePassword" class="px-6 py-2 bg-green-600 text-white rounded">
      Update Password
    </button>
  </div>
</template>
