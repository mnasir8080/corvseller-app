<template>
    <span 
      class="material-icons" 
      :style="styles"
      :title="title"
    >{{ name }}</span>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    title: {
      type: String,
      default: ''
    }
  })
  
  const styles = computed(() => ({
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color
  }))
  </script>
  
  <style scoped>
  .material-icons {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .material-icons:hover {
    transform: scale(1.1);
  }
  </style>