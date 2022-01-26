<template>
  <div>
    <Navbar id="navigation" />
    <Home />
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Home from "./components/Home.vue";
</script>

<style>
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
