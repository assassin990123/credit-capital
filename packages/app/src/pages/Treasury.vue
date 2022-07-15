<template>
  <div class="home stack-page treasury-page">
    <div class="container">
      <div class="treasury-heading">
        <h2>Treasury</h2>
      </div>
      <section class="treasury-sec">
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
      </section>
      <section class="treasury-current-assets-section">
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
      </section>
      <CurrentNFTsTab />
      <section class="revenue-projection">
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
      </section>
      <section class="action-tab">
        <div class="treasury-actions-main">
          <div class="treasury-actions-inner">
            <div class="treasury-actions-head">
              <h2>Actions</h2>
            </div>
            <div class="treasury-actions-tab">
              <button type="button">Withdraw</button>
              <button type="button">Deposit</button>
              <button type="button">Revenue</button>
            </div>
            <div class="treasury-actions-tab-details-main">
              <div class="actions-inner">
                <label for="select-withdraw-token">Token</label>
                <select id="select-withdraw-token">
                  <option value="" selected></option>
                  <option value="withdraw-option">Withdraw-option</option>
                </select>
              </div>
              <div class="actions-inner">
                <label for="withdraw-amount">Amount</label>
                <input type="number" value="00" id="withdraw-amount" />
              </div>
              <div class="actions-inner">
                <label for="wallet-address">Wallet Address</label>
                <input type="text" id="wallet-address" />
              </div>
              <div class="actions-inner">
                <label for="confirm-button">Confirm</label>
                <button type="button" id="confirm-button">Process</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CurrentNFTsTab from "@/components/CurrentNFTsTab/CurrentNFTsTab.vue";

// import Tab from "@/components/Tab.vue";
// import { ref } from "vue";

// const selected = ref("WITHDRAW");
// const onChangeTab = (v) => (selected.value = v);
</script>

<style>
.treasury-page {
  padding: 84px 0 50px 0;
}
.treasury-page > .container {
  max-width: 80%;
  margin: 0 auto;
}
.treasury-heading {
  padding: 70px 0 20px 0;
}
.treasury-heading h2 {
  text-align: center;
  text-transform: uppercase;
  color: #fff;
  font-size: 4rem;
}

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
  margin: 50px 0 50px 0;
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

.treasury-actions-inner {
  width: 100%;
  padding: 50px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  margin: 0 0 0 0;
}
.treasury-actions-head h2 {
  text-align: center;
  margin: 0;
  color: #000;
  padding: 0 0 30px 0;
}
.treasury-actions-tab {
  display: flex;
  justify-content: center;
}
.treasury-actions-tab button {
  background: transparent;
  border: 2px solid #ff8900;
  border-radius: 25px;
  width: 160px;
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 700;
  margin: 0 15px;
  transition: 0.3s all ease;
}
.treasury-actions-tab button:hover,
.treasury-actions-tab button:active,
.treasury-actions-tab button:focus {
  background: gray;
  color: #fff;
  border: 2px solid gray;
}

.treasury-actions-tab-details-main {
  display: flex;
  justify-content: space-between;
  margin: 70px 0 0 0;
  flex-wrap: wrap;
}
.actions-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 25%;
}
.actions-inner label {
  color: #4d4d4d;
}
.actions-inner #select-withdraw-token {
  width: 80%;
  background: #4d4d4d;
  color: white;
  border-radius: 7px;
  padding: 10px;
}
.actions-inner input {
  border: 2px solid #ff8900;
  padding: 5px;
  border-radius: 7px;
  width: 80%;
}
.actions-inner #withdraw-amount {
  text-align: right;
  font-size: 24px;
  line-height: 0;
}
.actions-inner #wallet-address {
  font-size: 24px;
  line-height: 0;
}
.actions-inner #confirm-button {
  width: 80%;
  background: #ff8900;
  border: 2px solid #ff8900;
  padding: 21px 0;
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 7px;
  color: #fff;
  font-size: 24px;
  line-height: 0;
}
</style>
