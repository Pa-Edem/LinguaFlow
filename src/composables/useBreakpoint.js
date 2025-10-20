// src/composables/useBreakpoint.js
import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useBreakpoint() {
  const screenWidth = ref(window.innerWidth);

  const updateWidth = () => {
    screenWidth.value = window.innerWidth;
  };

  onMounted(() => window.addEventListener('resize', updateWidth));
  onUnmounted(() => window.removeEventListener('resize', updateWidth));

  // Мы считаем десктопом всё, что шире 768px
  const isDesktop = computed(() => screenWidth.value > 768);

  return { isDesktop };
}
