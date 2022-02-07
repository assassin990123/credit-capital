<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="inner-container reward-main-sec">
        <div class="rewards-container">
          <h1 class="panel-title">PENDING REWARDS</h1>
          <div class="rewards-content">
            <div class="rewards-display"><span>USDC:</span> ${{ pendingRewards }}</div>
            <div class="rewards-section">
              <div class="rewards-section-item">CLAIM</div>
              <div class="rewards-section-item">COMPOUND</div>
            </div>
          </div>
        </div>
      </div>
      
      <DappFooter /> 
    </div>
  </div>
</template>

<script lang="ts" setup>
  import DappFooter from "@/components/DappFooter.vue";
  import { computed, watchEffect } from "vue";
  import { useStore } from "@/store";

  const store = useStore();
  
  const pendingRewards = computed(() => store.getters["contracts/getPendingRewards"]);

  watchEffect(() => {
    if (pendingRewards.value) {
      // do web3 stuff
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
  font-size: 100px;
  font-weight: 700;
  padding: 40px 20px;
  text-align: center;
}

.rewards-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 50px;
}

.rewards-section-item {
  border: 1px solid #000000;
  padding: 10px 20px;
  font-size: 36px;
}
</style>
