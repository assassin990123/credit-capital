import { ethers } from "ethers";
//@ts-ignore
import abi from "./abi.json";

const exampleDeployments = {
  1: "",
  42: "0x19C97d29835C1FEacf0aB955759359A7043ba4C9",
};

export const exampleContractInit = (provider: any) => {
  const address = exampleDeployments[42]; // refactor
  return new ethers.Contract(address, abi, provider);
};
