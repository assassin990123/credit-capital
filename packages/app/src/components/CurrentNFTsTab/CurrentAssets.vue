<template>
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
                  <th scope="col">NFT Asset</th>
                  <th scope="col">Contract</th>
                  <th scope="col">NFT ID</th>
                  <th scope="col">VALUE <span>(USD)</span></th>
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
</template>

<script>
export default {
  name: "CurrentAssets",
};
</script>

<style>
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
.current-assets-table-head th:first-child {
  width: 20%;
}
.current-assets-table-body td:first-child {
  width: 20%;
}
.current-assets-table-head th:nth-child(2) {
  width: 20%;
}
.current-assets-table-body td:nth-child(2) {
  width: 20%;
}
.current-assets-table-head th:nth-child(3) {
  width: 40%;
}
.current-assets-table-body td:nth-child(3) {
  width: 40%;
}
.current-assets-table-head th:nth-child(4) {
  text-align: right;
}
.current-assets-table-body td:nth-child(4) {
  text-align: right;
}
</style>
