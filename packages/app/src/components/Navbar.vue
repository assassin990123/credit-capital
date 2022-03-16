<template>
  <!-- Start Navbar Area -->
  <div class="navbar-area">
    <div class="acavo-responsive-nav">
      <div class="container">
        <div class="acavo-responsive-menu" @click="isShow = !isShow">
          <div class="logo">
            <router-link to="/">
              <img src="/images/logo-white.png" alt="logo" />
            </router-link>
          </div>
          <a class="mobile-menu-icon" href="javascript:void(0);">
            <i class="las la-bars"></i
          ></a>
        </div>
      </div>
    </div>
    <div class="acavo-nav" v-show="isShow">
      <div class="container">
        <nav class="navbar navbar-expand-md navbar-light">
          <div class="logo-mobile" @click="isShow = !isShow">
            <router-link to="/">
              <img src="/images/logo-white.png" alt="logo" />
            </router-link>
          </div>
          <div class="navbar-collapse mean-menu" @click="isShow = !isShow">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link to="reward">Rewards</router-link>
              </li>
              <li class="nav-item">
                <router-link to="stake">Stake</router-link>
              </li>
              <li class="nav-item">
                <router-link to="liquidity">Liquidity</router-link>
              </li>
              <li class="nav-item">
                <router-link to="swap">Swap</router-link>
              </li>
              <!-- <li class="nav-item">
                <router-link to="treasury">Treasury</router-link>
              </li> -->
            </ul>
          </div>
          <div>
            <ul class="nav-btn-custom" @click="isShow = !isShow">
              <li class="nav-item">
                <span>CAPL ${{ CAPLPrice }}</span>
              </li>
              <li class="nav-item">
                <router-link to="dashboard"
                  ><button class="connectButton">Dashboard</button>
                </router-link>
              </li>
              <li class="nav-item">
                <button class="connectButton" @click="connectWeb3">
                  {{ buttonString }}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <div class="others-option-for-responsive">
      <div class="container">
        <div class="dot-menu">
          <div class="inner" @click="isShow = !isShow">
            <div class="circle circle-one"></div>
            <div class="circle circle-two"></div>
            <div class="circle circle-three"></div>
          </div>
        </div>

        <div class="container">
          <div class="option-inner">
            <div class="others-option">
              <div class="option-item">
                <a href="contact.html" class="btn theme-btn-1"
                  >Get Started <i class="las la-angle-right"></i
                ></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Navbar Area -->
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { shortenAddress, caplToUSD, format } from "@/utils"
import { useAccounts } from "@/use/accounts"
import { useBalancer } from "@/use/balancer";
import { useWeb3 } from "@/use/web3";

const {
  connected,
  activeAccount
} = useAccounts()
const { getPoolTokens } = useBalancer()
const { connectWeb3 } = useWeb3()

const isShow = ref(false)
let interval: any

const poolTokens = ref('0' as string | undefined)
const CAPLPrice = computed(() => poolTokens.value || '0.00')
const buttonString = computed(() =>
  connected.value ? shortenAddress(activeAccount.value) : 'Connect Wallet')

const getTokenBalance = async () => {
  await getPoolTokens()
  poolTokens.value = format(caplToUSD(1))
}

watch(connected, (conn) => {
  if (conn) {
    connectWeb3()
    interval = setInterval(getTokenBalance, 2000)
  } else {
    clearInterval(interval)
  }
})
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
  z-index: 2;
  width: 100%;
}
.navlink {
  color: #e0e1e4;
  font-size: 1.2em;
  font-family: "Kanit", sans-serif;
  font-family: "Orbitron", sans-serif;
  cursor: pointer;
  z-index: 10;
}
.navbar-area {
  background-color: #000 !important;
}
.acavo-nav .navbar .navbar-nav .nav-item a {
  color: #fff !important;
}
.nav-item span {
  color: #fff !important;
}
/** MEDIA QUERIES */
@media screen and (min-width: 1000px) {
}
@media screen and (max-width: 962px) {
  .liquidity-box-main {
    /* width: 98% !important; */
    margin: 0 auto;
  }
  .stack-button-area {
    flex-wrap: wrap;
  }
  .stack-btn {
    flex: 0 0 100% !important;
  }
}
</style>
