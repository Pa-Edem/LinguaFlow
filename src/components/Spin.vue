<!-- \\src\components\Spin.vue -->
<template>
  <div class="btn-loader">
    <div class="spin"></div>
  </div>
</template>

<style scoped>
.btn-loader {
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.spin {
  width: var(--lg);
  height: var(--lg);
  border-radius: 50%;
  border: 2px solid var(--g3);
  border-top: 2px solid transparent;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
