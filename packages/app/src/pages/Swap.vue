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
                    class="input-custom"
                  />
                </div>
              </div>
              <div class="text-right">
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
                <div class="panel-explanation">
                  <input
                    type="text"
                    @input="liquidity()"
                    v-model="liquidityAmount"
                    class="input-custom"
                  />
                </div>
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
            <button
              type="submit"
              @click="handleAddLiquidity()"
              class="btn-custom"
            >
              {{ addLiquidityButtonString }}
            </button>
          </div>
        </div>
      </div>
      <DappFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watchEffect, computed } from "vue";
import { useStore } from "@/store";
import {
  calculateCAPLUSDPrice,
  checkAllAllowances,
  checkAllowance,
  format,
  stringToNumber,
} from "@/utils";
import { checkConnection, checkBalance } from "@/utils/notifications";

const store: any = useStore();
let swapAmount = ref(0);
let swapTokenSymbol: Ref<string> = ref("CAPL");
let swapToTokenSymbol: Ref<string> = ref("USDC");

let swapTokenResult = ref(0);
let swapButtonString = ref("Swap");

let usdcLiquidity: Ref<number> = ref(0);
let caplLiquidity: Ref<number> = ref(0);

// liquidity stuff
let liquidityAmount: Ref<number> = ref(0);
let addLiquidityButtonString: Ref<string> = ref("Add Liquidity");
let approvalFlag: Ref<string | null> = ref(null);

// this loops checks the store values for the token allowances and dynamically changes button text based on that info
  const isUserConnected = computed(
    () => store.getters["accounts/isUserConnected"]
  );
watchEffect(async () => {
  (! isUserConnected.value || await checkAllowance(
    store,
    swapTokenSymbol.value,
    Number(swapAmount.value),
    "balancer"
  ))
    ? (swapButtonString.value = "Swap")
    : (swapButtonString.value = "Approve");

  const { approvalRequired, flag } = await checkAllAllowances(store, [
    usdcLiquidity.value,
    caplLiquidity.value,
  ]);
  approvalFlag.value = flag;
  approvalRequired
    ? addLiquidityButtonString.value == "Add Liquidity"
    : addLiquidityButtonString.value == "Approve";
});

// handles swapping button logic, dependant on current string
const handleSwap = async () => {
  if (checkConnection(store) && checkBalance(swapAmount.value)) {
    swapButtonString.value == "Swap" ? await swap() : await approve();
  }
};

// handles adding liquidity button logic, dependant on current string
// we can assume that if usdcLiquidity > 0 then caplLiquidity > 0
const handleAddLiquidity = async () => {
  if (checkConnection(store) && checkBalance(usdcLiquidity.value)) {
    addLiquidityButtonString.value == "Add Liquidity"
      ? await addLiquidity()
      : await approveAll();
  }
};

// approves a single token for swapping
const approve = async () => {
  const symbol = swapTokenSymbol.value;
  await store.dispatch("tokens/approveBalancerVault", {
    symbol,
    amount: swapAmount.value,
  });
};

// handles three cases
// 1. USDC Approvals, 2. CAPL approvals, 3. Both tokens approvals
// TODO: Refactor these store.dispatch calls into individual functions
const approveAll = async () => {
  if (!approvalFlag.value) return;

  if (approvalFlag.value == "USDC") {
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "USDC",
      amount: usdcLiquidity.value,
    });
  } else if (approvalFlag.value == "CAPL") {
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "CAPL",
      amount: caplLiquidity.value,
    });
  } else {
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "USDC",
      amount: usdcLiquidity.value,
    });
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "CAPL",
      amount: caplLiquidity.value,
    });
  }
};

async function swap() {
  await store.dispatch("balancer/batchSwap");
}

function addLiquidity() {
  store.dispatch("balancer/addLiquidity");
}

function resetInput2() {
  // todo: implement...
}

// allows for a user to switch between swapping USDC and CAPL
const switchTokens = () => {
  swapAmount.value = stringToNumber(swapTokenResult.value);
  if (swapTokenSymbol.value == "CAPL") {
    swapTokenSymbol.value = "USDC";
    swapToTokenSymbol.value = "CAPL";
  } else {
    swapTokenSymbol.value = "CAPL";
    swapToTokenSymbol.value = "USDC";
  }

  exchangeCAPLToUSDC();
};

// conversion rates for swaps
// TODO: conversion rates for liquidity
async function exchangeCAPLToUSDC() {
  if (checkConnection(store)) {
    await store.dispatch("balancer/getPoolTokens");

    const exchangedBalance = calculateCAPLUSDPrice(
      swapAmount.value,
      swapTokenSymbol.value,
      store.getters["balancer/getPoolTokens"]
    );
    swapTokenResult.value = format(exchangedBalance);
  }
}
function liquidity() {
  if (store.getters["accounts/isUserConnected"]) {
    /*
    const exchangedBalance = calculateCAPLUSDPrice(
      liquidityToken.value,
      "USDC",
      store.getters["balancer/getPoolTokens"]
    );
    liquidityTokenResult.value = exchangedBalance;
    */
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
  margin: 0 auto 35px auto;
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
