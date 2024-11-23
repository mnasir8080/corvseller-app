<!-- src/components/Users.vue -->
<template>
    <div class="users-container">
      <div class="users-header">
        <div class="header-title">
            <h2>Select User</h2>
            <span>
                <MaterialIcon 
                v-if = "onlineStatusStore.online"
                name="cloud_sync" 
                :size="40" 
                color="#8C1AF6" 
                title="Menu" 
                @click="handleLoadUsers('syncNow')" 
                />
                <MaterialIcon 
                v-else
                name="sync_disabled" 
                :size="40" 
                color="#F00" 
                title="Menu" 
                />
            </span>    
        </div>
        
        <div class="search-bar">
          <i class="material-icons">search</i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search users..."
          >
        </div>
      </div>
      <div class="users-list">
    <div class="users-grid">
      <div 
        v-for="user in filteredUsers" 
        :key="user.id" 
        class="user-card"
        @click="selectUser(user)"
      >
        <div class="user-avatar">
          <img :src="getUserAvatar(user)" :alt="user.name">
        </div>
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p>@{{ user.username }}</p>
        </div>
        <button class="login-button">
          <i class="material-icons">login</i>
        </button>
      </div>
    </div>
  </div>
      <!-- Login Modal -->
      <Transition name="modal">
        <div v-if="showLoginModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Login</h3>
              <button @click="closeModal" class="close-button">
                <i class="material-icons">close</i>
              </button>
            </div>
            <div class="modal-body">
              <div class="selected-user">
                    <img :src="getUserAvatar(selectedUser)" :alt="selectedUser?.name">
                    <h4>{{ selectedUser?.name }}</h4>
                </div>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password"
                  placeholder="Enter password"
                  @keyup.enter="handleLogin"
                >
                <button @click="togglePassword" class="toggle-password">
                  <i class="material-icons">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </i>
                </button>
              </div>
              <button 
                @click="handleLogin" 
                class="submit-button"
                :disabled="!password"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </template>
  <script>
    import { ref, computed, onMounted } from 'vue'
    import { useAuthStore } from '../stores/auth'
    import { useOnlineStatusStore } from '../stores/online-status'
    // import { useOfflineSyncStore } from '../stores/offlineSyncStore';
    import { useLoaderStore } from '../stores/loader'
    import MaterialIcon from './MaterialIcon.vue'
    import alertify from 'alertifyjs'
    export default {
        name: 'Users',
        components: {
            MaterialIcon 
        },
        setup() {
            const authStore = useAuthStore()
            const searchQuery = ref('')
            const showLoginModal = ref(false)
            const selectedUser = ref(null)
            const password = ref('')
            const showPassword = ref(false)
            const onlineStatusStore = useOnlineStatusStore()
            // const offlineSyncStore = useOfflineSyncStore()
            const loaderStore = useLoaderStore()
            const handleLoadUsers = () => {
                loaderStore.showLoader()
                authStore.loadUsers()
                loaderStore.hideLoader()
            }
            onMounted(async () => {
                await authStore.getAllUsersExceptCurrent()
                await onlineStatusStore.initializeOnlineStatus()
                // offlineSyncStore.syncOfflineInvoices('background')
                // offlineSyncStore.fetchUpdatedStocks()       
                authStore.loadUsers()
            })
            const filteredUsers = computed(() => {
                return authStore.usersD.filter(user => 
                    user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                    user.username?.toLowerCase().includes(searchQuery.value.toLowerCase())
                )
            })
            const selectUser = (user) => {
                selectedUser.value = user
                showLoginModal.value = true
                password.value = ''
            }
            const closeModal = () => {
                showLoginModal.value = false
                selectedUser.value = null
                password.value = ''
                showPassword.value = false
            }
            const togglePassword = () => {
                showPassword.value = !showPassword.value
            }
            const handleLogin = async () => {
                try {
                    const offlineResult = await authStore.login(
                        selectedUser.value.username,
                        password.value,
                        'postToken'
                )               
                    if (offlineResult) {
                        closeModal()
                        alertify.success('Login successful')
                    } else {
                        alertify.error('Invalid credentials')
                    }
                } catch (error) {
                    alertify.error(error.message || 'Login failed')
                }
            }
            const getUserAvatar = (user) => {
                if (!user) return '/src/assets/avatarMale.png'
                if (user.localDp) return user.localDp
                return user.gender === 'female' 
                    ? '/src/assets/avatarFemale.png' 
                    : '/src/assets/avatarMale.png'
            }
            return {
                handleLoadUsers,
                onlineStatusStore,
                searchQuery,
                filteredUsers,
                showLoginModal,
                selectedUser,
                password,
                showPassword,
                selectUser,
                closeModal,
                togglePassword,
                handleLogin,
                getUserAvatar
            }
        }
    }
  </script>
  <style scoped>
  .users-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  .users-header {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    padding: 20px 0;
    z-index: 1;
  }
  .header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h4 {
  margin: 0; /* Remove default margin to ensure proper alignment */
}
  
  .search-bar {
    display: flex;
    align-items: center;
    background: #f0f0f0;
    border-radius: 10px;
    padding: 8px 16px;
    margin-top: 16px;
  }
  
  .search-bar input {
    border: none;
    background: transparent;
    margin-left: 8px;
    width: 100%;
    font-size: 16px;
    outline: none;
  }
  .users-list {
  margin-top: 20px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
/* Add media query for mobile responsiveness */
@media (max-width: 640px) {
  .users-grid {
    grid-template-columns: 1fr;
  }
}
  
  .user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    overflow: hidden;
  }
  
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .user-info {
    flex: 1;
    margin-left: 16px;
  }
  
  .user-info h3 {
    margin: 0;
    font-size: 16px;
    color: #000;
  }
  
  .user-info p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #666;
  }
  
  .login-button {
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .login-button:hover {
    background: #0056b3;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 400px;
    padding: 24px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
  }
  
  .selected-user {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .selected-user img {
    width: 80px;
    height: 80px;
    border-radius: 40px;
    margin-bottom: 12px;
  }
  
  .password-input {
    position: relative;
    margin-bottom: 24px;
  }
  
  .password-input input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  }
  
  .toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
  }
  
  .submit-button {
    width: 100%;
    padding: 12px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .submit-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  </style>