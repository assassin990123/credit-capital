<template>
  <!-- current NFTs Contract Tab -->
  <div class="treasury-fund-row">
    <div class="current-nft-tab-main">
      <div class="current-nft-tab-head">
        <h2>Current NFTs in Contract</h2>
      </div>
      <div class="current-nft-tabs">
        <button
          type="button"
          v-on:click="activetab = '1'"
          v-bind:class="[activetab === '1' ? 'active' : '']"
        >
          Card
        </button>
        <button
          type="button"
          v-on:click="activetab = '2'"
          v-bind:class="[activetab === '2' ? 'active' : '']"
        >
          List
        </button>
        <button
          type="button"
          v-on:click="activetab = '3'"
          v-bind:class="[activetab === '3' ? 'active' : '']"
        >
          All
        </button>
      </div>
      <CurrentNFTsCard v-if="activetab === '1'" />
      <CurrentAssets v-if="activetab === '2'" />
      <CurrentNFTsCard v-if="activetab === '3'" />
      <CurrentAssets v-if="activetab === '3'" />
    </div>
  </div>
</template>

<script>
import CurrentAssets from "@/components/CurrentNFTsTab/CurrentAssets.vue";
import CurrentNFTsCard from "@/components/CurrentNFTsTab/CurrentNFTsCard.vue";

export default {
  name: "CurrentNFTsTab",
  data() {
    return {
      activetab: "1",
    };
  },
  components: {
    CurrentAssets,
    CurrentNFTsCard,
  },
};
</script>

<style>
/* nft tabs */
.current-nft-tab-main {
  margin: 0 0 50px 0;
}
.current-nft-tab-head h2 {
  text-align: center;
  margin: 0;
  color: #000;
  padding: 0 0 30px 0;
}
.current-nft-tabs {
  display: flex;
  justify-content: center;
}
.current-nft-tabs button {
  background: transparent;
  border: 2px solid #ff8900;
  border-radius: 25px;
  width: 150px;
  text-transform: uppercase;
  font-size: 22px;
  font-weight: 700;
  margin: 0 15px;
  transition: 0.3s all ease;
}
.current-nft-tabs button:hover,
.current-nft-tabs button:focus {
  background: #ff8900;
  color: #fff;
}
.current-nft-tabs button.active {
  background: #ff8900;
  color: #fff;
}
</style>
