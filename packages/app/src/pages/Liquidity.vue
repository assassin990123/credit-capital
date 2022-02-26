<template>
  <div class="home stack-page">
    <div class="swap-container">
      <div class="panel-container inner-container">
        <div class="panel stake-panel">
          <h1 class="panel-title">liquidity</h1>
          <div class="panel-content swap-panel-content liquidity-box-main">
            <div class="panel-header">
              <div class="panel-explanation"></div>
              <div class="ellipses">&hellip;</div>
            </div>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>amount</span></div>
                <div class="panel-explanation">
                  <input
                    type="text"
                    @input="onChange()"
                    v-model="caplLiquidity"
                    class="input-custom"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span></div>
                <div class="panel-explanation">CAPL</div>
              </div>
            </div>
            <div class="panel-display swap-panel-display">
              <div>
                <div class="panel-explanation"><span>amount</span></div>
                <div class="panel-explanation">
                  <input
                    type="text"
                    @input="onChange()"
                    v-model="usdcLiquidity"
                    class="input-custom"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="text-right">
                <div class="panel-explanation"><span>balance:</span> 000</div>
                <div class="panel-explanation">USDC</div>
              </div>
            </div>
            <button
              type="submit"
              @click="handleAddLiquidity()"
              :class="
                addLiquidityButtonDisabled ? 'btn-custom-gray' : 'btn-custom'
              "
              :disabled="addLiquidityButtonDisabled"
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
import DappFooter from "@/components/DappFooter.vue";
import { ref, Ref, watchEffect, computed } from "vue";
import { useStore } from "@/store";
import { checkAllAllowances } from "@/utils";
import { checkConnection, checkAvailability } from "@/utils/notifications";

const store: any = useStore();
let usdcLiquidity: Ref<number> = ref(0);
let caplLiquidity: Ref<number> = ref(0);

let approvalFlag: Ref<string | null> = ref("");
let addLiquidityButtonString: Ref<string> = ref("Add Liquidity");
let addLiquidityButtonDisabled = ref(true);

const isUserConnected = computed(
  () => store.getters["accounts/isUserConnected"]
);

const caplBalance = computed(() => store.getters["tokens/getCAPLBalance"]);
const usdcBalance = computed(() => store.getters["tokens/getUSDCBalance"]);

watchEffect(async () => {
  if (!isUserConnected.value) {
    return;
  }
  if (
    checkAvailability(caplLiquidity.value, caplBalance) &&
    checkAvailability(usdcLiquidity.value, usdcBalance)
  ) {
    if (
      Number(caplLiquidity.value) === 0 &&
      Number(usdcLiquidity.value) === 0
    ) {
      addLiquidityButtonDisabled.value = true;
      addLiquidityButtonString.value = "Add Liquidity";
    } else {
      addLiquidityButtonDisabled.value = false;
      const { approvalRequired, flag } = await checkAllAllowances(store, [
        Number(usdcLiquidity.value),
        Number(caplLiquidity.value),
      ]);

      approvalFlag.value = flag;

      approvalRequired
        ? (addLiquidityButtonString.value = "Approve")
        : (addLiquidityButtonString.value = "Add Liquidity");
    }
  }
});

// handles swapping button logic, dependant on current string

// handles adding liquidity button logic, dependant on current string
// we can assume that if usdcLiquidity > 0 then caplLiquidity > 0
const handleAddLiquidity = async () => {
  if (checkConnection(store)) {
    addLiquidityButtonString.value == "Add Liquidity"
      ? await addLiquidity()
      : await approveAll();
  }
};

// handles three cases
// 1. USDC Approvals, 2. CAPL approvals, 3. Both tokens approvals
// TODO: Refactor these store.dispatch calls into individual functions
const approveAll = async () => {
  if (!approvalFlag.value) return;

  if (approvalFlag.value == "USDC") {
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "USDC",
      amount: usdcBalance.value,
    });
  } else if (approvalFlag.value == "CAPL") {
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "CAPL",
      amount: caplBalance.value,
    });
  } else {
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "USDC",
      amount: usdcBalance.value,
    });
    await store.dispatch("tokens/approveBalancerVault", {
      symbol: "CAPL",
      amount: caplBalance.value,
    });
  }
};

function addLiquidity() {
  store.dispatch("balancer/addLiquidity", {
    caplAmount: Number(caplLiquidity.value),
    usdcAmount: Number(usdcLiquidity.value),
  });
}

function onChange() {
  checkConnection(store);
}

// allows for a user to switch between swapping USDC and CAPL

// conversion rates for swaps
// TODO: conversion rates for liquidity
</script>

<style>
.swap-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}
.liquidity-box-main {
  width: 60%;
  margin: 0 auto;
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
</style>
