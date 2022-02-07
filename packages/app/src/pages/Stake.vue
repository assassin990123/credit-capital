<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">Stake</h1>
          <div class="panel-content stake-panel-content">
            <input type="number" placeholder="0.00" class="input-custom" />
            <button type="submit" class="btn-custom">ENTER</button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">Unstake</h1>
          <div class="panel-content stake-panel-content">
            <input type="number" placeholder="0.00" class="input-custom" />
            <button type="submit" class="btn-custom">ENTER</button>
          </div>
        </div>
      </div>
     <DappFooter />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import DappFooter from "@/components/DappFooter.vue";
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
