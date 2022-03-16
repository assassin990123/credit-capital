import { tokens } from '@/use/tokens'
import { balancer } from '@/use/balancer'
import { dashboard } from '@/use/dashboard'

export const format = (n: any) => {
  if (n < 1e5) {
    return Number(n).toFixed(2);
  }
  if (n >= 1e5 && n < 1e6) {
    return +(n / 1e3).toFixed(2) + " K";
  }
  if (n >= 1e6 && n < 1e9) {
    return +(n / 1e6).toFixed(2) + " M";
  }
  if (n >= 1e9 && n < 1e12) {
    return +(n / 1e9).toFixed(2) + " B";
  }
  if (n >= 1e12) {
    return +(n / 1e12).toFixed(2) + " T";
  }
};

export const calculateCAPLUSDPrice = (
  amount: number,
  unit: string,
  poolTokens: any
): number => {
  if (poolTokens == null || poolTokens.balances == undefined) {
    return 0;
  }

  const USDC = poolTokens.balances[0];
  const CAPL = poolTokens.balances[1];

  // convert capl to usdc
  if (unit == "CAPL") {
    return (USDC / CAPL) * amount;
  }
  // convert usdc to capl
  if (unit == "USDC") {
    return (CAPL / USDC) * amount;
  }

  return 0;
};

//total pool value = USDC balance + capl balance * capl price
//LP token price = total pool value / lp token supply
// user positioninUSD = lp token price + user position
export const calculateLPUSDPrice = (amount: number): number => {
  const poolTokens = balancer.poolTokens;
  const lpTokenSupply = dashboard.lpTokenSupply;
  if (
    poolTokens == null ||
    poolTokens.balances == undefined ||
    lpTokenSupply == undefined
  ) {
    return 0;
  }
  const USDC = poolTokens.balances[0];
  const CAPL = poolTokens.balances[1];
  // Pool Value: USDC Balance + CAPL Balance * CAPL Price - see calculateCAPLUSDPrice()
  const poolValue = Number(USDC) + (Number(CAPL) * Number(USDC)) / Number(CAPL);
  return (amount * poolValue) / lpTokenSupply;
};

export interface Constant {
  symbol: string;
  contracts: {
    137: string;
    42: string;
  };
}

export interface Pool {
  symbol: string;
  id: {
    42: string;
  };
  contracts: {
    137: string;
    42: string;
  };
}

export const findObjectContract = (
  flag: string,
  obj: Array<Constant | Pool>,
  chain: string
) => {
  const c = obj.find((o) => o.symbol == flag);
  // @ts-ignore
  return c?.contracts[chain];
};

export const findObjectId = (flag: string, obj: Array<Pool>, chain: string) => {
  const c = obj.find((o) => o.symbol == flag);
  // @ts-ignore
  return c?.id[chain];
};

export const shortenAddress = (address: string, chars = 3): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const checkAllowance = (
  symbol: string,
  amount: number,
  flag: string
): boolean => {
  const allowance = flag === 'balancer'
    ? (symbol === 'CAPL' ? tokens.capl.allowance : tokens.usdc.allowance)
    : flag === 'stake' ? tokens.lp.allowance : 0
  return allowance >= amount;
};

export const checkAllAllowances = (amounts: Array<number>): {
  approvalRequired: boolean; flag: string | null
} => {
  const usdcBalancerVaultAllowance = tokens.usdc.allowance
  const caplBalancerVaultAllowance = tokens.capl.allowance

  let count = 0;
  let approvalRequired = false;
  let flag: string | null = null;
  console.log(usdcBalancerVaultAllowance, caplBalancerVaultAllowance);
  // known:
  // amounts[0] -> usdc, amounts[1] -> capl
  if (amounts[0] !== 0 && usdcBalancerVaultAllowance < amounts[0]) {
    count++;
    approvalRequired = true;
    flag = "USDC";
  }
  if (amounts[1] !== 0 && caplBalancerVaultAllowance < amounts[1]) {
    count++;
    approvalRequired = true;
    flag = "CAPL";
  }
  if (count == 2) flag = "All";

  return { approvalRequired, flag };
  // if both tokens require approval, count == 2
  // if
};

export const caplToUSD = (amount: number): number => {
  return calculateCAPLUSDPrice(amount, "CAPL", balancer.poolTokens);
};
export const lpToUSD = (amount: number): number => {
  return calculateLPUSDPrice(amount);
};

export const stringToNumber = (str: any) => {
  if (typeof str != "string") {
    return str;
  }
  const multiplier = str.substring(str.length - 1).toLowerCase();
  switch (multiplier) {
    case "k":
      return parseFloat(str) * 1000;
    case "m":
      return parseFloat(str) * 1000000;
    case "b":
      return parseFloat(str) * 1000000000;
    case "t":
      return parseFloat(str) * 1000000000000;
    default:
      return str;
  }
};
// CaplPerDay (pool) / totalStaked (pool) * userPosition
export const getDailyEarnings = (
  userPosition: number,
  caplPerSecond: number,
  totalStaked: number
): number => {
  // caplPerSecond * seconds per day * ratio of user's position vs total staked. Accounting for token decimals.
  return (caplPerSecond * 86400 * userPosition) / totalStaked / 1e18;
};

export const getEthereum = () => (window as any).ethereum
