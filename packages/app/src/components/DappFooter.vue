<template>
  <div class="panel-container">
    <div class="stack-bottom-area">
      <div class="stack-bottom-area-inner">
        <div class="stack-button-area">
          <a href="javascript:void(0)" class="stack-btn">
            {{ tvl }} USD<br />Total Value Locked
          </a>
          <a href="javascript:void(0)" class="stack-btn">
            {{ format(dailyEarnings) }} USD<br />Daily Revenue
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import { format, getDailyEarnings } from "@/utils";

const store = useStore();
const isUserConnected = computed(
  () => store.getters["accounts/isUserConnected"]
);

const userPosition = computed(
  () => store.getters["rewards/getUserStakedPosition"]
);
const caplPerSecond = computed(() => store.getters["rewards/getCaplPerSecond"]);
const totalStaked = computed(() => store.getters["rewards/getTotalStaked"]);

const tvl = computed(() => {
  if (!isUserConnected.value) { return '0' }
  return store.getters['dashboard/getTVL']
})
const dailyEarnings = computed(() => getDailyEarnings(
  userPosition.value,
  caplPerSecond.value,
  totalStaked.value
))
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital@1&family=Orbitron&display=swap");
</style>
