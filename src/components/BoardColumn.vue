<template>
  <div class="column">
    <h3>{{ title }} ({{ modelValue.length }})</h3>
    <draggable
      v-model="localItems"
      group="tasks"
      @end="onEnd"
      item-key="id"
    >
      <template #item="{ element }">
        <div class="card">
          {{ element.name }}
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import draggable from "vuedraggable";
const props = defineProps({
  title: String,
  modelValue: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue"]);

// Buat state lokal untuk draggable
const localItems = ref([...props.modelValue]);

// Sync ke parent kalau berubah
watch(
  localItems,
  (val) => emit("update:modelValue", val),
  { deep: true }
);

// Sync dari parent kalau ada update
watch(
  () => props.modelValue,
  (val) => (localItems.value = [...val]),
  { deep: true }
);

function onEnd() {
  console.log("Drag ended", localItems.value);
}
</script>
