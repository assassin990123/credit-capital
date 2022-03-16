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
              <button class="rewards-section-item" @click="claimRewards">CLAIM</button>
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
import { computed, toRefs } from "vue";
import DappFooter from "@/components/DappFooter.vue";
import { calculateCAPLUSDPrice, format } from "@/utils";
import { checkConnection } from "@/utils/notifications";
import { useAccounts } from "@/use/accounts";
import { useRewards } from "@/use/rewards";
import { useBalancer } from "@/use/balancer";

const { connected } = useAccounts()
const { rewards, claim } = useRewards()
const { balancer } = useBalancer()

const { pendingRewards } = toRefs(rewards)
const { poolTokens, } = toRefs(balancer)

const claimRewards = () => {
  checkConnection()
  claim()
};

const pendingRewardsCAPL = computed(
  () => connected.value ? format(pendingRewards.value) : 0
)
const pendingRewardsUSDC = computed(() => connected.value ? format(
  calculateCAPLUSDPrice(pendingRewards.value, "CAPL", poolTokens.value)
) : 0)
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
