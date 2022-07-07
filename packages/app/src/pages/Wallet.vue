<template>
  <div class="home stack-page wallet-page">
    <div class="container">
      <div class="wallet-heading">
        <h2>Wallet</h2>
      </div>
      <div class="connect-wallet">
        <button type="button" class="connect-wallet-button">
          Connect Your Wallet
          <div class="button-svg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path
                d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"
              />
            </svg>
          </div>
        </button>
      </div>
      <!-- Wallet Assets Details -->
      <div class="wallet-row">
        <div class="wallet-column">
          <div class="wallet-vault-table-main wallet-main">
            <div class="wallet-vault-table-inner">
              <div class="wallet-vault-head">
                <h2>Wallet Assets</h2>
              </div>
              <div class="wallet-vault-table-head">
                <table class="table table-borderless">
                  <thead>
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Value <span>(USD)</span></th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div class="wallet-vault-table-body">
                <table class="table">
                  <tbody>
                    <tr>
                      <td>CAPL Tokens</td>
                      <td>Amount</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>USDC Tokens</td>
                      <td>Amount</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>USDC-CAPL Shares</td>
                      <td>Amount</td>
                      <td>Amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Vault Assets Details -->
      <div class="wallet-row">
        <div class="wallet-column">
          <div class="wallet-vault-table-main vault-main">
            <div class="wallet-vault-table-inner">
              <div class="wallet-vault-head">
                <h2>Vault Assets</h2>
              </div>
              <div class="wallet-vault-table-head">
                <table class="table table-borderless">
                  <thead>
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Value <span>(USD)</span></th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div class="wallet-vault-table-body">
                <table class="table">
                  <tbody>
                    <tr>
                      <td>USDC-CAPL Shares</td>
                      <td>Amount</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Pending Rewards</td>
                      <td>Amount</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td>Next Asset</td>
                      <td>Amount</td>
                      <td>Amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Current NFTs Tab Details -->
      <CurrentNFTsTab />
    </div>
  </div>
</template>

<script>
import CurrentNFTsTab from "@/components/CurrentNFTsTab/CurrentNFTsTab.vue";
export default {
  name: "Wallet",
  components: {
    CurrentNFTsTab,
  },
};
</script>

<style scoped>
.wallet-page {
  padding: 84px 0 50px 0;
}
.wallet-page > .container {
  max-width: 80%;
}
.wallet-heading {
  padding: 70px 0 20px 0;
}
.wallet-heading h2 {
  text-align: center;
  text-transform: uppercase;
  color: #fff;
  font-size: 4rem;
}
.wallet-page p {
  margin: 0 !important;
}
.wallet-column {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.connect-wallet {
  text-align: center;
  display: flex;
  justify-content: center;
}
.connect-wallet .connect-wallet-button {
  background: transparent;
  border: 1px solid #ec9e1b;
  padding: 10px 20px;
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  border-radius: 10px;
  margin: 0 0 50px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-svg {
  margin: 0 0 0 15px;
}
.button-svg {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.connect-wallet .connect-wallet-button svg {
  fill: #ffa000;
  width: 17px;
}
/* Wallet and Vault Assets Details */
.wallet-vault-head h2 {
  text-align: center;
  margin: 0;
  color: #000;
  padding: 0 0 10px 0;
}
.wallet-vault-table-main {
  width: 100%;
  padding: 50px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  margin: 0 0 50px 0;
}
.wallet-vault-table-head {
  padding: 0 20px;
}
.wallet-vault-table-head table {
  margin: 0;
}
.wallet-vault-table-body {
  border: 2px solid #ff8900;
  border-radius: 20px;
  padding: 20px;
}
.wallet-vault-table-main .table > :not(:last-child) > :last-child > * {
  border: none;
}
.wallet-vault-table-head th:first-child {
  width: 70%;
}
.wallet-vault-table-body td:first-child {
  width: 70%;
}
</style>
