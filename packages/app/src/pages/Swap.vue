<template>
  <div class="home">
    <div class="swap-container">
      <div class="panel-container">
        <div class="panel">
          <h1 class="panel-title">SWAP</h1>
          <div class="panel-content">
            <div class="panel-header">
              <div class="panel-explanation">FUNCTIONALITY EXPLANATION</div>
              <div>&hellip;</div>
            </div>
            <div class="panel-display">
              <div>
                <div>SEND</div>
                <div>000</div>
              </div>
              <div class="text-right">
                <div>BALANCE: 000</div>
                <div>CAPL</div>
              </div>
            </div>
            <button class="btn-switch">&darr;&uarr;</button>
            <div class="panel-display">
              <div>
                <div>RECEIVE</div>
                <div>000</div>
              </div>
              <div class="text-right">
                <div>BALANCE: 000</div>
                <div>USDC</div>
              </div>
            </div>
            <button>ENTER</button>
          </div>
        </div>
        <div class="panel">
          <h1 class="panel-title">LIQUIDITY</h1>
          <div class="panel-content">
            <div class="panel-header">
              <div class="panel-explanation">FUNCTIONALITY EXPLANATION</div>
              <div>&hellip;</div>
            </div>
            <div class="panel-display">
              <div>
                <div>AMOUNT</div>
                <div>000</div>
              </div>
              <div class="text-right">
                <div>BALANCE:    </div>
                <div>CAPL</div>
              </div>
            </div>
            <button class="btn-switch">&darr;&uarr;</button>
            <div class="panel-display">
              <div>
                <div>AMOUNT</div>
                <div>000</div>
              </div>
              <div class="text-right">
                <div>BALANCE: 000</div>
                <div>USDC</div>
              </div>
            </div>
            <button>ADD</button>
          </div>
        </div>
      </div>
      <div class="footer-container">
        <div class="footer-item">TOTAL LOCKED VALUE</div>
        <div class="footer-item">PRICE OF CAPL</div>
        <div class="footer-item">UESR POSITION</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style>
.swap-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.panel-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 60px;
}

.panel {
  flex: 1;
  margin: 0 8%;
  height: 50vh;
}

.panel-title {
  text-align: center;
}

.panel-content {
  border: 1px solid #000000;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.footer-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  border: 1px solid #000000;
  padding: 20px;
  margin: 0 5% 30px;
}

.footer-item {
  border: 1px solid #000000;
  padding: 20px;
  flex: 1;
  margin: 0 5%;
  text-align: center;
}

</style>
