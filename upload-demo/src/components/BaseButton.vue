<template>
    <button
      :class="base-button"
      :disabled="disabled"
      @click="handleClick"
    >
      <!-- 默认插槽支持文本或图标 -->
      <slot>{{ label }}</slot>
      
      <!-- 加载状态插槽 -->
      <slot v-if="loading" name="loading">
        <span class="loading-icon">🌀</span>
      </slot>
    </button>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  // BEM命名工具[3](@ref)
  // import { createBEM } from '@/utils/bem';
  
  const props = defineProps({
    label: { type: String, default: '按钮' },
    type: { type: String, default: 'primary', validator: (v) => ['primary', 'secondary'].includes(v) },
    size: { type: String, default: 'medium', validator: (v) => ['small', 'medium', 'large'].includes(v) },
    disabled: Boolean,
    loading: Boolean
  });
  
  const emit = defineEmits(['click']);
  
  // BEM样式生成器
  // const bem = createBEM('base-button');
  
  const handleClick = (e) => {
    if (!props.disabled && !props.loading) {
      emit('click', e); // 触发事件并传递原生事件对象[1](@ref)
    }
  };
  </script>
  
  <style scoped>
  .base-button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.3s;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  </style>