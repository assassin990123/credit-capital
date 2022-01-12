# Rewards V2
The rewards contract is an upgradeable layer that sits in front of the rewards vault, acting as a proxy for all write calls to the vault. 

For example, in order to add a stake to an existing pool, you must call the ``addStake`` function in the rewards contract. This function's responsability is to call the relevant ``vault`` functions to update the state, as well as to calculate each users new allocation, and debt, based on the current state of the vault. Please check out this functions implementation in the rewards contract for further clarification.

