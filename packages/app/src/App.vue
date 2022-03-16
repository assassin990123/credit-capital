<template>
  <div>
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useAccounts } from "./use/accounts";
import { useContracts } from "./use/contracts";

import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { useTokens } from "./use/tokens";
import { useRewards } from "./use/rewards";
import { useDashboard } from "./use/dashboard";

const { connected } = useAccounts()
const { setContracts } = useContracts()
const { getAllowances, getTokenBalances } = useTokens()
const { getRewardsInfo, getPendingRewards } = useRewards()
const { fetchTVL } = useDashboard()

let interval: any;

const w3Lopp = () => {
  getAllowances()
  getTokenBalances()
  // update user position states
  getRewardsInfo()
  getPendingRewards()
  fetchTVL()
};

watch(connected, (connected) => {
  if (connected) {
    interval = setInterval(w3Lopp, 2000)
  } else {
    clearInterval(interval)
  }
})

onMounted(setContracts)
</script>

<style>
@import url("../public/css/vendors.css");
@import url("../public/css/plugins.css");
@import url("../public/css/icons.css");
@import url("../public/css/style.css");
@import url("../public/css/responsive.css");
home,
body {
  padding: 0;
  margin: 0;
}
#navigation {
  position: absolute;
}
.web3modal-modal-container {
  color: #e0e1e4;
  font-size: 1.5em;
  font-family: "Kanit", sans-serif !important;
  font-family: "Orbitron", sans-serif !important;
}
.web3modal-modal-card {
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  background-color: rgba(0, 0, 0, 0.75) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.125) !important;
}
.web3modal-provider-container {
  background-color: transparent !important;
}
</style>
