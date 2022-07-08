<template>
  <div class="nft-slide-main">
    <div class="nft-slide-inner">
      <div class="thumbnail-main">
        <img src="@/assets/boat.jpeg" alt="" />
      </div>
      <div class="nft-details">
        <div class="nft-name-type">
          <p class="nft-type">NFT Type</p>
          <p class="nft-name">NFT NAME</p>
        </div>
        <div class="nft-item-reward">
          <div class="nft-item">
            <p class="nft-item-quantity">1</p>
            <p class="nft-item-inner">Items</p>
          </div>
          <div class="nft-value">
            <p class="nft-value-main">$ <span>0.00</span></p>
            <p class="nft-value-inner">Value <br /><span>(USD)</span></p>
          </div>
          <div class="nft-rewards">
            <p class="nft-reward-main">X</p>
            <p class="nft-reward-inner">
              Rewards <br />
              Value
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CurrentNFTsSlide",
};
</script>
<style>
/* NFTs Slide CSS */
.nft-slide-main {
  width: 100%;
  padding: 50px;
  border-radius: 20px;
  box-shadow: 0px 0px 22px 0px rgb(0 0 0 / 17%);
  background-color: #fff;
  color: #000;
}
.thumbnail-main img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
.nft-slide-inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.nft-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.nft-item-reward {
  display: flex;
}
.nft-type {
  color: gray;
  font-size: 20px;
  margin: 0 0 10px 0;
  text-align: left;
}
.nft-name {
  color: #000;
  font-size: 26px;
  margin: 0 0 10px 0;
  text-align: left;
  font-weight: 700;
}
.nft-value {
  margin: 0 40px 0 40px;
}
.nft-item-quantity {
  font-weight: 700;
  font-size: 26px;
  margin: 0 0 15px 0;
}
.nft-item-inner {
  font-size: 20px;
  color: gray;
}
.nft-value-main {
  font-weight: 700;
  font-size: 22px;
  margin: 0 0 15px 0;
}
.nft-value-inner {
  font-size: 20px;
  color: gray;
}
.nft-reward-main {
  font-weight: 700;
  font-size: 22px;
  margin: 0 0 15px 0;
}
.nft-reward-inner {
  font-size: 20px;
  color: gray;
}
</style>
