# Stabletokens

### Initiating a Loan
Before a user can take out a loan/mint tokens, they must lock up their collateral (property which is already stored in the trust system). Once this is done, they can initiate the loan. They’ll be expected to pay interest on the loan at 2.0% annually (final rate TBD). The dapp will explain to the user that they need to send CCUSD to the loan contract, at monthly intervals.
Within the living-trust containment system, revenue is being managed in such a way that it can be redirected to the platform. This is so that, in the event of insolvency, the revenue can be directed to the platform.
If they miss too many intervals, their revenue from the property, which is currently being managed by its living trust, will be redirected to the loan contract.

### Minting
Contract’s mint process:
When the loan/minting contract receives a Real Estate NFT, it calls the NFT ownership contract, to determine that NFT’s value. After evaluating the percentage of collateral value that can be offered as a loan, it calls on the CCUSD contract to mint new tokens, and assign them to the user’s wallet.
