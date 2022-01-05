//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Vault is Pausable, AccessControl {
    // access control roles definition
    // reward token
    address public capl;

    // If a user adds a deposit below the locking threshold, the lp is absorbed into the previous lock.
    // else, a new stake is created.
    uint256 public lockingThreshold;
    // timelock duration
    uint256 timelock = 137092276;   // 4 years, 4 months, 4 days ...

    // unique stake identifier
    mapping (uint256 => Stake) Stakes;
    // maps a users address to their stakes
    mapping(address => Stake[]) userStakes; 

    struct Stake {
        address token;
        uint256 tokenAmount;
        uint256 startBlock;
        uint256 lastClaimBlock;
        bool staticLock;
        bool active;
    }
    // pool tracking
    /* 
        I'm still undecided if I want to create one contract for all of the pools, or multiple contracts. 
        I'm currently leaning towards a single contract. Open to suggestions and critique from anyone.
    */
    mapping(address => Pool) Pools;

    struct Pool {
        uint256 totalPooled;    // total generic token pooled in the contract
        uint256 totalUsers;
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
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
        Write functions
    */
    function depositStake(address _token, uint256 _amount) external {}

    function withdrawStake(address _token, uint256 _stake, uint256 _amount) external {}

    function withdrawAllStake(address _token) external {}

    function setStaticLock(address _token, uint256 _stakeId) external {}
   
    /*
        Read functions
    */
    function getPoolInfo(uint256 id) external returns (Pool memory) {}

    function getPools() external returns (Pool[] memory) {}

    function getUserInfo() external returns (User memory) {}

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function mintCapl(address _to, uint256 _amount) external {}

    function addPool(address _token) external {}

    function updatePool(uint256 _id, uint256 _totalRewards, uint256 _totalUsers) internal {}

    function withdrawToken(address _token, uint256 _amount, address _destination) external {}

    function withdrawMATIC(address _destination) external {}

    function updateTimelockDuration(uint256 _duration) external {}

}