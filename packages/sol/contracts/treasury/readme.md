# System Definition

This is essentially a different version of the rewards system, with some added functionality.

The ``treasuryStorage`` is essentially the same as the vault. It's function is to store data, with the only major difference is a ``loan`` function.

This ``loan`` function allows for registered users to 'borrow' the treasury funds.

These loaned funds are eventually returned in the ``treasuryIncome`` function in the ``revenueController`` contract. At which point, assuming there is profit, the principal or loaned amount is returned to the storage contract, and the profit remains in the revenue controller.

Then, calling ``getCAPLAlloc`` will determine the amount of CAPL (or generic token? TBD) that is available for revenue distribution. This is then sent to the ``revenueFund`` contract that is analogous to the rewards contract. At this point, the ``claimRevenue`` and ``pendingRevenue`` functions follow the same logic as the rewards contract.

When the initial treasury deposit is made, a predetermined amount of treasury shares will be minted. It is assumed (for simplicity) that a single user will own 100% of the treasury. 

In order to determine the ``totalManagedValue`` of the treasury, we must be able to read the balancer pool for price data (CAPL-USDC), derive a price for CAPL, and then determine a USD value for the total value in the treasury storage. This is, for now, just a read function for the dapp.