# Vault

### Stake Definition
The stake struct represents a users position in a pool. A user can have multiple stakes in a single pool.
```
# subject to change
struct Stake {
    uint256 amount;          // quantity staked
    uint256 startBlock;      // stake creation timestamp
    uint256 timeLockEnd;     // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
    bool active;             // true = stake in vault, false = user withdrawn stake
}
```

### Pool Definition
```
# subject to change
struct Pool {
    uint256 totalPooled;        // total token pooled in the contract
    uint256 rewardsPerBlock;    // rate at which CAPL is minted for this pool
    uint256 accCaplPerShare;    // weighted CAPL share in pool
    uint256 lastRewardBlock;    // last time a claim was made
}
```

### User Defintion
```
# subject to change
struct UserPosition {
    // address token;           // MRC20 associated with pool
    uint256 totalAmount;     // total value staked by user in given pool
    uint256 rewardDebt;      // house fee (?)
    uint256[] sKey;          // list of user stakes in pool subject to timelock
    bool staticLock;         // guarantees a users stake is locked, even after timelock expiration
    bool autocompounding;    // this userposition enables auto compounding (Auto restaking the rewards)
}
```

### Vault
The vault essentially has four responsabilities:
- Managing Pools (add, update, read, deactivate)
- Managing Users (add, update, read, deactivate)
- Managing Stakes (add, update, read, deactivate)

Besides the core functionality, the vault contract will need a role based access control [(RBAC)](https://docs.openzeppelin.com/contracts/2.x/api/access#Roles) mechanism for accessing restricted functions.

Staking will also need to be pausable at any time by an admin.

There also must be a way to remove the lp (via RBAC) in the case of emergencies.

Considerations for migrations are not taken into account here as that would defeat the purpose of this design.

