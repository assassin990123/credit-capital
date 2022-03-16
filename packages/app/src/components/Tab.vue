<template>
  <div class="tab-container">
    <div
      class="tab-item"
      @click="$emit('change', section)"
      :class="{
        'last-tab-item': index === sections.length - 1,
        'tab-item-selected': section === value,
      }"
      v-for="(section, index) in sections"
      :key="section"
    >
      {{ section }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['change'])
defineProps<{
  sections: string[],
  value: string
}>()
</script>

<style>
.tab-container {
  display: flex;
  flex-direction: row;
}

.tab-item {
  border-top: 1px solid #000000;
  border-left: 1px solid #000000;
  padding: 10px;
  cursor: pointer;
}

.last-tab-item {
  border-right: 1px solid #000000;
}

.tab-item-selected {
  background-color: #efefef;
}
</style>
