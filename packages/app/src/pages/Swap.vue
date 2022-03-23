<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">swap</h1>
          <div class="panel-content swap-panel-content liquidity-box-main">
            <div class="panel-header">
              <div class="panel-explanation">Swap CAPL and USDC tokens</div>
            </div>
            <div class="panel-display1">
              <div class="swap-description">
                <div class="panel-explanation"><span>send</span></div>
                <div class="panel-explanation">{{ swapTokenSymbol }}</div>
              </div>
              <div class="swap-input-body">
                <div class="swap-input-inner">
                  <input
                    type="number"
                    @input="exchangeCAPLToUSDC()"
                    v-model="swapAmount"
                    class="input-custom"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="myBalance" style="margin-top:-20px;">My Balance
                <div v-if="swapTokenSymbol === 'USDC'" class="panel-explanation myBalance" @click="insertBalanceUSDC">
                  <a>{{ usdcBalance }} USDC</a>
                </div>
                <div v-else class="panel-explanation myBalance" @click="insertBalanceCAPL">
                  <a>{{ caplBalance }} CAPL</a>
                </div>
              </div>
            </div>
            <button class="btn-switch" @click="switchTokens">&#8635;</button>
            <div class="panel-display1">
              <div class="swap-description">
                <div class="panel-explanation"><span>receive</span></div>
              </div>
              <div class="swap-input-body">
                <div class="swap-input-below">
                  <div class="swap-token-symbol">{{ swapToTokenSymbol }}</div>
                  <div class="panel-explanation">{{ swapTokenResult }}</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="handleSwap()"
              :class="swapButtonClassName"
              :disabled="swapButtonDisabled"
            >
              {{ swapButtonString }}
            </button>
            <div class="explainer">
              Use this page to trade USDC and CAPL tokens. Trades are subject to a 0.3% swap fee.
              Want to earn instead? Consider using your tokens to <router-link to="liquidity" class="button">Add Liquidity</router-link> to this pool.
            </div>
          </div>
        </div>
      </div>
      <DappFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import DappFooter from "@/components/DappFooter.vue";
import { ref, watch, computed } from "vue";
import { useStore } from "@/store";
import {
  calculateCAPLUSDPrice,
  checkAllowance,
  format,
  stringToNumber,
} from "@/utils";
import {
  checkConnection,
  checkBalance,
  checkAvailability,
} from "@/utils/notifications";

const store: any = useStore();
let swapAmount = ref(0);
let swapTokenSymbol = ref("USDC");
let swapToTokenSymbol = ref("CAPL");

let swapTokenResult = ref("");
let swapButtonString = ref("Swap");
let swapButtonClassName = ref("btn-custom-gray");

const caplBalance = computed(() => store.getters["tokens/getCAPLBalance"]);
const usdcBalance = computed(() => store.getters["tokens/getUSDCBalance"]);

const isUserConnected = computed(
  () => store.getters["accounts/isUserConnected"]
);
const chainId = computed(() => store.getters["accounts/getChainId"]);

let swapButtonDisabled = ref(false)

watch(isUserConnected, async () => {
  if (isUserConnected.value && chainId.value === parseInt(process.env.VUE_APP_NETWORK_ID as string)) {
    if (swapAmount.value == 0) {
      swapButtonClassName.value = "btn-custom-gray";
    } else {
      (await checkAllowance(
        store,
        swapTokenSymbol.value,
        Number(swapAmount.value),
        "balancer"
      ))
        ? ((swapButtonString.value = "Swap"),
          (swapButtonClassName.value = "btn-custom-green"),
          (swapButtonDisabled.value = false))
        : ((swapButtonString.value = "Approve"),
          (swapButtonClassName.value = "btn-custom"));
    }
    swapTokenSymbol.value == "CAPL"
      ? handleAvailability(swapAmount.value, caplBalance.value)
      : handleAvailability(swapAmount.value, usdcBalance.value);
  }

  swapTokenSymbol.value == "USDC"
  ? swapAmount.value = Number(parseFloat((swapAmount.value).toString()).toFixed(6))
  : swapAmount.value = Number(parseFloat((swapAmount.value).toString()).toFixed(18))
});

const handleAvailability = (amount: number, balance: number) => {
  if (checkAvailability(amount, balance)) return
  else {
    swapButtonDisabled.value = true
    swapButtonClassName.value = "btn-custom-gray";
  }
}

// handles swapping button logic, dependant on current string
const handleSwap = async () => {
  if (checkConnection(store) && checkBalance(swapAmount.value)) {
    swapButtonString.value == "Swap" ? await swap() : await approve();
  }
};

// handles adding liquidity button logic, dependant on current string
// we can assume that if usdcLiquidity > 0 then caplLiquidity > 0

// approves a single token for swapping
const approve = async () => {
  const symbol = swapTokenSymbol.value;
  await store.dispatch("tokens/approveBalancerVault", {
    symbol,
  });
};

// handles three cases
// 1. USDC Approvals, 2. CAPL approvals, 3. Both tokens approvals
// TODO: Refactor these store.dispatch calls into individual functions

async function swap() {
  await store.dispatch("balancer/singleSwap", {
    amount: swapAmount.value,
    symbol: swapTokenSymbol.value,
  });
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
async function exchangeCAPLToUSDC() {
  if (checkConnection(store) && Number(chainId.value) == parseInt(process.env.VUE_APP_NETWORK_ID!)) {
    await store.dispatch("balancer/getPoolTokens");

    const exchangedBalance = calculateCAPLUSDPrice(
      swapAmount.value,
      swapTokenSymbol.value,
      store.getters["balancer/getPoolTokens"]
    );
    swapTokenResult.value = format(exchangedBalance)!;
  }
}
const insertBalanceCAPL = () => {
  swapAmount.value = caplBalance.value;
  exchangeCAPLToUSDC();
};

const insertBalanceUSDC = () => {
  swapAmount.value = usdcBalance.value;
  exchangeCAPLToUSDC();
};
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

/* @media only screen and (max-width: 575px) {
  .panel-container {
    flex-direction: column;
  }
}

@media only screen and (max-width: 575px) {
  .panel-content.swap-panel-content {
    padding: 25px 30px 25px 30px;
  }
} */
.swap-description {
  display: flex;
  flex: row;
  justify-content: space-between;
  color: #7f7f7f;
}

.swap-input-body {
  margin: 10px 0;
  border-radius: 20px;
  border: 1px solid #f7f8fa;
  background: #fff;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.swap-input-inner {
  border-radius: 20px;
  background: #fff;
  z-index: 1;
  width: initial;
  transition: height 1s ease 0s;
}

.swap-input {
  -webkit-box-shadow: inset 1px 1px 10px 5px rgba(247, 248, 250, 1);
  -moz-box-shadow: inset 1px 1px 10px 5px rgba(247, 248, 250, 1);
  box-shadow: inset 1px 1px 10px 5px rgba(247, 248, 250, 1);
  background: #f7f8fa;
  border-radius: 20px;
  border: none;
  width: 100%;
  height: auto;
  padding: 5px 10px;
  font-size: 25px;
  color: #000;
  font-weight: 700;
  border: 1px solid #f7f8fc;
}

.swap-input:hover {
  border: 1px solid #ffca03;
}

.swap-input-below {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  padding: 10px 10px;
  font-size: 20px;
  font-weight: 700;
  background: #f7f8fa;
  border-radius: 20px;
}

.swap-token-symbol {
  padding: 0 20px;
  background: rgb(237, 238, 242);
  border: 1px solid rgb(237, 238, 242);
  border-radius: 20px;
  box-shadow: rgb(0 0 0 / 8%) 0px 6px 10px;
  cursor: pointer;
}

.swap-token-symbol:hover {
  background: rgb(206, 208, 217);
}
</style>
