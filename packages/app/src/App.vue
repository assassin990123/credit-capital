<template>
  <div>
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { useStore } from "@/store";
import { computed, watch } from "vue";

document.title = "CreditCapital: Your Personal, Private Hedge Fund";
let interval: any;
const store = useStore();
// create contract instances with provider
store.dispatch("contracts/setContracts");

const isConnected = computed(() => store.getters["accounts/isUserConnected"]);

// watch for user connection
watch(isConnected, async () => {
  if (isConnected.value) {
    interval = setInterval(w3Lopp, 2000);
  } else {
    clearInterval(interval);
  }
});

const w3Lopp = () => {
  store.dispatch("tokens/getAllowances");
  store.dispatch("tokens/getTokenBalances");
  // update user position states
  store.dispatch("rewards/getRewardsInfo");
  store.dispatch("rewards/getPendingRewards");
  store.dispatch("dashboard/fetchTVL");
};
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
