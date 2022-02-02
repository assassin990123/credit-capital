<template>
  <div class="home">
    <div class="swap-container">
      <div class="treasury-row inner-container">
        <div class="treasury-column-1">
          <div class="treasury-value-container">
            <div class="treasury-value-header">
              <div>OUTSTANDING ASSETS VALUE</div>
              <div>(USD)</div>
            </div>
            <div class="treasury-value">$0.00</div>
          </div>
          <div class="treasury-value-container">
            <div class="treasury-value-header">
              <div>TOTAL ASSETS UNDER MANAGEMENT</div>
              <div>(USD VALUE)</div>
            </div>
            <div class="treasury-value">$0.00</div>
          </div>
        </div>
        <div class="treasury-column-2">
          <div class="treasury-current-assets">
            <div class="treasury-current-assets-header">CURRENT ASSETS IN CONTRACT</div>
            <div class="treasury-current-assets-row">
              <div class="treasury-current-assets-token">TOKEN ----------------------</div>
              <div class="treasury-current-assets-amount">AMOUNT</div>
            </div>
            <div class="treasury-current-assets-row">
              <div class="treasury-current-assets-token">TOKEN ----------------------</div>
              <div class="treasury-current-assets-amount">AMOUNT</div>
            </div>
            <div class="treasury-current-assets-row">
              <div class="treasury-current-assets-token">TOKEN ----------------------</div>
              <div class="treasury-current-assets-amount">AMOUNT</div>
            </div>
            <div class="treasury-current-assets-row">
              <div class="treasury-current-assets-token">TOKEN ----------------------</div>
              <div class="treasury-current-assets-amount">AMOUNT</div>
            </div>
            <div class="treasury-current-assets-row">
              <div class="treasury-current-assets-token">TOKEN ----------------------</div>
              <div class="treasury-current-assets-amount">AMOUNT</div>
            </div>
          </div>
        </div>
      </div>
      <div class="treasury-row">
        <div class="treasury-column-1 treasury-projections">
          <div class="treasury-projections-header">CURRENT REVENUE PROJECTIONS</div>
          <div class="treasury-projections-row">
            <div class="treasury-projections-column">DAILY</div>
            <div class="treasury-projections-column">WEEKLY</div>
            <div class="treasury-projections-column">MONTHLY</div>
          </div>
        </div>
        <div class="treasury-column-2">
          <Tab
            :sections="['WITHDRAW', 'DEPOSIT', 'REVENUE']"
            :value="selected"
            :onChange="onChangeTab"
          />
          <div class="tab-content">
            <div class="tab-inner-content">
              <select class="tab-inner-content-item">
                <option value="TOKEN">TOKEN</option>
              </select>
              <div class="tab-inner-content-item">
                <div>AMOUNT</div>
                <input type="text" />
              </div>
              <div class="tab-inner-content-item">
                <div>ADDRESS</div>
                <input type="text" />
              </div>
              <button class="tab-inner-content-item">ENTER</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Tab from "@/components/Tab.vue";
import { ref } from "vue";

const selected = ref('WITHDRAW');
const onChangeTab = (v) => selected.value = v;

</script>

<style>
.treasury-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 10%;
  margin-right: 10%;
}

.treasury-column-1 {
  width: 57%;
  margin-right: 3%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.treasury-value-container {
  border: 1px solid #000000;
  height: 35vh;
  width: 45%;
  text-align: center;
}

.treasury-value-header {
  margin-top: 30px;
  height: 100px;
  font-size: 20px;
  text-align: center;
}

.treasury-value {
  font-size: 80px;
  font-weight: 700;
}

.treasury-column-2 {
  width: 40%;
}

.treasury-current-assets {
  border: 1px solid #000000;
  height: 35vh;
  width: 100%;
  padding: 0 20px;
}

.treasury-current-assets-header {
  margin-top: 30px;
  margin-bottom: 50px;
  font-size: 20px;
  text-align: center;
}

.treasury-current-assets-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
}

.treasury-current-assets-token {
  font-size: 22px;
  font-weight: 700;
}

.treasury-current-assets-amount {
  
}

.treasury-projections {
  border: 1px solid #000000;
  margin-bottom: 50px;
  height: 35vh;
  flex-direction: column;
  justify-content: space-around;
  text-align: center;
}

.treasury-projections-header {
  font-size: 20px;
  margin-bottom: 50px;
}

.treasury-projections-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
}

.treasury-projections-column {
  border: 1px solid #000000;
  height: 120px;
  line-height: 120px;
  width: 30%;
}

.tab-content {
  height: calc(35vh - 40px);
  border: 1px solid #000000;
  margin-top: -1px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tab-inner-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin: 0 20px;
}

.tab-inner-content-item input {
  width: 100px;
}

button.tab-inner-content-item, select.tab-inner-content-item {
  margin-top: 20px;
}
</style>
