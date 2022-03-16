<template>
  <div class="dashboard-container dashboard-cus-main">
    <div class="dashboard-daily-earning">
      <div class="dashboard-daily-earning-panel">
        <div class="title-cus">
          <h2>DAILY EARNINGS</h2>
          <div class="dashboard-daily-earning-panel-value">
            {{ format(dailyEarnings) }} CAPL<br />
            ({{ format(caplToUSD(dailyEarnings)) }} USD)
          </div>
        </div>
        <div class="title-cus">
          <h2>APR</h2>
          <div v-if="dailyEarnings " class="dashboard-daily-earning-panel-value">
            {{ format((caplToUSD(dailyEarnings) / tvl) * 36500) }}%
          </div>
        </div>
        <div class="title-cus">
          <h2>TVL</h2>
          <div v-if="userStakedPosition" class="dashboard-daily-earning-panel-value">
            {{ format(lpToUSD(userStakedPosition)) }} USD
          </div>
        </div>
      </div>
      <div class="dashboard-daily-earning-capl">
        <div class="dashboard-daily-earning-capl-header">
          <h2>CAPL</h2>
          <h2>
            {{ format(caplBalance) }} ({{
              format(caplToUSD(caplBalance))
            }}
            USD)
          </h2>
        </div>
        <div class="dashboard-daily-earning-capl-content">
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">
              Your Balance
            </div>
            <div class="dashboard-daily-earning-capl-content-value">
              {{ format(caplBalance) }} CAPL ({{
                format(caplToUSD(caplBalance))
              }}
              USD)
            </div>
          </div>
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">
              Available Balance
            </div>
            <div class="dashboard-daily-earning-capl-content-value">
              {{ format(lpBalance) }} USDC-CAPL Shares ({{
                format(lpToUSD(lpBalance))
              }}
              USD)
              <br />
              <div class="stake-link">
                <ul class="nav-btn-custom">
                  <li class="nav-item">
                    <router-link to="stake"
                      ><button class="connectButton">Stake</button>
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
            <br />
          </div>
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">
              Daily Revenue
            </div>
            <div class="dashboard-daily-earning-capl-content-value">
              {{ format(dailyEarnings) }} CAPL ({{
                format(caplToUSD(dailyEarnings))
              }}
              USD)
            </div>
          </div>
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">
              Daily Yield
            </div>
            <div v-if="dailyEarnings" class="dashboard-daily-earning-capl-content-value">
              {{ format((caplToUSD(dailyEarnings) / tvl) * 100) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="dashboard-revenue-projection">
      <div class="dashboard-revenue-projection-vault">
        <h2>VAULT</h2>
        <div>
          <div class="dashboard-revenue-projection-value">
            {{ format(userStakedPosition) }} USDC-CAPL<br />
          </div>
          <div class="green-txt">
            {{ format(lpToUSD(userStakedPosition)) }} USD
          </div>
        </div>
        <div class="revenue-block-main">
          <div>Your Daily Revenue</div>
          <div class="dashboard-revenue-projection-value">
            {{ format(dailyEarnings) }} CAPL
          </div>
          <div class="green-txt">
            {{ format(caplToUSD(dailyEarnings)) }} USD
          </div>
        </div>
      </div>
      <div class="dashboard-revenue-projection-content">
        <h2 class="orange-txt">REVENUE PROJECTIONS</h2>
        <div class="dashboard-revenue-projection-content-row">
          <div class="dashboard-revenue-projection-content-column">
            <div>Your Weekly Revenue</div>
            <div class="dashboard-revenue-projection-value">
              {{ format(dailyEarnings * 7) }} CAPL
            </div>
            <div class="green-txt">
              ({{ format(caplToUSD(dailyEarnings) * 9) }} USD)
            </div>
          </div>
          <div class="dashboard-revenue-projection-content-column">
            <div>Your Monthly Revenue</div>
            <div class="dashboard-revenue-projection-value">
              {{ format(dailyEarnings * 30) }} CAPL
            </div>
            <div class="green-txt">
              ({{ format(caplToUSD(dailyEarnings) * 30) }} USD)
            </div>
          </div>
          <div class="dashboard-revenue-projection-content-column">
            <div>Your Annual Revenue</div>
            <div class="dashboard-revenue-projection-value">
              {{ format(dailyEarnings * 356) }}
              CAPL
            </div>
            <div class="green-txt">
              ({{ format(caplToUSD(dailyEarnings) * 356) }} USD)
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="protfolio-title-main">
      <h2 class="text-center">PORTFOLIO</h2>
    </div>
    <div class="dashboard-portfolio">
      <div class="dashboard-portfolio-section">
        <div class="dashboard-portfolio-section-address">
          <h2>WALLET ADDRESS</h2>
          <div
            class="dashboard-portfolio-section-address-value"
            v-bind:title="activeAccount"
          >
            {{ walletAddress }}
          </div>
        </div>
        <div class="dashboard-portfolio-section-title">Wallet Assets</div>
        <div class="dashboard-portfolio-section-panel">
          <div class="dashboard-portfolio-section-panel-row">
            <div>CAPL Tokens</div>
            <div>
              {{ format(caplBalance) }} CAPL ({{
                format(caplToUSD(caplBalance))
              }}
              USD)
            </div>
          </div>
          <div class="dashboard-portfolio-section-panel-row">
            <div>USDC Tokens</div>
            <div>{{ format(usdcBalance) }} USDC</div>
          </div>
          <div class="dashboard-portfolio-section-panel-row">
            <div>USDC-CAPL Shares</div>
            <div>
              {{ format(lpBalance) }} USDC-CAPL Shares ({{
                format(lpToUSD(lpBalance))
              }}
              USD)
              <div class="stake-link">
                <ul class="nav-btn-custom">
                  <li class="nav-item">
                    <router-link to="stake"
                      ><button class="connectButton">Stake</button>
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="dashboard-portfolio-section-title">Vault Assets</div>
        <div class="dashboard-portfolio-section-panel">
          <div class="dashboard-portfolio-section-panel-row">
            <div>USDC-CAPL Shares</div>
            <div>
              {{ format(userStakedPosition) }} USDC-CAPL Shares ({{
                format(lpToUSD(userStakedPosition))
              }}
              USD)
            </div>
          </div>
          <div class="dashboard-portfolio-section-panel-row">
            <div>Pending Rewards</div>
            <div>
              {{ format(pendingRewards) }} CAPL ({{
                format(caplToUSD(pendingRewards))
              }}
              USD)
            </div>
          </div>
        </div>
        <router-link to="reward" class="reward-link">
          <button type="submit" class="reward-btn">Claim Rewards</button>
        </router-link>
      </div>
      <div class="dashboard-portfolio-section" style="display: none">
        <!--todo: Implement historic data-->
        <div class="dashboard-portfolio-capl-row">
          <div>CAPL Price</div>
          <div>1.0357 USD</div>
          <div>+0.00 (USD)</div>
          <div>+0.00%</div>
        </div>
        <div class="dashboard-portfolio-capl-panel">
          <div class="dashboard-portfolio-capl-panel-row">
            <div>Rewards</div>
            <div>+0.00%</div>
            <div>+0.00%</div>
            <div>0.0000</div>
          </div>
          <div class="dashboard-portfolio-capl-panel-row">
            <div>CAPL Changes</div>
            <div>+0.00%</div>
            <div>+0.00%</div>
            <div>$0.0000 CAPL</div>
          </div>
          <div class="dashboard-portfolio-capl-panel-row">
            <div>Total profit/Loss</div>
            <div>+0.00%</div>
            <div>$0.0000 USD</div>
          </div>
          <div class="dashboard-portfolio-capl-panel-row">
            <div>Total APR</div>
            <div>0.0000%</div>
          </div>
        </div>
      </div>
    </div>
    <div class="protfolio-title-main" style="display: none">
      <h2 class="text-center">PLATFORM</h2>
    </div>
    <div class="dashboard-platform" style="display: none">
      <div class="dashboard-platform-section">
        <div class="dashboard-platform-header">
          <h2>CAPL</h2>
          <div>
            <div>$1.0357 USD</div>
            <div>Current Price</div>
          </div>
          <button @click="$router.push('swap#')" class="buy-btn">Buy</button>
        </div>
        <div class="dashboard-portfolio-section-title">Tokenomics</div>
        <div class="dashboard-platform-token">
          <div class="dashboard-platform-token-column">
            <h3>CAPL</h3>
            <div>+0.00%</div>
          </div>
          <div class="dashboard-platform-token-column">
            <div class="dashboard-platform-token-market">
              <div class="dashboard-platform-token-market-row">
                <div>Market Cap</div>
                <div>0 CAPL</div>
              </div>
              <div class="dashboard-platform-token-market-row">
                <div>Total Supply</div>
                <div>0 CAPL</div>
              </div>
              <div class="dashboard-platform-token-market-row">
                <div>Circulating Supply</div>
                <div>0 CAPL</div>
              </div>
              <div class="dashboard-platform-token-market-row">
                <div>Daily Rewards</div>
                <div>0 CAPL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard-platform-section">
        <div class="dashboard-platform-assets">
          <div>Platform Assets</div>
          <div>0.0000 USD</div>
          <div>+0.00%</div>
        </div>
        <div class="dashboard-platform-assets-panel">
          <div class="dashboard-platform-assets-panel-row">
            <div>USDC-CAPL Total&nbsp;Liquidity</div>
            <div>0.0000 LP (0.0000&nbsp;USD)</div>
          </div>
        </div>
        <div class="dashboard-portfolio-section-title">Treasury Assets</div>
        <div class="dashboard-platform-assets-panel">
          <div class="dashboard-platform-assets-panel-row-border">
            <div>USDC</div>
            <div>0.0000 USDC</div>
          </div>
          <div class="dashboard-platform-assets-panel-row-border">
            <div>CAPL</div>
            <div>0.0000 CAPL</div>
          </div>
          <div class="dashboard-platform-assets-panel-row-border">
            <div>USDC-CAPL Shares</div>
            <div>0 USDC-CAPL</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import {
  caplToUSD,
  lpToUSD,
  getDailyEarnings,
  shortenAddress,
  format,
} from "@/utils";
import { useAccounts } from "@/use/accounts";
import { useTokens } from "@/use/tokens";
import { useDashboard } from "@/use/dashboard";
import { useRewards } from "@/use/rewards";

const { connected, activeAccount} = useAccounts()
const { rewards } = useRewards()
const { tokens } = useTokens()
const { dashboard } = useDashboard()

const { tvl } = toRefs(dashboard)
const {
  pendingRewards,
  caplPerSecond,
  totalStaked,
  userStakedPosition
} = toRefs(rewards)

const caplBalance = computed(() => tokens.capl.balance)
const usdcBalance = computed(() => tokens.usdc.balance)
const lpBalance = computed(() => tokens.lp.balance)

const walletAddress = computed(
  () => connected.value ? shortenAddress(activeAccount.value) : 'Connect'
)
const dailyEarnings = computed(() => {
  if (userStakedPosition.value > 0 &&
    caplPerSecond.value > 0 &&
    totalStaked.value > 0
  ) {
    return getDailyEarnings(
      userStakedPosition.value,
      caplPerSecond.value,
      totalStaked.value
    )
  }
  return 0
})
</script>

<style>
.dashboard-container.dashboard-cus-main {
  padding: 100px;
  background-color: #fdf6e4;
}

.dashboard-cus-main .dashboard-daily-earning {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 40px 30px;
}

.dashboard-cus-main .dashboard-daily-earning-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin-right: 20px;
  padding: 40px 20px;
  width: 35%;
  text-align: center;
  background-color: #fff;
  border-radius: 50px;
  -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
}
.dashboard-cus-main .title-cus {
  margin: 0 0 25px 0;
  padding: 0 0 25px 0;
  border-bottom: 2px solid #e6e6e6;
}
.dashboard-cus-main .title-cus h2 {
  color: #2c2c2c;
  margin: 0 0 10px 0;
}
.dashboard-cus-main .dashboard-daily-earning-panel-value {
  font-size: 22px;
  font-weight: bold;
  color: #247109;
}
.dashboard-cus-main .title-cus:last-child {
  border: none;
}

.dashboard-daily-earning-capl {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dashboard-cus-main .dashboard-daily-earning-capl-header {
  margin-bottom: 35px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 30px;
  background-color: #fff;
  border-radius: 15px;
  -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
}
.dashboard-cus-main .dashboard-daily-earning-capl-header h2 {
  margin: 0px;
  color: #2c2c2c;
}
.dashboard-cus-main .dashboard-daily-earning-capl-content {
  flex: 1;
  padding: 15px 30px;
  background-color: #fff;
  border-radius: 15px;
  -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.dashboard-cus-main .dashboard-daily-earning-capl-content-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  border-bottom: 2px solid rgba(255, 137, 0, 0.6);
  margin-bottom: 20px;
  padding: 15px;
  color: #000000;
}

.dashboard-cus-main .dashboard-daily-earning-capl-content-row div {
  color: #2c2c2c;
}
.dashboard-cus-main .dashboard-revenue-projection {
  display: flex;
  flex-direction: row;
  padding: 40px 30px;
  background-color: #fff;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  border-radius: 60px;
  margin-top: 60px;
}

.dashboard-cus-main .dashboard-revenue-projection-vault {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 25%;
  margin-right: 40px;
  text-align: center;
  padding: 40px 20px;
  border-radius: 20px;
  border: 2px solid #ff8900;
}
.dashboard-cus-main .dashboard-revenue-projection-vault h2 {
  color: #2c2c2c;
  margin: 0 0 15px 0;
}
.dashboard-cus-main .dashboard-revenue-projection-vault div {
  color: #2c2c2c;
  font-size: 18px;
  font-weight: bold;
}
.dashboard-cus-main .revenue-block-main {
  margin: 80px 0 0 0;
}
.dashboard-cus-main .revenue-block-main .dashboard-revenue-projection-value {
  font-weight: bold;
  color: #2c2c2c;
}
.dashboard-cus-main .revenue-block-main .green-txt {
  color: #247109;
}

.dashboard-revenue-projection-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
.dashboard-cus-main .dashboard-revenue-projection-content h2.orange-txt {
  color: #ff8900;
  margin: 0 0 30px 0;
}

.dashboard-cus-main .dashboard-revenue-projection-content-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.dashboard-cus-main .dashboard-revenue-projection-content-column {
  padding: 25px 80px;
  background-color: #fff;
  border-radius: 15px;
  border: 2px solid #ff8900;
  margin: 0 25px;
}
.dashboard-cus-main .dashboard-revenue-projection-content-column > div {
  color: #2c2c2c;
  font-weight: bold;
}
.dashboard-cus-main .dashboard-revenue-projection-content-column .green-txt,
.dashboard-cus-main .dashboard-revenue-projection-vault .green-txt {
  color: #247109;
}
.dashboard-cus-main .protfolio-title-main {
  margin: 50px 0;
}
.dashboard-cus-main .protfolio-title-main h2 {
  color: #2c2c2c;
  margin: 0px;
}
.dashboard-cus-main .dashboard-portfolio-section {
  padding: 40px 30px;
  background-color: #fff;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  border-radius: 20px;
  border: none;
}
.dashboard-cus-main .dashboard-portfolio-section-address h2 {
  color: #2c2c2c;
  margin: 0px;
}
.dashboard-cus-main .dashboard-revenue-projection-value {
  font-size: 20px;
  font-weight: 700;
}
.dashboard-cus-main .reward-link {
  text-align: center;
}
.dashboard-cus-main .reward-link button {
  display: inline-block;
  padding: 15px;
  border-radius: 50px;
  border: none;
  background: rgba(255, 154, 2, 1);
  background: -moz-linear-gradient(
    left,
    rgba(255, 154, 2, 1) 0%,
    rgba(255, 197, 6, 1) 100%
  );
  background: --webkit-gradient(
    left top,
    right top,
    color-stop(0%, rgba(255, 154, 2, 1)),
    color-stop(100%, rgba(255, 197, 6, 1))
  );
  background: -webkit-linear-gradient(
    left,
    rgba(255, 154, 2, 1) 0%,
    rgba(255, 197, 6, 1) 100%
  );
  background: -o-linear-gradient(
    left,
    rgba(255, 154, 2, 1) 0%,
    rgba(255, 197, 6, 1) 100%
  );
  background: -ms-linear-gradient(
    left,
    rgba(255, 154, 2, 1) 0%,
    rgba(255, 197, 6, 1) 100%
  );
  background: linear-gradient(
    to right,
    rgba(255, 154, 2, 1) 0%,
    rgba(255, 197, 6, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff9a02', endColorstr='#ffc506', GradientType=1);
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  color: #fff;
  min-width: 250px;
  margin: 40px auto;
}

.dashboard-cus-main .dashboard-portfolio {
  /* display: flex; todo: uncomment to display other column */
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
}
.dashboard-portfolio-section {
  /* width: 45%; todo: uncomment to display other column */
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
}

.text-center {
  text-align: center;
}

.dashboard-cus-main .dashboard-portfolio-section-address {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.dashboard-cus-main .dashboard-portfolio-section-title {
  font-weight: 700;
  color: #ff8900;
}
.dashboard-cus-main .dashboard-portfolio-section-panel {
  padding: 40px 30px;
  background-color: #fff;
  box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 9%);
  border-radius: 20px;
  border: none;
}
.dashboard-cus-main .dashboard-portfolio-section-panel-row {
  padding: 15px;
  border-bottom: 2px solid rgba(255, 137, 0, 0.6);
  margin: 0 0 20px 0;
}
.dashboard-cus-main .dashboard-portfolio-section-panel-row div {
  color: #2c2c2c;
}

.dashboard-cus-main .dashboard-portfolio-section-address h2 {
  margin: 10px 0;
}

.dashboard-cus-main .dashboard-portfolio-section-address-value {
  padding: 15px;
  line-height: 44px;
  color: #000;
  font-weight: bold;
  border: 2px solid #ff8900;
  border-radius: 15px;
}

.dashboard-portfolio-section-title {
  font-size: 20px;
  margin: 20px 0;
}

.dashboard-portfolio-section-panel {
  border: 2px solid #000000;
  padding: 10px;
}

.dashboard-portfolio-section-panel-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 18px;
  margin-bottom: 5px;
}

.dashboard-portfolio-section button {
  margin-top: 20px;
}

.dashboard-cus-main .dashboard-portfolio-capl-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 30px;
  background: #fff;
  box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 9%);
  border-radius: 20px;
}
.dashboard-cus-main .dashboard-portfolio-capl-row div {
  font-size: 18px;
  font-weight: bold;
  color: #2c2c2c;
}

.dashboard-cus-main .dashboard-portfolio-capl-panel {
  padding: 40px 30px;
  background-color: #fff;
  box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 9%);
  border-radius: 20px;
  border: none;
  margin-top: 40px;
}

.dashboard-cus-main .dashboard-portfolio-capl-panel-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 2px solid rgba(255, 137, 0, 0.6);
  margin: 0 0 15px 0;
}
.dashboard-cus-main .dashboard-portfolio-capl-panel-row div {
  font-weight: bold;
  color: #2c2c2c;
}

.dashboard-cus-main .dashboard-platform {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 50px;
}

.dashboard-cus-main .dashboard-platform-section {
  width: 45%;
  padding: 40px 30px;
  background-color: #fff;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  border-radius: 20px;
  border: none;
  display: flex;
  flex-direction: column;
}

.dashboard-platform-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.dashboard-cus-main .dashboard-platform-header h2 {
  color: #2c2c2c;
}
.dashboard-cus-main .dashboard-platform-header div {
  color: #2c2c2c;
  font-size: 19px;
  font-weight: bold;
}
.dashboard-cus-main .buy-btn {
  display: block;
  padding: 10px 80px;
  border-radius: 50px;
  border: none;
  background: rgba(255, 154, 2, 1);
  background: --webkit-gradient(
    left top,
    right top,
    color-stop(0%, rgba(255, 154, 2, 1)),
    color-stop(100%, rgba(255, 197, 6, 1))
  );
  background: linear-gradient(
    to right,
    rgba(255, 154, 2, 1) 0%,
    rgba(255, 197, 6, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff9a02', endColorstr='#ffc506', GradientType=1);
  text-align: center;
  font-weight: bold;
  font-size: 22px;
  color: #fff;
  line-height: normal;
  height: 65px;
  min-height: auto;
  cursor: pointer;
}
.dashboard-platform-header h2 {
  margin: 0;
}

.dashboard-cus-main .dashboard-platform-token {
  padding: 40px 30px;
  background-color: #fff;
  box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 9%);
  border-radius: 20px;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-platform-token-column {
  width: 50%;
  padding: 10px;
}
.dashboard-cus-main .dashboard-platform-token-column h3 {
  color: #2c2c2c;
  font-weight: bold;
}
.dashboard-cus-main .dashboard-platform-token-market-row {
  padding: 15px;
  border-bottom: 2px solid rgba(255, 137, 0, 0.6);
  margin: 0px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 18px;
  color: #2c2c2c;
}

.dashboard-platform-assets {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
}
.dashboard-cus-main .dashboard-platform-assets {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 30px;
  background: #fff;
  box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 9%);
  border-radius: 20px;
}
.dashboard-cus-main .dashboard-platform-assets div {
  font-size: 18px;
  font-weight: bold;
  color: #2c2c2c;
}

.dashboard-cus-main .dashboard-platform-assets-panel {
  padding: 10px;
  padding: 30px;
  background: #fff;
  box-shadow: 0px 0px 20px 0px rgb(0 0 0 / 9%);
  border-radius: 20px;
  margin: 30px 0;
}
.dashboard-cus-main .dashboard-platform-assets-panel div {
  font-size: 18px;
  font-weight: bold;
  color: #2c2c2c;
}

.dashboard-platform-assets-panel-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-cus-main .dashboard-platform-assets-panel-row-border {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 2px solid rgba(255, 137, 0, 0.6);
  margin: 0 0 15px 0;
  padding: 15px;
}
.dashboard-cus-main .dashboard-platform-assets-panel-row-border div {
  font-weight: bold;
  color: #000;
  font-size: 18px;
}
.dashboard-cus-main {
  background-color: #fdf6e4;
  background-image: url(/images/hero/banner-4.png);
  background-repeat: no-repeat;
}
.dashboard-daily-earning-capl-content-title {
  font-size: 18px;
}
.stake-link {
  text-align: right;
  font-size: 20px;
}
.stake-link ul {
  display: inline;
}
</style>
