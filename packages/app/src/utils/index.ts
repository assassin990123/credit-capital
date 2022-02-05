import { capl } from "@/contracts";

export const format = (n: any) => {
  if (n < 1e3) {
    return n;
  }
  if (n >= 1e3 && n < 1e6) {
    return +(n / 1e3).toFixed(1) + " K";
  }
  if (n >= 1e6 && n < 1e9) {
    return +(n / 1e6).toFixed(1) + " M";
  }
  if (n >= 1e9 && n < 1e12) {
    return +(n / 1e9).toFixed(1) + " B";
  }
  if (n >= 1e12) {
    return +(n / 1e12).toFixed(1) + " T";
  }
};

export const calculateCAPLUSDPrice = (amount: number, unit: string, poolTokens: any ) => {

  const USDC = poolTokens.balances[0];
  const CAPL = poolTokens.balances[1];

  // convert usdc to capl
  if ( unit == "CAPL" ) {
    return (CAPL / USDC) * amount;
  }
  // convert capl to usdc
  if (unit == "USDC") {
    return (USDC / CAPL) * amount;
  }
}
