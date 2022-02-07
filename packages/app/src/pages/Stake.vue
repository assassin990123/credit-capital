<template>
  <div class="home">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">STAKE</h1>
          <div class="panel-content stake-panel-content">
            <input type="text" />
            <button>ENTER</button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">UNSTAKE</h1>
          <div class="panel-content stake-panel-content">
            <input type="text" />
            <button>ENTER</button>
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
