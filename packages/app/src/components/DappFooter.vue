<template>
  <div class="panel-container">
    <div class="stack-bottom-area">
      <div class="stack-bottom-area-inner">
        <div class="stack-button-area">
          <a href="javascript:void(0)" class="stack-btn">
            {{ tvl }} USD<br />Total Value Locked
          </a>
          <a href="javascript:void(0)" class="stack-btn">
            {{ format(dailyEarnings) }} USD<br />Daily Revenue
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { format, getDailyEarnings } from "@/utils"
import { useAccounts } from "@/use/accounts"
import { useRewards } from "@/use/rewards"
import { useDashboard } from "@/use/dashboard"

const { connected } = useAccounts()
const { rewards } = useRewards()
const { dashboard } = useDashboard()

const tvl = computed(() => connected.value ? dashboard.tvl : 0)
const dailyEarnings = computed(() => getDailyEarnings(
  rewards.userStakedPosition,
  rewards.caplPerSecond,
  rewards.totalStaked
))
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital@1&family=Orbitron&display=swap");
</style>
