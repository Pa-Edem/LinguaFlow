<template>
  <div class="training-sidebar-content">
    <div class="desktop-only">
      <p
        v-if="slogan"
        class="slogan"
      >
        {{ slogan }}
      </p>
      <p class="description">{{ description }}</p>
    </div>
    <div
      v-if="isDesktop"
      class="controls"
    >
      <button
        class="btn btn-control"
        @click="trainingStore.repeatLevel()"
      >
        <span class="material-symbols-outlined icon">repeat</span>
        <span class="btn-text">{{ $t('buttons.reDialog') }}</span>
      </button>
      <button
        class="btn btn-control"
        @click="trainingStore.playCurrentLineAudio()"
      >
        <span class="material-symbols-outlined icon">repeat_one</span>
        <span class="btn-text">{{ $t('buttons.reLine') }}</span>
      </button>

      <slot name="extra-controls"></slot>

      <button
        class="btn btn-control play"
        @click="trainingStore.nextLine()"
      >
        <span class="material-symbols-outlined icon">play_arrow</span>
        <span class="btn-text">{{ $t('buttons.nextLine') }}</span>
      </button>
      <router-link
        @click="trainingStore.stopSpeech()"
        :to="{ name: 'view-dialog', params: { id: dialogId } }"
        class="btn btn-control"
      >
        <span class="material-symbols-outlined icon">output_circle</span>
        <span class="btn-text">{{ $t('buttons.endPractice') }}</span>
      </router-link>
    </div>

    <div
      v-else
      class="controls-mobile"
    >
      <div class="line">
        <slot name="extra-controls"></slot>
        <button
          class="btn btn-control mobile play"
          @click="trainingStore.nextLine()"
        >
          <span class="material-symbols-outlined icon">play_arrow</span>
          <span class="btn-text">{{ $t('level1.next') }}</span>
        </button>
      </div>
      <div class="line">
        <button
          class="btn btn-control mobile"
          @click="trainingStore.repeatLevel()"
        >
          <span class="material-symbols-outlined icon">repeat</span>
          <span class="btn-text">{{ $t('level1.reDialog') }}</span>
        </button>
        <button
          class="btn btn-control mobile"
          @click="trainingStore.playCurrentLineAudio()"
        >
          <span class="material-symbols-outlined icon">repeat_one</span>
          <span class="btn-text">{{ $t('level1.reLine') }}</span>
        </button>
        <router-link
          @click="trainingStore.stopSpeech()"
          :to="{ name: 'view-dialog', params: { id: dialogId } }"
          class="btn btn-control mobile"
        >
          <span class="material-symbols-outlined icon">output_circle</span>
          <span class="btn-text">{{ $t('level1.endPractice') }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTrainingStore } from '../stores/trainingStore';
import { useBreakpoint } from '../composables/useBreakpoint';

const { isDesktop } = useBreakpoint();

defineProps({
  slogan: { type: String, required: false },
  description: { type: String, required: true },
  dialogId: { type: String, required: true },
});

const trainingStore = useTrainingStore();
</script>

<style scoped>
.play {
  background-color: var(--g0);
}
/* 1. СТИЛИ ДЛЯ МОБИЛЬНЫХ */
.training-sidebar-content {
  width: 100%;
}
.desktop-only {
  display: none;
}
.controls-mobile {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
}
.line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
/* 2. СТИЛИ ДЛЯ ДЕСКТОПОВ (768px и шире) */
@media (min-width: 769px) {
  .training-sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    gap: 32px;
  }
  .desktop-only {
    display: block;
  }
  .slogan {
    font-family: 'Roboto Condensed', sans-serif;
    font-size: var(--md);
    color: var(--g3);
    font-weight: bold;
    text-align: center;
  }
  .description {
    font-size: var(--sm);
    font-style: italic;
    color: var(--text-head);
    text-align: center;
    line-height: 1.5;
  }
  .controls {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    gap: 16px;
  }
}
</style>
