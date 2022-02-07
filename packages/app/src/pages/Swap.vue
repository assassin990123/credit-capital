<template>
  <div class="home">
    <div class="swap-container">
      <div class="panel-container inner-container">
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
                <input type="text" @input="changeCAPLToUSDC()" v-model="swapToken" />
              </div>
              <div class="text-right">
                <div>BALANCE: {{ CAPLBalance }}</div>
                <div>CAPL</div>
              </div>
            </div>
            <button class="btn-switch">&darr;&uarr;</button>
            <div class="panel-display">
              <div>
                <div>RECEIVE</div>
                <input type="text" v-model="swapTokenResult" disabled />
              </div>
              <div class="text-right">
                <div>BALANCE: 000</div>
                <div>USDC</div>
              </div>
            </div>
            <button @click="getBalance()">ENTER</button>
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
                <div>BALANCE:</div>
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
      <Footer />
    </div>
  </div>
</template>

<script lang="ts">
// import Footer from "@/components/Footer.vue";
// import { computed } from "vue";
import { useStore } from "@/store"; 
import { calculateCAPLUSDPrice } from "@/utils";

  export default {
    data() {
      return {
        swapToken: "",
        swapTokenResult: 0,
        store: useStore(),
        CAPLBalance: 0
      }
    },
    methods: {
      getBalance() {

        if (this.store.getters['accounts/isUserConnected']) {
          this.store.getters['balancer/getBatchSwap']
        }
      },
      changeCAPLToUSDC() {

        if (this.store.getters['accounts/isUserConnected']) {

          const exchangedBalance = calculateCAPLUSDPrice(this.swapToken, "USDC", this.store.getters['balancer/getPoolTokens']);
          this.swapTokenResult = exchangedBalance;
        }
      }
    },
  }
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
</style>
