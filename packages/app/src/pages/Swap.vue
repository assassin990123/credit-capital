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
                <div class="panel-explanation">
                  <input
                    type="text"
                    @input="exchangeCAPLToUSDC()"
                    v-model="swapToken"
                    class="input-custom"

                  />
                </div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span>&nbsp;000</div>
                <div class="panel-explanation">CAPL</div>
              </div>
            </div>
            <button @click="resetInput()" class="btn-switch">&#8635;</button>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>receive</span></div>
                <div class="panel-explanation">{{ swapTokenResult }}</div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">USDC</div>
              </div>
            </div>
            <button type="button" @click="swap()" class="btn-custom">
              {{ swapButtonString }}
            </button>
          </div>
        </div>
        <div class="panel stake-panel">
          <h1 class="panel-title">liquidity</h1>
          <div class="panel-content swap-panel-content">
            <div class="panel-header">
              <div class="panel-explanation">functionality explanation</div>
              <div class="ellipses">&hellip;</div>
            </div>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>amount</span></div>
                <div class="panel-explanation"> <input
                    type="text"
                    @input="liquidity()"
                    v-model="liquidityToken"
                    class="input-custom"

                  /></div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span></div>
                <div class="panel-explanation">CAPL</div>
              </div>
            </div>
            <button class="btn-switch" @click="resetInput2()">&#8635;</button>
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
            <button type="submit" @click="joinPool()" class="btn-custom">
              Add
            </button>
          </div>
        </div>
      </div>
      <DappFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
// import Footer from "@/components/Footer.vue";
import { ref, computed } from "vue";
// import DappFooter from "@/components/DappFooter.vue";
import { useStore } from "@/store";
import { calculateCAPLUSDPrice, format } from "@/utils";
import { useToast } from "vue-toastification";

const store = useStore();
let swapToken = ref("");
let swapTokenResult = ref("");
let liquidityToken = ref("");
let liquidityTokenResult = ref("");

function resetInput() {
  this.swapToken = "";
 
      //this.email = "";

}
function resetInput2(){
   this.liquidityToken = "";
}

const isConnected = computed(() => store.getters["accounts/isUserConnected"]);
async function swap() {
  if (isConnected.value) {
    const wallet = computed(() => store.getters["accounts/getActiveAccount"]);
    const contract = computed(() => store.getters["contracts/getBalancerVaultContract"]);

    if (swapButtonString.value === 'Approve') {
      await store.dispatch("tokens/approve", {
        contract: contract.value,
        amount: parseFloat(swapToken.value),
        address: wallet.value,
      });
      swapButtonString.value = "Enter";
    } else {
      const allowance = await store.dispatch("tokens/checkAllowance", {
        contract: contract.value,
        amount: parseFloat(swapToken.value),
        address: wallet.value,
      });

      if (allowance) {
        store.dispatch("balancer/batchSwap");
      } else {
        swapButtonString.value = "Approve";
      }
    }
  } else if (!isConnected.value) {
    toast.info("Please connect your wallet!");
  }
}

function joinPool() {
  if (isConnected.value) {
    store.dispatch("balancer/joinPool");
  }
}

async function exchangeCAPLToUSDC() {
  swapButtonString.value = "Enter";
  if (isConnected.value) {
    await store.dispatch("balancer/getPoolTokens");

    const exchangedBalance = calculateCAPLUSDPrice(
      swapToken.value,
      "USDC",
      store.getters["balancer/getPoolTokens"]
    );
    swapTokenResult.value = format(exchangedBalance);
  } else if (!isConnected.value) {
    toast.info("Please connect your wallet!");
  }
}
function liquidity() {
  if (store.getters["accounts/isUserConnected"]) {
    const exchangedBalance = calculateCAPLUSDPrice(
      liquidityToken.value,
      "USDC",
      store.getters["balancer/getPoolTokens"]
    );
    liquidityTokenResult.value = exchangedBalance;
  }
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
.input-custom {
    display: inline-block;
    padding: 0px;
    margin-top: 10px;
    border-radius: 20px;
    background: transparent;
    border: 1px solid #ff8900;
    text-align: center;
    font-weight: bold;
    color: #2f2c23;
    font-size: 22px;
    max-width: 150px;
    margin: 0 auto 35px auto;}


@media only screen and (max-width: 575px) {
  .panel-container {
    flex-direction: column;
  }
}

@media only screen and (max-width: 575px) {
  .panel-content.swap-panel-content {
    padding: 25px 30px 25px 30px;
  }
}
</style>
