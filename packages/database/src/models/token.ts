type Token = {
  symbol: string;
  decimals: number;
  contracts: {
    [id: number]: string;
  };
};

export default Token;
