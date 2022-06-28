---
order: 90
label: Borrowing CCUSD
---

### Initiating a Loan
Before a user can take out a loan/mint tokens, they must lock up some collateral, either a verified, tokenized asset (commercial real estate or bond) or predetermined Liquidity Pool tokens. Once this is done, they can initiate the loan. They will be expected to pay interest on the loan at 15% annually. This interest is split up within the platform; 5% goes to the NFT Revenue Controller Contract (instance), and the other 10% goes to the Treasury Contract. The NFT Rev Controller will, however, send tokens back to the borrower. It will exchange the 5% recieved as USDC for CAPL tokens instead, and deposit those back to the borrower. If the borrower misses too many of these monthly interest payments, their loan will be put into a risk status (explained in "Liquidation").
Within the living-trust containment system, revenue is being managed in such a way that it can be redirected to the platform. This is so that, in the event of insolvency, the revenue can be directed to the platform.
If they miss too many intervals, their revenue from the property, which is currently being managed by its living trust, will be redirected to the loan contract.

### Minting
Contract’s mint process:
When the loan/minting contract receives a Real Estate NFT, it calls the NFT ownership contract, to determine that NFT’s value. After evaluating the percentage of collateral value that can be offered as a loan, it calls on the CCUSD contract to mint new tokens, and assign them to the user’s wallet.

### CAPL Rewards
While the loan is active, the NFT Revenue controller contract will dispense CAPL tokens to the borrower, as an added incentive.