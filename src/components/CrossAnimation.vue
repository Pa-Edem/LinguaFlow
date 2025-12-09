<!-- src/components/CrossAnimation.vue -->
<template>
  <transition name="cross-fade">
    <div v-if="show" class="cross-container" :class="isDesktop ? 'cross-container' : 'cross-container-mobile'">
      <svg class="cross" viewBox="0 0 52 52">
        <circle class="cross-circle" cx="26" cy="26" r="25" fill="none" />
        <line class="cross-line1" x1="16" y1="16" x2="36" y2="36" />
        <line class="cross-line2" x1="36" y1="16" x2="16" y2="36" />
      </svg>
    </div>
  </transition>
</template>

<script setup>
import { useBreakpoint } from '../composables/useBreakpoint';
const { isDesktop } = useBreakpoint();

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
/* КОНТЕЙНЕР */
.cross-container {
  position: absolute;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.cross-container-mobile {
  position: absolute;
  right: 0;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
/* SVG КРЕСТИК */
.cross {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #f44336;
  stroke-miterlimit: 10;
  animation: cross-scale 0.3s ease-in-out 0.9s both;
}
/* КРУГ */
.cross-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke: #f44336;
  fill: none;
  animation: cross-stroke 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
/* КРЕСТИК (2 ЛИНИИ) */
.cross-line1,
.cross-line2 {
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  stroke: #f44336;
  stroke-width: 3;
  stroke-linecap: round;
  animation: cross-stroke 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
/* Анимация рисования круга и линий */
@keyframes cross-stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
/* Масштабирование (встряска) */
@keyframes cross-scale {
  0%,
  100% {
    transform: none;
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
}
/* TRANSITION (появление/исчезновение компонента) */
.cross-fade-enter-active {
  animation: fade-in 0.3s ease;
}
.cross-fade-leave-active {
  animation: fade-out 0.3s ease;
}
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>
