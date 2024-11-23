<!-- components/CustomDropdown.vue -->
<template>
    <div class="settings-container" ref="settingsRef">
      <MaterialIcon
        :name="iconName"
        :size="iconSize"
        :title="title"
        :color="iconColor"
        @click="toggleDropdown"
        :class="{ 'rotate': isOpen }"
      />
      <Transition name="dropdown">
        <div v-if="isOpen" class="settings-dropdown">
          <div class="dropdown-header">{{ headerTitle }}</div>
          <div class="dropdown-items">
            <slot></slot> <!-- This allows custom menu items -->
          </div>
        </div>
      </Transition>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import MaterialIcon from './MaterialIcon.vue'
  
  const props = defineProps({
    iconName: {
      type: String,
      required: true
    },
    iconSize: {
      type: Number,
      default: 40
    },
    title: {
      type: String,
      default: ''
    },
    headerTitle: {
      type: String,
      required: true
    },
    iconColor: {  // Added new prop for icon color
    type: String,
    default: '#ffffff'  // Default white color
  }
  })
  
  const isOpen = ref(false)
  const settingsRef = ref(null)
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }
  
  const handleClickOutside = (event) => {
    if (settingsRef.value && !settingsRef.value.contains(event.target)) {
      isOpen.value = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  </script>
  
  <style scoped>
  .settings-container {
    position: relative;
    cursor: pointer;
  }

  .settings-container .material-icons {
    transition: transform 0.3s ease;
    /*color: #ffffff; /* Assuming your settings icon should be white */
  }

  .settings-container .rotate {
    transform: rotate(180deg);
  }

  .settings-dropdown {
    color: inherit;
    position: absolute;
    top: 100%;
    right: 0;
    padding-left: 10px;
    /* padding-bottom: 10px; */
    margin-top: 8px;
    min-width: 220px;
    font-size: 16px;
    background: #ffffff; /* Solid white background */
    /* or use rgba with higher opacity */
    /* background: rgba(255, 255, 255, 0.98); */
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .dropdown-header {
    /* padding: 12px 16px; */
    padding-left: 0px;
    margin-left: 10px;
    font-weight: 600;
    color: #000000; /* Dark text for header */
    background-color: #f8f9fa; /* Light background for header */
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .dropdown-items {
    padding: 8px 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    margin-left: 10px;
    /* padding-bottom: 10px; */
    color: #2c3e50; /* Darker color for better readability */
    text-decoration: none;
    transition: background-color 0.2s ease;
  }

  .dropdown-item:hover {
    background-color: #f8f9fa;
    color: #000000;
  }

  .dropdown-item .material-icons {
    margin-right: 12px;
    color: #2c3e50; /* Match text color */
  }

  .dropdown-item span {
    font-size: 14px;
    font-weight: 500; /* Slightly bolder text */
  }

  .dropdown-divider {
    height: 2px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 8px 0;
  }

  .logout {
    color: #dc3545; /* Bootstrap danger color */
  }

  .logout .material-icons {
    color: #dc3545;
  }

  .logout:hover {
    background-color: #fff5f5; /* Light red background on hover */
    color: #dc3545;
  }

  /* Dropdown animation */
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  </style>