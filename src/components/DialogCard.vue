<!-- src\components\DialogCard.vue -->
<template>
  <router-link :to="{ name: 'view-dialog', params: { id: dialog.id } }" class="dialog-card">
    <div class="card-content">
      <div class="card-title">{{ dialog.title }}</div>

      <!-- ТОЧКИ СТАТУСА ТРЕНИРОВОК -->
      <div v-if="userStore.isPaid" class="training-status">
        <span class="status-dot" :class="trainingStatus.level2 ? 'completed' : 'incomplete'"></span>
        <span class="status-dot" :class="trainingStatus.level3 ? 'completed' : 'incomplete'"></span>
        <span class="status-dot" :class="trainingStatus.level4 ? 'completed' : 'incomplete'"></span>
      </div>

      <div class="card-info">
        <span class="levelClass">{{ $t('card.level') }}{{ dialog.level }}</span>
        <span class="levelLines">{{ $t('card.lines') }}{{ dialog.replicasCount }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { getDialogTrainingStatus } from '../services/trainingProgressService';

const props = defineProps({
  dialog: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();

// ✅ СТАТУС ТРЕНИРОВОК
const trainingStatus = ref({
  level2: false,
  level3: false,
  level4: false,
});

// ✅ ЗАГРУЖАЕМ СТАТУС ПРИ МОНТИРОВАНИИ
onMounted(async () => {
  trainingStatus.value = await getDialogTrainingStatus(props.dialog.id);
});
</script>

<style scoped>
.dialog-card {
  font-family: 'Roboto Condensed', sans-serif;
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
  transform: translateY(-3px);
  box-shadow: 0 4px 12px var(--shadow);
}
.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-title {
  color: var(--text-head);
  font-size: var(--lg);
  font-weight: 700;
  margin-bottom: 16px;
}
.training-status {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  transition: all 0.2s ease;
}
.status-dot.completed {
  background-color: #4caf50;
  box-shadow: 0 0 4px rgba(76, 175, 80, 0.4);
}
.status-dot.incomplete {
  background-color: #e0e0e0;
  border: 2px solid #bdbdbd;
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
</style>
