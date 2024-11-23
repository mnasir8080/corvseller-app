<!-- Loader.vue -->
<template>
    <div v-if="isLoading" class="loader-overlay">
      <div class="loader">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Loader',
    props: {
      isLoading: {
        type: Boolean,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
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
        z-index: 9999; /* Ensure it appears above other content */
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
  </style>