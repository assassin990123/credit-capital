import { store } from "@/store";
import { ethers } from "ethers";

export const nyxInfo = async (address: string) => {
  const provider = ethers.getDefaultProvider(42);

  /**  below are just sample functions for other contracts and their interaction with the store
   * 
   *   // get nyx token balance
  let Balance = await .balanceOf(address);
  Balance = Number(ethers.utils.formatUnits(Balance._hex, 9)).toFixed(
    0
  );

  store.commit("setBalance", Balance);
  // get nyxg balance
  let nyxgBalance = await nyxg.balanceOf(address);
  nyxgBalance = Number(ethers.utils.formatUnits(nyxgBalance._hex, 0));
  store.commit("setNYXGAmount", nyxgBalance);

  const tokenIds = [];
  for (let i = 0; i < 3; i++) {
    let id = await nyxg.tokenOfOwnerByIndex(address, i);
    id = ethers.utils.formatUnits(id._hex, 0);
    tokenIds.push(id);
  }
  store.commit("setUserTokenIds", tokenIds);

  // get overall pending balance
  let pendingRewards = await nyxgr.pendingRewards(tokenIds);
  pendingRewards = Number(ethers.utils.formatUnits(pendingRewards._hex, 9));

  store.commit("setPendingRewards", pendingRewards);

  // baseuri

  const baseUri = await nyxg.baseURI();

  store.commit("setBaseUri", baseUri);
   * 
   * 
   * 
   * 
   * 
   * 
   */
};
