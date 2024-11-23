// src/stores/online-status.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnlineStatusStore = defineStore('onlineStatus', () => {
  const online = ref(navigator.onLine)
  const lastChecked = ref(Date.now())
  const checkingStatus = ref(false)

  const updateOnlineStatus = (status) => {
    online.value = status
    lastChecked.value = Date.now()
  }

  const checkOnlineStatus = async () => {
    if (checkingStatus.value) return
    
    checkingStatus.value = true
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.getInitialOnlineStatus()
        updateOnlineStatus(status)
      } else {
        // Fallback for browser environment
        const status = navigator.onLine
        updateOnlineStatus(status)
      }
    } catch (error) {
      console.error('Error checking online status:', error)
    } finally {
      checkingStatus.value = false
    }
  }

  const initializeOnlineStatus = async () => {
    await checkOnlineStatus()
    
    // Set up periodic status check
    setInterval(checkOnlineStatus, 5000) // Check every 5 seconds
  }

  return {
    online,
    lastChecked,
    updateOnlineStatus,
    initializeOnlineStatus,
    checkOnlineStatus
  }
})
// src/stores/online-status.js
// import { defineStore } from 'pinia'
// export const useOnlineStatusStore = defineStore('onlineStatus', {
//   state: () => ({
//     online: navigator.onLine,
//   }),
//   actions: {
//     updateOnlineStatus(status) {
//       this.online = status
//     },
//     async initializeOnlineStatus() {
//       if (window.electronAPI) {
//         const initialStatus = await window.electronAPI.getInitialOnlineStatus()
//         this.updateOnlineStatus(initialStatus)
//       } else {
//         this.updateOnlineStatus(navigator.onLine)
//       }
//     },
//   },
// })
