<template>
  <div id="nft-profile-wrap">
    <div class="nft-profile-left">
      <div class="nft-name">
        {{ name }}
      </div>
      <div class="nft-id">
        {{ tokenID }}
      </div>
      <img class="nft-img" :src="image" />
      <div class="nft-value">
        {{ value }}
      </div>
      <div class="nft-cap">
        {{ cap }}
      </div>
    </div>
    <div class="nft-profile-right">
      <div class="nft-description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
//@ts-ignore
import boat from "@/assets/boat.jpeg";

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  tokenID: {
    type: Number,
    default: 0,
  },
  value: {
    type: Number,
    default: 0,
  },
  index: {
    type: Number,
    default: 0,
  },
  cap: {
    type: Number,
    default: 0,
  },
});

const image = computed(() => {
  switch (props.image) {
    case "boat":
      return boat;
    default:
      return "";
  }
});
</script>

<style>
#nft-profile-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.nft-profile-right,
.nft-profile-left {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
