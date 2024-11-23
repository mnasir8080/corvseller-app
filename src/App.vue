<!-- src/App.vue -->
<template>
  <div id="app" class="d-flex flex-column vh-100">
    <nav class="navbar navbar-expand-lg navbar-light bg-light" id="topnav">
      <div class="container-fluid topbar-main">
        <div class="logo">
          <a class="navbar-brand" href="#" style="color: #ffffff;">
            <img 
              :src="storeLogo" 
              :alt="authStore.getStoreD?.name || 'Store Logo'" 
              class="rounded-circle me-2" 
              style="width: 40px; height: 40px; object-fit: cover;"
              @error="handleImageError"
            >
            <template v-if="authStore.getStoreD">
              {{ authStore.getStoreD.name }}
            </template>
          </a>
        </div>
        <NetworkStatus />
        <CustomDropdown 
          icon-name="settings"
          header-title="Settings"
          title="Settings"
        >
          <a href="#" class="dropdown-item" @click="handleProfile">
            <MaterialIcon name="person" :size="20" />
            <span>Profile</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item logout" @click="handleLogout">
            <MaterialIcon name="logout" :size="20" />
            <span>Logout</span>
          </a>
        </CustomDropdown>
      </div>
    </nav>
    <main class="flex-grow-1 overflow-hidden">
      <template v-if="!authStore.isAuthenticated && !authStore.getTillD">
        <Login />
      </template>
      <template v-else-if="!authStore.isAuthenticated && authStore.getTillD">
        <Users />
      </template>
      <template v-else-if="authStore.isAuthenticated && !authStore.getTillD">
        <SelectTill />
      </template>
      <template v-else>
        <Till />
         
      </template>
    </main>
    <footer class="bg-light py-2">
      <div class="container-fluid text-center">
        <p class="mb-0">&copy; 2024 Corvid Solutions Providers. All rights reserved.</p>
      </div>
    </footer>
    <Loader :isLoading="loaderStore.isLoading" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useOnlineStatusStore } from './stores/online-status'
import { useLoaderStore } from './stores/loader'
import { storeToRefs } from 'pinia'
import Login from './components/Login.vue'
import Till from './components/Till.vue'
import Users from './components/Users.vue'
import SelectTill from './components/SelectTill.vue'
import Loader from './components/Loader.vue'
import NetworkStatus from './components/NetworkStatus.vue'
import MaterialIcon from './components/MaterialIcon.vue'
import CustomDropdown from './components/CustomDropdown.vue'
import alertify from 'alertifyjs'
import 'alertifyjs/build/css/alertify.min.css'

export default {
  name: 'App',
  components: {
    Login,
    Till,
    Users,
    SelectTill,
    CustomDropdown,
    Loader,
    MaterialIcon,
    NetworkStatus,
  },
  setup() {
    const authStore = useAuthStore()
    const onlineStatusStore = useOnlineStatusStore()
    const loaderStore = useLoaderStore()
    const isOpen = ref(false)
    const initializationError = ref(null)
    const retryCount = ref(0)
    const MAX_RETRIES = 3
    const defaultLogoPath = '/src/assets/storeDefault.png'
    const imageError = ref(false)

    const onlineStatus = computed(() => onlineStatusStore.online)
    const lastChecked = computed(() => onlineStatusStore.lastChecked)
     // Changed from method to computed property for reactive updates
     const storeLogo = computed(() => {
      if (imageError.value) {
        return defaultLogoPath
      }
      
      const storeData = authStore.getStoreD
      // console.log("dddddddddddddd",storeData)
      if (!storeData) {
        return defaultLogoPath
      }

      // First try local logo
      if (storeData.localDp) {
        console.log("ss")
        return storeData.localDp
      }
      // Finally fallback to default
      return defaultLogoPath
    })

    // Handle image loading errors
    const handleImageError = (event) => {
      console.error('Failed to load store logo')
      imageError.value = true
      event.target.src = defaultLogoPath
    }

    // Handle online status changes with notifications
    const handleOnlineStatusChange = (status) => {
      onlineStatusStore.updateOnlineStatus(status)
      const message = status ? 'Connection restored' : 'Connection lost'
      const type = status ? 'success' : 'error'
      alertify.notify(message, type, 3)
    }
    // Initialize the application with retry logic
    const initializeApplication = async () => {
      try {
        loaderStore.showLoader()
        await onlineStatusStore.initializeOnlineStatus()
        if (window.electronAPI) {
          window.electronAPI.onOnlineStatusChange(handleOnlineStatusChange)
        } else {
          window.addEventListener('online', () => handleOnlineStatusChange(true))
          window.addEventListener('offline', () => handleOnlineStatusChange(false))
        }
        await Promise.all([
          authStore.initializeTill(),
          authStore.initializeAuth(),
          authStore.initializeTills()
        ])
        initializationError.value = null
        retryCount.value = 0
      } catch (error) {
        console.error('Initialization error:', error)
        initializationError.value = error.message
        
        if (retryCount.value < MAX_RETRIES) {
          retryCount.value++
          setTimeout(initializeApplication, 2000 * retryCount.value)
        } else {
          alertify.error('Failed to initialize application after multiple attempts')
        }
      } finally {
        loaderStore.hideLoader()
      }
    }

    // Watch for online status changes to retry initialization if needed
    watch(onlineStatus, (newStatus) => {
      if (newStatus && initializationError.value && retryCount.value < MAX_RETRIES) {
        initializeApplication()
      }
    })

    onMounted(async () => {
      alertify.set('notifier', 'position', 'top-center')
      alertify.set('notifier', 'delay', 5)
      await initializeApplication()
    })

    onUnmounted(() => {
      if (!window.electronAPI) {
        window.removeEventListener('online', () => handleOnlineStatusChange(true))
        window.removeEventListener('offline', () => handleOnlineStatusChange(false))
      }
    })

    const handleLogout = () => {
      authStore.logout()
    }

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    return {
      storeLogo,
      handleImageError,
      authStore,
      onlineStatus,
      handleLogout,
      loaderStore,
      isOpen,
      toggleDropdown,
      initializationError,
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100vw;
  position: relative;
}

nav {
  height: 50px;
  width: 100vw;
}

main {
  height: calc(100vh - 98px);
  width: 100vw;
}

footer {
  height: 42px;
  width: 100vw;
}

.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  text-align: center;
  color: white;
}

.spinner {
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

.network-status-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>