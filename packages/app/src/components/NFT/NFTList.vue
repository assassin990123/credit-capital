<template>
  <div id="nft-list-wrap">
    <ul>
      <li v-for="config in nftConfig" :key="config.index">
        <NFTProfile
          :name="config.name"
          :description="config.description"
          :tokenID="config.tokenID"
          :image="config.image"
          :value="config.value"
          :cap="config.cap"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { nftConfig } from "@/constants";
import NFTProfile from "./NFTProfile.vue";
</script>

<style>
#nft-list-wrap {
  width: 97.5%;
  height: max-content;
  border: 1px solid lightgrey;
}
</style>
