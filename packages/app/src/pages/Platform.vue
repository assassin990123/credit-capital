<template>
  <div class="dashboard-container dashboard-cus-main platform-main-sec">
    <div class="protfolio-title-main">
      <h2 class="text-center">PLATFORM</h2>
    </div>
    <div class="dashboard-platform">
      <div class="dashboard-platform-section">
        <div class="dashboard-platform-header">
          <div class="platform-left-main">
            <h2>CAPL</h2>
            <div>$1.0357 USD</div>
            <div>Current Price</div>
          </div>
          <button class="buy-btn">Buy</button>
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

<style>
.platform-main-sec .dashboard-platform-header {
  align-items: center;
}
.platform-main-sec .buy-btn {
  height: 55px;
}
.platform-main-sec .dashboard-platform-token {
  box-shadow: none;
  border: 2px solid #2c2c2c;
}
.platform-main-sec .dashboard-platform-assets {
  box-shadow: none;
  border: 2px solid #2c2c2c;
}
.platform-main-sec .dashboard-platform-assets-panel {
  box-shadow: none;
  border: 2px solid #2c2c2c;
}
</style>
