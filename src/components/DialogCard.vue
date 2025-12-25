<!-- src\components\DialogCard.vue -->
<template>
  <router-link
    :to="{ name: 'view-dialog', params: { id: dialog.id } }"
    class="dialog-card"
    :class="isDialogLearned ? 'learned' : ''"
  >
    <div class="card-content">
      <div class="card-title">{{ dialog.title }}</div>

      <!-- ТОЧКИ СТАТУСА ТРЕНИРОВОК для PREMIUM -->
      <div v-if="userStore.isPremium" class="training-status">
        <span class="material-symbols-outlined icon status" :class="trainingStatus.level2 ? 'completed' : 'incomplete'"
          >record_voice_over</span
        >
        <span class="material-symbols-outlined icon status" :class="trainingStatus.level3 ? 'completed' : 'incomplete'"
          >translate</span
        >
        <span class="material-symbols-outlined icon status" :class="trainingStatus.level4 ? 'completed' : 'incomplete'"
          >hearing</span
        >
      </div>
      <div class="card-info">
        <span class="levelClass">{{ $t('card.level') }}{{ dialog.level }}</span>
        <span class="levelLines">{{ $t('card.lines') }}{{ dialog.replicasCount }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { getDialogTrainingStatus } from '../services/trainingProgressService';

const props = defineProps({
  dialog: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();

// ✅ СТАТУС ТРЕНИРОВОК для PREMIUM
const trainingStatus = ref({
  level2: false,
  level3: false,
  level4: false,
});

// ✅ Изучен ли диалог (все тренировки)?
const isDialogLearned = computed(
  () => trainingStatus.value.level2 && trainingStatus.value.level3 && trainingStatus.value.level4
);

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
.dialog-card.learned {
  background-color: var(--g0);
  border-color: var(--g2);
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
  gap: 8px;
}
.status {
  font-weight: 500;
}
.status.completed {
  color: var(--g3);
}
.status.incomplete {
  color: var(--y11);
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
