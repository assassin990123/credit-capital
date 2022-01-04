//SPDX-License-Identifier: UNLICENSED
pragma solidity "0.8.11";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Vault is Pausable {
    // reward token
    address public capl;

    // If a user adds a deposit below the locking threshold, the lp is absorbed into the previous lock.
    // else, a new stake is created.
    uint256 public lockingThreshold;

    // unique stake identifier
    mapping (uint256 => Stake) Stakes;
    // maps a users address to their stakes
    mapping(address => Stake[]) userStakes; 

    struct Stake {
        address lp;
        uint256 lpAmount;
        uint256 startBlock;
        uint256 lastClaimBlock;
        bool externalLock;
        bool active;
    }
    // pool tracking
    /* 
        I'm still undecided if I want to create one contract for all of the pools, or multiple contracts. 
        I'm currently leaning towards a single contract. Open to suggestions and critique from anyone.
    */
    mapping(address => Pool) Pools;

    struct Pool {
        uint256 totalRewards;           // TBD if this stays or we add more on chain analytics
        uint256 totalUsers;             // TBD if this stays or we add more on chain analytics
        uint256 averageRewardsPerUser;  // TBD if this stays or we add more on chain analytics
    }

    mapping(address => User) Users;

    struct User {
        uint256 pendingRewards;
        uint256 rewardDebt;     // house fee (?)
        uint256 claimedRewards;
        Stake[] stakes;
    }

    // TBD: Assume creation with one pool required (?)
    constructor (address _capl) {
        capl = _capl;
    }
    
    /*
        Write functions
    */
    function depositLP(address _lp, uint256 _amount) external {}

    function withdrawStake(address _lp, uint256 _stake) external {}

    function withdrawAllStake(address _lp) external {}

    function setExternalLock(address _lp, uint256 _stakeId) external {}
   
    /*
        Read functions
    */
    function getPoolInfo(uint256 id) external returns (Pool memory) {}

    function getPools() external returns (Pool[] memory) {}

    function getUserInfo() external returns (User memory) {}

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function mintCapl(address _to, uint256 _amount) external {}

    function addPool(address _lp) external {}

    function updatePool(uint256 _id, uint256 _totalRewards, uint256 _totalUsers) public {}

    function withdrawLP(address _lp) external {}

    function withdrawMATIC() external {}

}