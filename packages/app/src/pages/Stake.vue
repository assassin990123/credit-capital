<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">Stake</h1>
          <div class="panel-content stake-panel-content">
            <input
              type="number"
              placeholder="0.00"
              class="input-custom"
              v-model="stakeAmount"
            />
            <button type="submit" class="btn-custom" @click="handleStake">
              {{ stakeButtonText }}
            </button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">Unstake</h1>
          <div class="panel-content stake-panel-content">
            <input
              type="number"
              placeholder="0.00"
              class="input-custom"
              v-model="unstakeAmount"
            />
            <button type="submit" class="btn-custom" @click="unstake">
              ENTER
            </button>
          </div>
        </div>
      </div>
      <DappFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import DappFooter from "@/components/DappFooter.vue";
import { watchEffect, ref, Ref, computed } from "vue";
// @ts-ignore
import { checkAllowance } from "@/utils";
// @ts-ignore
import { useStore } from "@/store";
// @ts-ignore
import { checkConnection, checkBalance } from "@/utils/notifications";

const store = useStore();
const stakeAmount = ref(0);
const stakeButtonText: Ref<string> = ref("Stake");
const unstakeAmount = computed(
  () => store.getters["rewards/getUserUnlockedAmount"]
);

// this function checks the allowance a user has alloted our rewards contract via the LP token
watchEffect(async () => {
  (await checkAllowance(
    store,
    "LP", // static for now
    stakeAmount.value,
    "stake"
  ))
    ? (stakeButtonText.value = "Stake")
    : (stakeButtonText.value = "Approve");
});

const handleStake = async () => {
  if (checkConnection(store) && checkBalance(stakeAmount.value)) {
    stakeButtonText.value == "Stake" ? await stake() : await approve();
  }
};

const approve = async () => {
  await store.dispatch("tokens/approveRewards", {
    amount: stakeAmount.value,
  });
};

const stake = () => {
  store.dispatch("rewards/stake", { amount: stakeAmount.value });
};

const unstake = () => {
  // check connection
  if (checkConnection(store) && checkBalance(unstakeAmount.value)) {
    store.dispatch("rewards/unstake", { amount: unstakeAmount.value });
  }
};
// userPosition = computed(() => store.getters["rewards/getUserPosition"]);
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
