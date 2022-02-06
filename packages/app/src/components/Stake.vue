<template>
  <div class="card">
    <div class="card-top">
      <div>Token Balance</div>
      <div id="-balance" class="number-styles">{{ formattedBalance }}</div>
      <div>pending rewards</div>
      <div class="number-styles">{{ formattedRewards }}</div>
    </div>
    <button class="connectButton">Claim</button>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "@/store";
import { format } from "@/utils";
import { computed, ref, watchEffect } from "vue";

const store = useStore();

const formattedBalance = ref(0);
const formattedRewards = ref(0);

let balance = computed(() => store.getters.getBalance);
let pendingRewards = computed(() => store.getters.getPendingRewards);

watchEffect(() => {
  if (balance.value > 0) {
    formattedBalance.value = format(balance.value);
  }
  if (pendingRewards.value > 0) {
    formattedRewards.value = format(pendingRewards.value);
  }
});
</script>

<style>
.card {
  height: 65%;
  width: 80%;
  backdrop-filter: blur(0px) saturate(180%);
  -webkit-backdrop-filter: blur(0px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.85);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.125);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  min-width: 300px;
}
.card-top {
  width: 100%;
  height: 75%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  position: relative;
  flex-direction: column;
}

.card {
  color: #e0e1e4;
  font-size: 1.5em;
  font-family: "Kanit", sans-serif;
  font-family: "Orbitron", sans-serif;
}

.number-styles {
  color: #6441a5;
  min-width: 45px;
  min-height: 45px;
  font-size: 1.5em;
  filter: drop-shadow(0 0 0.15rem #b2a2ed);
}

/** MEDIA QUERIES */
@media screen and (min-width: 1000px) {
  .card {
    height: 50%;
    width: 20%;
  }
}
</style>
