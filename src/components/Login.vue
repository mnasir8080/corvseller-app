<!-- src/components/Login.vue -->
<template>
  <div class="container h-100">
    <div class="row justify-content-center align-items-center h-100">
      <div class="col-md-4">
          <template v-if="authStore.tillID == 0">
            <div>
              This till has not been assigned, Admin needs to login and register the till.
            </div>
          </template>
          <form @submit.prevent="handleLogin" class="login-form">
            <h2>Login</h2>
            <div class="form-group">
              <label for="username">Username:</label>
              <input type="text" id="username" v-model="username" required :disabled="isLoading">
            </div>
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" v-model="password" required :disabled="isLoading">
            </div>
            <!-- <button class="btn btn-success" type="submit" :disabled="isLoading" v-if="authStore.getTillD">
              <template v-if="isLoading">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span role="status">Logging...</span>
              </template>
              <template v-else>
                  Login
              </template>
            </button> -->
            <button class="btn btn-success" type="submit" :disabled="isLoading">
              <template v-if="isLoading">
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span role="status">Logging Admin..</span>
              </template>
              <template v-else>
                  Admin Login
              </template>
            </button>
            <p v-if="error" class="error">{{ error }}</p>
          </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useOnlineStatusStore } from '../stores/online-status'
const authStore = useAuthStore()
const onlineStatusStore = useOnlineStatusStore()
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  const requestType = !authStore.tillD ? 'preToken' : 'postToken'
  try {
    const success = await authStore.login(username.value, password.value, requestType)
    if (!success) {
      error.value = onlineStatusStore.online ? 'Invalid credentials' : 'Offline login failed'
    }
  } catch (e) {
    error.value = 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
}
onMounted(async () => {
  await onlineStatusStore.initializeOnlineStatus()
  await authStore.initializeTill()
})
</script>
<style scoped>
    .login-form {
      width: 300px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 15px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
    }

    input, textarea, select{
        width: 100%;
        height: 38px;
        border: 1px solid #CCC;
        border-radius: 15px;
        text-align: center;
    }

    button {
      width: 100%;
      padding: 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 15px;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }
    .error {
      color: red;
      margin-top: 10px;
    }
</style>