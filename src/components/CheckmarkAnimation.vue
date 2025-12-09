<!-- src/components/CheckmarkAnimation.vue -->
<template>
  <transition name="checkmark-fade">
    <div v-if="show" :class="isDesktop ? 'checkmark-container' : 'checkmark-container-mobile'">
      <svg class="checkmark" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
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
.checkmark-container {
  position: absolute;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.checkmark-container-mobile {
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
/* SVG ГАЛОЧКА */
.checkmark {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #4caf50;
  stroke-miterlimit: 10;
  animation: checkmark-scale 0.3s ease-in-out 0.9s both;
}
/* КРУГ */
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke: #4caf50;
  fill: none;
  animation: checkmark-stroke 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
/* ГАЛОЧКА */
.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke: #4caf50;
  animation: checkmark-stroke 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
/* Анимация рисования круга и галочки */
@keyframes checkmark-stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
/* Масштабирование (появление) */
@keyframes checkmark-scale {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}
/* TRANSITION (появление/исчезновение компонента) */
.checkmark-fade-enter-active {
  animation: fade-in 0.3s ease;
}
.checkmark-fade-leave-active {
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
