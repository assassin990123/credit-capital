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
import { computed, ref, watch } from "vue";
import { useStore } from "@/store";
import { format, getDailyEarnings } from "@/utils";

const tvl = ref(0);
const store = useStore();
const isUserConnected = computed(
  () => store.getters["accounts/isUserConnected"]
);

const dailyEarnings = ref(0);
// daily earnings
const userPosition = computed(
  () => store.getters["rewards/getUserStakedPosition"]
);
const caplPerSecond = computed(() => store.getters["rewards/getCaplPerSecond"]);
const totalStaked = computed(() => store.getters["rewards/getTotalStaked"]);

watch(isUserConnected, async () => {
  if (isUserConnected.value === true) {
    // @ts-ignore
    tvl.value = format(computed(() => store.getters["dashboard/getTVL"]).value);
  } else {
    // @ts-ignore
    tvl.value = format("0");
  }
  dailyEarnings.value = getDailyEarnings(
    userPosition.value,
    caplPerSecond.value,
    totalStaked.value
  );
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital@1&family=Orbitron&display=swap");
</style>
