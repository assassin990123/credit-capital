export const format = (n: any) => {
  if (n < 1e3) {
    return Number(n).toFixed(3);
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

export const calculateCAPLUSDPrice = (
  amount: number,
  unit: string,
  poolTokens: any
): number => {
  if (poolTokens == null || poolTokens.balances == undefined) {
    return 0;
  }

  const CAPL = poolTokens.balances[0];
  const USDC = poolTokens.balances[1];

  // convert usdc to capl
  if (unit == "CAPL") {
    return (CAPL / USDC) * amount;
  }
  // convert capl to usdc
  if (unit == "USDC") {
    return (USDC / CAPL) * amount;
  }

  return 0;
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
  state: any,
  symbol: string,
  amount: number,
  flag: string
): boolean => {
  console.log(flag, symbol, amount);
  let allowance;

  if (flag == "balancer") {
    symbol == "CAPL"
      ? (allowance = state.getters["tokens/getCAPLBalancerVaultAllowance"])
      : (allowance = state.getters["tokens/getUSDCBalancerVaultAllowance"]);
  } else if (flag == "stake") {
    allowance = state.getters["tokens/getLPAllowance"];
  }
  return allowance >= amount;
};

export const checkAllAllowances = (
  state: any,
  amounts: Array<number>
): { approvalRequired: boolean; flag: string | null } => {
  const usdcBalancerVaultAllowance =
    state.getters["tokens/getUSDCBalancerVaultAllowance"];
  const caplBalancerVaultAllowance =
    state.getters["tokens/getCAPLBalancerVaultAllowance"];

  let count = 0;
  let approvalRequired = false;
  let flag: string | null = null;

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

export const caplUSDConversion = (amount: number, store: any): number => {
  return calculateCAPLUSDPrice(
    amount,
    "CAPL",
    store.getters["balancer/getPoolTokens"]
  );
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
  caplPerDay: number,
  totalStaked: number
): number => {
  // 43200 blocks / day on polygon

  return caplPerDay * 43200 * (userPosition / totalStaked);
};
