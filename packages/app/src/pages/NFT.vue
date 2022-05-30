<template>
  <div id="nft-wrap" class="dashboard-container">
    <NFT />
  </div>
</template>

<script setup lang="ts">
import NFT from "@/components/NFT/NFTList.vue";
</script>

<style>
#nft-wrap {
  height: max-content;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 7em;
}
</style>
