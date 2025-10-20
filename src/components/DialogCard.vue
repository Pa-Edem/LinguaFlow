<!-- src\components\DialogCard.vue -->
<template>
  <router-link
    :to="{ name: 'view-dialog', params: { id: dialog.id } }"
    class="dialog-card"
  >
    <div class="card-content">
      <div class="card-title">{{ dialog.title }}</div>
      <div class="card-info">
        <span class="levelClass">{{ $t('card.level') }}{{ dialog.level }}</span>
        <span class="levelLines">{{ $t('card.lines') }}{{ dialog.replicasCount }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
const props = defineProps({
  dialog: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.dialog-card {
  display: block;
  width: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.dialog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--shadow);
}
.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-title {
  color: var(--text-head);
  font-size: var(--md);
  font-weight: 700;
  margin-bottom: 16px;
}
.card-info {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
}
.card-info .levelClass,
.card-info .levelLines {
  font-size: var(--sm);
  color: var(--text-base);
}
@media (min-width: 768px) {
  .card-info .levelClass,
  .card-info .levelLines {
    font-size: var(--xxs);
    color: var(--text-base);
  }
}
</style>
