<template>
  <div class="home">
    <Stake />
  </div>
</template>

<script lang="ts" setup>
import Stake from "@/components/Stake.vue";
import { computed, watchEffect } from "vue";
import { useStore } from "@/store";

const store = useStore();

const connected = computed(() => store.getters.getConnected);
// Temp hack to get this to build without errors.
// eslint-disable-next-line no-unused-vars
const wallet = computed(() => store.getters.getWallet);

watchEffect(() => {
  if (connected.value) {
    // do web3 stuff
  }
});
</script>

<style>
.home {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
