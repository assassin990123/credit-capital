<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">Stake</h1>
          <div class="panel-content stake-panel-content">
            <input type="number" placeholder="0.00" class="input-custom" v-model="stakeAmount"/>
            <button type="submit" class="btn-custom" @click="stake">ENTER</button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">Unstake</h1>
          <div class="panel-content stake-panel-content">
            <input type="number" placeholder="0.00" class="input-custom" v-model="unstakeAmount"/>
            <button type="submit" class="btn-custom" @click="unstake">ENTER</button>
          </div>
        </div>
      </div>
      <DappFooter />
    </div>
  </div>
</template>

<script lang="ts" setup>
  // @ts-ignore
  import DappFooter from "@/components/DappFooter.vue";
  import { computed, watchEffect, ref } from "vue";
  // @ts-ignore
  import { format } from "@/utils";
  // @ts-ignore
  import { useStore } from "@/store";
  // @ts-ignore
  import { checkConnection, checkBalance } from "@/utils/notifications";

  const store = useStore();
  const formatedUserPosition = ref(0);
  const stakeAmount = ref(0);
  const unstakeAmount = ref(0);

  const connected = computed(() => store.getters["accounts/isUserConnected"]);

  const stake = () => {

    if (checkConnection(store) && checkBalance(stakeAmount.value)) {
      // enable stake button
      store.dispatch("rewards/stake", { amount: stakeAmount.value });
    }
  };
  const unstake = () => {
    // check connection
    if (checkConnection(store) && checkBalance(unstakeAmount.value)) {
      store.dispatch("rewards/unstake", { amount: unstakeAmount.value })
    }
    
  };
  const userPosition = computed(
    () => store.getters["rewards/getUserPosition"]
  );

  watchEffect(() => {
    if (userPosition.value) {
      formatedUserPosition.value = format(userPosition.value);
    }
  });
</script>

<style>
.stake-panel {
  margin: 0 12%;
}

.stake-panel-content {
  height: 40vh;
  padding: 10px 40px;
}
</style>
