<template>
  <div class="panel-container">
    <div class="stack-bottom-area">
      <div class="stack-bottom-area-inner">
        <div class="stack-button-area">
          <a href="javascript:void(0)" class="stack-btn"
            >{{ tvl.toFixed(3) }} USD<br />Total Value Locked</a
          >
          <a href="javascript:void(0)" class="stack-btn"
            >987.65 USD<br />Daily Revenue</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();

const tvl = computed(() => store.getters["dashboard/getTVL"]);
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital@1&family=Orbitron&display=swap");
</style>
