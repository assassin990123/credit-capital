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
            <div class="myBalance">
              Balance:
              <a @click="insertBalance">{{ lpBalance.toFixed(4) }}</a> USDC-CAPL
            </div>
            <button
              type="submit"
              :class="stakeButtonClassName"
              @click="handleStake"
            >
              {{ stakeButtonText }}
            </button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">Withdraw</h1>
          <div class="panel-content stake-panel-content">
            <input
              type="number"
              disabled
              class="input-custom"
              v-model="unstakeAmount"
            />
            <div class="myBalance">
              Unlocked Balance: <a>{{ unstakeAmount }}</a> USDC-CAPL
            </div>
            <button type="submit" class="btn-custom" @click="unstake">
              Withdraw
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
import {
  checkConnection,
  checkBalance,
  checkAvailability,
} from "@/utils/notifications";

const store = useStore();
const stakeAmount: Ref<number> = ref(0);
const stakeButtonText: Ref<string> = ref("Stake");
const stakeButtonClassName: Ref<string> = ref("btn-custom-gray");
const unstakeAmount = ref(0);
// for we make the user withdraw the total unlockedAmount.
const lpBalance = computed(() => store.getters["tokens/getLPBalance"]);

const isUserConnected = computed(
  () => store.getters["accounts/isUserConnected"]
);

// this function checks the allowance a user has alloted our rewards contract via the LP token
watchEffect(async () => {
  if (
    isUserConnected.value &&
    checkAvailability(stakeAmount.value, lpBalance.value)
  ) {
    if (stakeAmount.value == 0) {
      stakeButtonText.value = "Stake";
      stakeButtonClassName.value = "btn-custom-gray";
    } else {
      if (
        await checkAllowance(
          store,
          "LP", // static for now
          stakeAmount.value,
          "stake"
        )
      ) {
        stakeButtonText.value = "Stake";
        stakeButtonClassName.value = "btn-custom-green";
      } else {
        stakeButtonText.value = "Approve";
        stakeButtonClassName.value = "btn-custom";
      }
    }
  }
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

const insertBalance = () => {
  stakeAmount.value = lpBalance.value;
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
.black-text {
  color: black !important;
}
</style>
