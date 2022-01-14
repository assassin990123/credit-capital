# Rewards V2
The rewards contract is an upgradeable layer that sits in front of the rewards vault, acting as a proxy for all write calls to the vault. 

For example, in order to add a stake to an existing pool, you must call the ``addStake`` function in the rewards contract. This function's responsability is to call the relevant ``vault`` functions to update the state, as well as to calculate each users new allocation, and debt, based on the current state of the vault. Please check out this functions implementation in the rewards contract for further clarification.

### Timelocks
Baked into the Stake struct is all of the logic required to calculate and read timelocks. All deposits into a given pool are subject to a one year timelock. However, a user that creates multiple deposits in a short amount of time will not be subject to multiple timelocks. If the user deposits multiple positions below the ``timelockThreshold`` (see contract) that deposit gets absorbed into the most recent position. Otherwise, a new position is created subject to its own, one year timelock.