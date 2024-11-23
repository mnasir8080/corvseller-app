<template>
    <div class="network-status" :class="{ 'is-offline': !online }">
      <MaterialIcon 
        :name="online ? 'wifi' : 'wifi_off'" 
        :size="35" 
        :title="online ? 'Online' : 'Offline'"
        :color="online ? '#4CAF50' : '#F44336'"
      />
      <span class="status-text">{{ online ? 'Online' : 'Offline' }}</span>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  import { useOnlineStatusStore } from '../stores/online-status'
  import MaterialIcon from './MaterialIcon.vue'
  
  export default {
    name: 'NetworkStatus',
    components: { MaterialIcon },
    setup() {
      const onlineStatusStore = useOnlineStatusStore()
      const online = computed(() => onlineStatusStore.online)
      return { online }
    }
  }
  </script>
  
  <style scoped>
  .network-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .network-status.is-offline {
    animation: pulse 2s infinite;
  }
  
  .status-text {
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  </style>