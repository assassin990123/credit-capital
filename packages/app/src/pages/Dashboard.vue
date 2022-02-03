<template>
  <div class="dashboard-container inner-container">
    <div class="dashboard-daily-earning">
      <div class="dashboard-daily-earning-panel">
        <div>
          <h2>DAILY EARNINGS</h2>
          <div class="dashboard-daily-earning-panel-value">0</div>
        </div>
        <div>
          <h2>APR</h2>
          <div class="dashboard-daily-earning-panel-value">0.0000%</div>
        </div>
        <div>
          <h2>TVL</h2>
          <div class="dashboard-daily-earning-panel-value">0.0000 USD</div>
        </div>
      </div>
      <div class="dashboard-daily-earning-capl">
        <div class="dashboard-daily-earning-capl-header">
          <h2>CAPL</h2>
          <h2>1.0357 USD</h2>
        </div>
        <div class="dashboard-daily-earning-capl-content">
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">Your Balance</div>
            <div class="dashboard-daily-earning-capl-content-value">0.0000 CAPL (0.0000 USD)</div>
          </div>
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">Your Staked Balance</div>
            <div class="dashboard-daily-earning-capl-content-value">0.0000 USDC-CAPL Shares (0.0000 USD)</div>
          </div>
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">Daily Revenue</div>
            <div class="dashboard-daily-earning-capl-content-value">0 CAPL (0.0000 USD)</div>
          </div>
          <div class="dashboard-daily-earning-capl-content-row">
            <div class="dashboard-daily-earning-capl-content-title">Daily Yield</div>
            <div class="dashboard-daily-earning-capl-content-value">∞%</div>
          </div>
        </div>
      </div>
    </div>
    <div class="dashboard-revenue-projection">
      <div class="dashboard-revenue-projection-vault">
        <h2>VAULT</h2>
        <div>
          <div>Your Stakes USDC-CAPL Shares</div>
          <div class="dashboard-revenue-projection-value">0.0000 LP Shares (0.0000) USD</div>
        </div>
        <div>
          <div>Your Daily Revenue</div>
          <div class="dashboard-revenue-projection-value">0</div>
          <div>0</div>
        </div>
      </div>
      <div class="dashboard-revenue-projection-content">
        <h2>REVENUE PROJECTIONS</h2>
        <div class="dashboard-revenue-projection-content-row">
          <div class="dashboard-revenue-projection-content-column">
            <div>Your Weekly Revenue</div>
            <div class="dashboard-revenue-projection-value">0</div>
            <div>0</div>
          </div>
          <div class="dashboard-revenue-projection-content-column">
            <div>Your Monthly Revenue</div>
            <div class="dashboard-revenue-projection-value">0</div>
            <div>0</div>
          </div>
          <div class="dashboard-revenue-projection-content-column">
            <div>Your Annual Revenue</div>
            <div class="dashboard-revenue-projection-value">0</div>
            <div>0</div>
          </div>
        </div>
      </div>
    </div>
    <h2 class="text-center">PORTFOLIO</h2>
    <div class="dashboard-portfolio">
      <div class="dashboard-portfolio-section">
        <div class="dashboard-portfolio-section-address">
          <h2>WALLET ADDRESS</h2>
          <div class="dashboard-portfolio-section-address-value">0x00000000000000000000</div>
        </div>
        <div class="dashboard-portfolio-section-title">Wallet Assets</div>
        <div class="dashboard-portfolio-section-panel">
          <div class="dashboard-portfolio-section-panel-row">
            <div>USDC-CAPL Shares</div>
            <div>0 (0.0000 USD)</div>
          </div>
          <div class="dashboard-portfolio-section-panel-row">
            <div>CAPL Tokens</div>
            <div>0.0000 (0.0000 USD)</div>
          </div>
          <div class="dashboard-portfolio-section-panel-row">
            <div>USDC Tokens</div>
            <div>0.0000 (0.0000 USD)</div>
          </div>
        </div>
        <div class="dashboard-portfolio-section-title">Vault Assets</div>
        <div class="dashboard-portfolio-section-panel">
          <div class="dashboard-portfolio-section-panel-row">
            <div>USDC-CAPL Shares</div>
            <div>0 (0.0000 USD)</div>
          </div>
          <div class="dashboard-portfolio-section-panel-row">
            <div>Pending Rewards</div>
            <div>0.0000 CAPL (0.0000 USD)</div>
          </div>
        </div>
        <button>Claim Rewards</button>
      </div>
      <div class="dashboard-portfolio-section">
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
    <h2 class="text-center">PLATFORM</h2>
    <div class="dashboard-platform">
      <div class="dashboard-platform-section">
        <div class="dashboard-platform-header">
          <h2>CAPL</h2>
          <div>
            <div>$1.0357 USD</div>
            <div>Current Price</div>
          </div>
          <button>Buy</button>
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
            <div>USDC-CAPL Total Liquidity</div>
            <div>0.0000 LP (0.0000 USD)</div>
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

<script lang="ts" setup></script>

<style>
.dashboard-container {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 70%;
  margin-left: 15%;
  margin-right: 15%;
}

.dashboard-daily-earning {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 35vh;
}

.dashboard-daily-earning-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border: 1px solid #000000;
  margin-right: 20px;
  width: 35%;
  text-align: center;
  font-size: 14px;
}

.dashboard-daily-earning-capl {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dashboard-daily-earning-capl-header {
  border: 1px solid #000000;
  margin-bottom: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
}

.dashboard-daily-earning-capl-content {
  flex: 1;
  border: 1px solid #000000;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.dashboard-daily-earning-capl-content-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid #000000;
  margin-top: 10px;
  padding-bottom: 8px;
}

.dashboard-revenue-projection {
  display: flex;
  flex-direction: row;
  border: 1px solid #000000;
  padding: 10px 20px;
  margin-top: 40px;
  height: 30vh;
}

.dashboard-revenue-projection-vault {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border: 1px solid #000000;
  width: 25%;
  margin-right: 40px;
  text-align: center;
  padding: 10px 15px;
}

.dashboard-revenue-projection-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  text-align: center;
}

.dashboard-revenue-projection-content-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-revenue-projection-content-column {
  border: 1px solid #000000;
  padding: 10px 0;
}

.dashboard-revenue-projection-value {
  font-size: 20px;
  font-weight: 700;
}

.dashboard-portfolio {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
}

.dashboard-portfolio-section {
  width: 45%;
  border: 1px solid #000000;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
}

.text-center {
  text-align: center;
}

.dashboard-portfolio-section-address {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-portfolio-section-address h2 {
  margin: 10px 0;
}

.dashboard-portfolio-section-address-value {
  border: 1px solid #000000;
  padding: 0 10px;
  line-height: 44px;
}

.dashboard-portfolio-section-title {
  font-size: 20px;
  margin: 20px 0;
}

.dashboard-portfolio-section-panel {
  border: 1px solid #000000;
  padding: 10px;
}

.dashboard-portfolio-section-panel-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 5px;
}

.dashboard-portfolio-section button {
	margin-top: 20px;
}

.dashboard-portfolio-capl-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-portfolio-capl-panel {
  border: 1px solid #000000;
  padding: 10px 10px 30px 10px;
  margin-top: 20px;
}

.dashboard-portfolio-capl-panel-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #000000;
  margin-top: 10px;
}

.dashboard-platform {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 50px;
}

.dashboard-platform-section {
  width: 45%;
  border: 1px solid #000000;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
}

.dashboard-platform-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-platform-header h2 {
  margin: 0;
}

.dashboard-platform-token {
  border: 1px solid #000000;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-platform-token-column {
  width: 50%;
  padding: 10px;
}

.dashboard-platform-token-column h2 {
  margin: 0;
}

.dashboard-platform-token-market {
}

.dashboard-platform-token-market-row {
  margin-bottom: 5px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid #000000;
  font-size: 14px;
}

.dashboard-platform-assets {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dashboard-platform-assets-panel {
  padding: 10px;
  border: 1px solid #000000;
}

.dashboard-platform-assets-panel-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.dashboard-platform-assets-panel-row-border {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid #000000;
  margin-bottom: 10px;
  padding-bottom: 5px;
}
</style>
