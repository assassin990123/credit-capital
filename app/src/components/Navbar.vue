<template>
  <div class="navigation">
    <div class="nav-inner-wrap">
      <button class="connectButton" @click="connectWeb3">
        {{ buttonString }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import { ref, watchEffect } from "vue";
// @ts-ignore
import { web3Interface } from "@/utils/wallet";

export default {
  setup() {
    const store = useStore();
    const web3Connection = new web3Interface();

    let buttonString = ref("Connect");

    const connected = computed(() => store.getters.getConnected);
    const wallet = computed(() => store.getters.getWallet);

    watchEffect(() => {
      connected.value
        ? (buttonString.value = shortenAddress(wallet.value))
        : (buttonString.value = "Connect");
    });

    const shortenAddress = (address: string, chars = 3): string => {
      return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    };

    function showMoons() {
      store.commit("showMoons", true);
    }

    function connectWeb3() {
      if (connected.value) return;
      web3Connection.connect();
    }

    return {
      connected,
      connectWeb3,
      buttonString,
      showMoons,
    };
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital@1&family=Orbitron&display=swap");

.navigation {
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  width: 8%;
}

.connectButton {
  color: #e0e1e4;
  font-size: 1.2em;
  font-family: "Kanit", sans-serif;
  font-family: "Orbitron", sans-serif;
  backdrop-filter: blur(0px) saturate(200%);
  -webkit-backdrop-filter: blur(0px) saturate(200%);
  background-color: rgba(17, 25, 40, 0.9);
  border-radius: 22.5px;
  border: 1px solid rgba(255, 255, 255, 0.125);
  margin: 0.5em;
  height: 2.5em;
  width: 6.25em;
  cursor: pointer;
  z-index: 2;
}
.nav-inner-wrap {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 25%;
}
.navlink {
  color: #e0e1e4;
  font-size: 1.2em;
  font-family: "Kanit", sans-serif;
  font-family: "Orbitron", sans-serif;
  cursor: pointer;
  z-index: 10;
}

/** MEDIA QUERIES */
@media screen and (min-width: 1000px) {
}
</style>
