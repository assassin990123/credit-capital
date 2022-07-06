<template>
  <div class="home stack-page treasury-fund-page">
    <div class="container">
      <div class="treasury-fund-heading">
        <h2>Treasury Fund</h2>
      </div>
      <!-- Fund Details -->
      <div class="treasury-fund-row">
        <div class="treasury-column">
          <div class="treasury-details-main">
            <div class="treasury-detials-inner">
              <div class="outstanding-value-main">
                <div class="outstanding-value">$0.00 <span>USD</span></div>
              </div>
              <div class="outstanding-value-details">
                <div><p>Outstanding Assets Value</p></div>
                <div><span>(USD)</span></div>
              </div>
            </div>
            <div class="treasury-detials-inner">
              <div class="outstanding-value-main">
                <div class="outstanding-value">$0.00 <span>USD</span></div>
              </div>
              <div class="outstanding-value-details">
                <div><p>Total Assets Under Management</p></div>
                <div><span>(USD VALUE)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Current Assets Details -->
      <div class="treasury-fund-row">
        <div class="treasury-column">
          <div class="current-assets-table-main">
            <div class="current-assets-table-inner">
              <div class="current-assets-head">
                <h2>Current Assets in Contract</h2>
              </div>
              <div class="current-assets-table-head">
                <table class="table table-borderless">
                  <thead>
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col">Contract</th>
                      <th scope="col">Tx</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div class="current-assets-table-body">
                <table class="table">
                  <tbody>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- current NFTs Contract Tab -->
      <div class="treasury-fund-row">
        <div class="current-nft-tab-main">
          <div class="current-nft-tab-head">
            <h2>Current NFTs in Contract</h2>
          </div>
          <div class="current-nft-tabs">
            <button type="button">Card</button>
            <button type="button">List</button>
            <button type="button">All</button>
          </div>
        </div>
      </div>
      <!-- Current Assets Details -->
      <div class="treasury-fund-row">
        <div class="treasury-column">
          <div class="current-assets-table-main">
            <div class="current-assets-table-inner">
              <div class="current-assets-head">
                <h2>Current Assets in Contract</h2>
              </div>
              <div class="current-assets-table-head">
                <table class="table table-borderless">
                  <thead>
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col">Contract</th>
                      <th scope="col">Tx</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div class="current-assets-table-body">
                <table class="table">
                  <tbody>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Token Name</td>
                      <td>Contract</td>
                      <td>Tx</td>
                      <td>Amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Revenue Projections Details -->
      <div class="treasury-fund-row">
        <div class="treasury-column">
          <div class="treasury-revenue-projection-main">
            <div class="treasury-projections-head">
              <h2>Current Revenue Projections</h2>
            </div>
            <div>
              <div class="treasury-projections-inner-card">
                <div class="treasury-projections-card">Daily</div>
                <div class="treasury-projections-card">Weekly</div>
                <div class="treasury-projections-card">Monthly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TreasuryFundPage",
};
</script>

<style scoped>
.treasury-fund-page {
  padding: 84px 0 50px 0;
}
.treasury-fund-page > .container {
  max-width: 80%;
}
.treasury-fund-heading {
  padding: 70px 0 20px 0;
}
.treasury-fund-heading h2 {
  text-align: center;
  text-transform: uppercase;
  color: #fff;
  font-size: 4rem;
}
.treasury-fund-page p {
  margin: 0 !important;
}
.treasury-column {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.treasury-projections-header {
  text-align: center;
}
.treasury-revenue-projection {
  width: 100%;
  margin: 0px;
  padding: 50px 30px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
}

/* Fund Details */
.treasury-details-main {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0px 0 50px 0;
  padding: 50px 50px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
}
.treasury-detials-inner {
  padding: 50px 30px;
  width: 49%;
  max-width: 49%;
  text-align: center;
  border: 1px solid #ff9c0f;
  border-radius: 20px;
}
.outstanding-value {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 28px;
}
.outstanding-value span {
  font-weight: 700;
  font-size: 46px;
}
.outstanding-value-details {
  color: #000;
  font-size: 28px;
  font-weight: 700;
}
.outstanding-value-details span {
  font-size: 46px;
}

/* Current Assets Details */
.current-assets-head h2 {
  text-align: center;
  margin: 0;
  color: #000;
  padding: 0 0 10px 0;
}
.current-assets-table-main {
  width: 100%;
  padding: 50px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  margin: 0 0 50px 0;
}
.current-assets-table-head {
  padding: 0 20px;
}
.current-assets-table-head table {
  margin: 0;
}
.current-assets-table-body {
  border: 2px solid #ff8900;
  border-radius: 20px;
  padding: 20px;
}
.current-assets-table-main .table > :not(:last-child) > :last-child > * {
  border: none;
}

/* nft tabs */
.current-nft-tab-main {
  margin: 0 0 50px 0;
}
.current-nft-tab-head h2 {
  text-align: center;
  margin: 0;
  color: #000;
  padding: 0 0 30px 0;
}
.current-nft-tabs {
  display: flex;
  justify-content: center;
}
.current-nft-tabs button {
  background: transparent;
  border: 2px solid #ff8900;
  border-radius: 25px;
  width: 150px;
  text-transform: uppercase;
  font-size: 22px;
  font-weight: 700;
  margin: 0 15px;
  transition: 0.3s all ease;
}
.current-nft-tabs button:hover,
.current-nft-tabs button:active,
.current-nft-tabs button:focus {
  background: #ff8900;
  color: #fff;
}

/* treasury projection  */
.treasury-revenue-projection-main {
  width: 100%;
  padding: 50px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  margin: 0 0 50px 0;
}
.treasury-projections-head h2 {
  text-align: center;
  margin: 0;
  color: #000;
  padding: 0 0 30px 0;
}
.treasury-projections-inner-card {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
}
.treasury-projections-card {
  border-radius: 25px;
  border: none;
  height: 220px;
  width: 30%;
  background: #4d4d4d;
  color: #fff;
  font-weight: 700;
  font-size: 26px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
}
</style>
