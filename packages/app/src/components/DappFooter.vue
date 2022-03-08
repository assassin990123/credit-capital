<template>
  <div class="panel-container">
    <div class="stack-bottom-area">
      <div class="stack-bottom-area-inner">
        <div class="stack-button-area">
          <a href="javascript:void(0)" class="stack-btn">
            {{ tvl }} USD<br />Total Value Locked
          </a>
          <a href="javascript:void(0)" class="stack-btn">
            987.65 USD<br />Daily Revenue
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useStore } from "@/store";
import { format } from "@/utils";

const tvl = ref(0);
const store = useStore();
const isUserConnected = computed(
  () => store.getters["accounts/isUserConnected"]
);

watchEffect(async () => {
  if (isUserConnected.value === true) {
    tvl.value = format((computed(() => store.getters["dashboard/getTVL"])).value);
  }
  else {
      tvl.value = format('0');
  }
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital@1&family=Orbitron&display=swap");
</style>
