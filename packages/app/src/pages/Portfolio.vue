<template>
  <div class="dashboard-container dashboard-cus-main portfolio-main-sec">
    <div class="protfolio-title-main">
      <h2 class="text-center">PORTFOLIO</h2>
    </div>
    <div class="dashboard-portfolio">
      <div class="dashboard-portfolio-section">
        <div class="dashboard-portfolio-section-address">
          <h2>WALLET ADDRESS</h2>
          <div class="dashboard-portfolio-section-address-value">
            0x00000000000000000000
          </div>
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
        <button type="submit" class="reward-btn">Claim Rewards</button>
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
  </div>
</template>

<style>
.portfolio-main-sec .dashboard-portfolio-section-address {
  display: block;
}
.portfolio-main-sec .dashboard-portfolio-section-panel {
  box-shadow: none;
  border: 2px solid #2c2c2c;
}
.portfolio-main-sec .dashboard-portfolio-capl-row {
  box-shadow: none;
  border: 2px solid #ff8900;
}
.portfolio-main-sec .dashboard-portfolio-capl-panel {
  box-shadow: none;
  border: 2px solid #2c2c2c;
}
</style>
