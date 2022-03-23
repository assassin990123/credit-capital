<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="inner-container reward-main-sec">
        <div class="rewards-container">
          <h1 class="panel-title">Pending Rewards</h1>
          <div class="rewards-content">
            <div class="rewards-display">
              {{ pendingRewardsCAPL + " CAPL" }}<br />
              ({{ pendingRewardsUSDC + " USD" }})
            <div class="rewards-section">
              <button class="rewards-section-item" @click="claim">CLAIM</button>
              <!-- <div class="rewards-section-item">COMPOUND</div> -->
              <div class="explainer">
                Claim your rewards whenever you want! If you aren't earning, you may want to
                <router-link to="stake" class="button">Stake</router-link> some tokens.
              </div>
            </div>
            </div>
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
import { computed, watch, ref } from "vue";
// @ts-ignore
import { useStore } from "@/store";
// @ts-ignore
import { calculateCAPLUSDPrice, format } from "@/utils";
import { checkConnection } from "@/utils/notifications";

const store = useStore();
const pendingRewardsCAPL = ref('0' as string | undefined);
const pendingRewardsUSDC = ref('0' as string | undefined);

const connected = computed(() => store.getters["accounts/isUserConnected"]);
const chainId = computed(() => store.getters["accounts/getChainId"]);
const pendingRewards = computed(
  () => store.getters["rewards/getPendingRewards"]
);

const claim = () => {
  if (checkConnection(store)) {
    store.dispatch("rewards/claim");
  }
};

watch(connected, async () => {
  if (connected.value === true && Number(chainId.value) == parseInt(process.env.VUE_APP_NETWORK_ID!)) {
    if (pendingRewards.value >= 0) {
      await store.dispatch("balancer/getPoolTokens");
      pendingRewardsCAPL.value = format(pendingRewards.value);
      pendingRewardsUSDC.value = format(
        calculateCAPLUSDPrice(
          pendingRewards.value,
          "CAPL",
          store.getters["balancer/getPoolTokens"]
        )
      );
    }
  } else {
    pendingRewardsCAPL.value = format("0");
    pendingRewardsUSDC.value = format("0");
  }
});
</script>

<style>
.rewards-container {
  width: 100%;
}

.rewards-content {
  display: flex;
  flex-direction: column;
  width: 70%;
  margin: 0 auto;
}

.rewards-display {
  border: 1px solid #000000;
  font-size: 50px;
  font-weight: 700;
  padding: 20px 20px;
  text-align: center;
}

.rewards-section {
  /* display: flex;
  flex-direction: row; */
  justify-content: space-between;
}

.rewards-section-item {
  border: 1px solid #000000;
  padding: 10px 20px;
  font-size: 36px;
}
</style>
