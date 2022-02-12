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
  if (usdcBalancerVaultAllowance < amounts[0]) {
    count++;
    approvalRequired = true;
    flag = "USDC";
  }
  if (caplBalancerVaultAllowance < amounts[1]) {
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
