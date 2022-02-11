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
                    v-model="swapAmount"
                  />
                </div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">{{ swapTokenSymbol }}</div>
              </div>
            </div>
            <button class="btn-switch" @click="switchTokens">&#8635;</button>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>receive</span></div>
                <div class="panel-explanation">{{ swapTokenResult }}</div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">{{ swapToTokenSymbol }}</div>
              </div>
            </div>
            <button type="button" @click="handleSwap()" class="btn-custom">
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
import { ref, computed, Ref, watchEffect } from "vue";
// import DappFooter from "@/components/DappFooter.vue";
import { useStore } from "@/store";
import { calculateCAPLUSDPrice, checkAllowance, format } from "@/utils";
import { useToast } from "vue-toastification";

const store: any = useStore();
const toast = useToast();
let swapAmount = ref(0);
let swapTokenSymbol: Ref<string> = ref("CAPL");
let swapToTokenSymbol: Ref<string> = ref("USDC");

let swapTokenResult = ref(0);
let swapButtonString = ref("Swap");

const isConnected = computed(() => store.getters["accounts/isUserConnected"]);

watchEffect(async () => {
  (await checkAllowance(
    store,
    swapTokenSymbol.value,
    Number(swapAmount.value),
    "balancer"
  ))
    ? (swapButtonString.value = "Swap")
    : (swapButtonString.value = "Approve");
});

const handleSwap = async () => {
  if (!isConnected.value) return;
  swapButtonString.value == "Swap" ? await swap() : await approve();
};

const approve = async () => {
  const symbol = swapTokenSymbol.value;
  await store.dispatch("tokens/approveBalancerVault", {
    symbol,
    amount: swapAmount.value,
  });
};

async function swap() {
  if (isConnected.value) {
    await store.dispatch("balancer/batchSwap");
  } else if (!isConnected.value) {
    toast.info("Please connect your wallet!");
  }
}

function joinPool() {
  if (isConnected.value) {
    store.dispatch("balancer/joinPool");
  }
}

const switchTokens = () => {
  if (swapTokenSymbol.value == "CAPL") {
    swapTokenSymbol.value = "USDC";
    swapToTokenSymbol.value = "CAPL";
  } else {
    swapTokenSymbol.value = "CAPL";
    swapToTokenSymbol.value = "USDC";
  }
};

async function exchangeCAPLToUSDC() {
  if (isConnected.value) {
    await store.dispatch("balancer/getPoolTokens");

    const exchangedBalance = calculateCAPLUSDPrice(
      swapAmount.value,
      swapTokenSymbol.value,
      store.getters["balancer/getPoolTokens"]
    );
    swapTokenResult.value = format(exchangedBalance);
  } else if (!isConnected.value) {
    toast.info("Please connect your wallet!");
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
  .panel-content.swap-panel-content {
    padding: 25px 30px 25px 30px;
  }
}
</style>
