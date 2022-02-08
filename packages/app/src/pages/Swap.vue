<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">swap</h1>
          <div class="panel-content swap-panel-content">
            <div class="panel-header">
              <div class="panel-explanation">functionality explanation</div>
              <div class="ellipses">&hellip;</div>
            </div>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>send</span></div>
                <div class="panel-explanation">000</div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">CAPL</div>
              </div>
            </div>
            <button class="btn-switch">&#8635;</button>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>receive</span></div>
                <div class="panel-explanation">000</div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">USDC</div>
              </div>
            </div>
            <button type="submit" class="btn-custom">Enter</button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">liquidity</h1>
          <div class="panel-content  swap-panel-content">
            <div class="panel-header">
              <div class="panel-explanation">functionality explanation</div>
              <div class="ellipses">&hellip;</div>
            </div>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>amount</span></div>
                <div class="panel-explanation">000</div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span></div>
                <div class="panel-explanation">CAPL</div>
              </div>
            </div>
            <button class="btn-switch">&#8635;</button>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>amount</span></div>
                <div class="panel-explanation">000</div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">USDC</div>
              </div>
            </div>
            <button type="submit" class="btn-custom">Add</button>
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
.swap-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.inner-container {
  margin-top: 90px;
}

.panel-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.panel {
  flex: 1;
  margin: 0 8%;
}

.panel-title {
  text-align: center;
}

.panel-content {
  border: 1px solid #000000;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.panel-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.panel-explanation {
}

.panel-display {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 15px;
  margin: 20px 0;
  border: 1px solid #000000;
}

.btn-switch {
  width: 50px;
  height: 40px;
  margin: auto;
}

.text-right {
  text-align: right;
}

@media only screen and (max-width: 575px) {
  .panel-container {
    flex-direction: column;
  }
}

@media only screen and (max-width: 575px) {
  .panel-content.swap-panel-content  {
    padding: 25px 30px 25px 30px;
  }
}



</style>
