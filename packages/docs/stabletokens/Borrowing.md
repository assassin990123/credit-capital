---
order: 90
label: Borrowing CCUSD
---

### Initiating a Loan
Before a user can take out a loan/mint tokens, they must lock up some collateral This can be either a verified, tokenized asset (commercial real estate or bond) or predetermined Liquidity-Pool-tokens. Once this is done, they can initiate the loan. Borrowers will be charged 3% interest anually on these loans. If the borrower misses too many of these monthly interest payments, their loan will be put into a risk status (explained in ["Liquidation"](https://ccdocs.netlify.app/stabletokens/liquidation/)). A portion of the interest recieved, will be exchanged for CAPL tokens, deposited back into the borrower's wallet.

### Dynamic Interest Allocation
Interest accrues automatically, being calculated by the smart contract. User debt balances slowly and incrementally scale on a daily basis with the resulting interest payments being minted directly to the Treasury Revenue Controller. This provides the protocol consistent, regular revenue, while not subjecting borrowers to strict payment schedules.

### Revenue-generating Collateral
Any real estate being used as collateral needs to be integrated into the living-trust-management system, before it can be used as collateral. This process is described in more detail in ["Tokenized Real Estate"](https://ccdocs.netlify.app/tokenized_real_estate/) Within the living-trust containment system, revenue is being managed in such a way that it can be redirected to the platform, and a small percentage of the revenue is always by deducted by the platform, and fed into the CCUSD staking pools. Since the revenue is managed by this smart contract, the revenue can be directed to the platform, in the event of insolvency.
If they miss too many intervals, their revenue from the property, which is being managed by its living trust (and in turn, the smart contract), will be redirected to the loan contract.

### Minting
Contract’s mint process:
When the loan/minting contract receives a Collateral NFT, it calls that NFT's ownership contract, to determine that its value. After evaluating the percentage of collateral value that can be offered as a loan, it calls on the CCUSD contract to mint new tokens, and assign them to the user’s wallet. For applicable collateral NFTs, it also calls the NFT Rev Controller factory contract, to build a new NFT Rev Controller instance, specific to this loan. 
