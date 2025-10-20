<template>
  <li class="benefit-item">
    <span class="material-symbols-outlined icon">check_circle</span>
    <span class="text"><slot></slot></span>
  </li>
</template>

<style scoped>
.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: var(--md);
  color: var(--text-head);
  margin-bottom: 8px;
}
.icon {
  color: var(--g3);
}
@media (min-width: 768px) {
  .benefit-item {
    font-size: var(--sm);
  }
}
</style>
