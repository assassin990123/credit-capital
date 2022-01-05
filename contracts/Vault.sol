//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./libs/SafeMath.sol";

contract Vault is Pausable, AccessControl {
    using SafeMath for uint256;

    // access control roles definition
    // reward token
    address public capl;

    // If a user adds a deposit below the locking threshold, the lp is absorbed into the previous lock.
    // else, a new stake is created.
    uint256 public lockingThreshold;
    // timelock duration
    uint256 timelock = 365 days;

    // unique stake identifier
    mapping (address => Stake) Stakes;
    // maps a users address to their stakes
    mapping(address => mapping (address => Stake)) userStakes; 

    struct Stake {
        // address lp; // I think this field can go out of this struct and can be used as a mapping key.
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
        // Stake[] stakes; // I don't understand clearly by this.
    }

    event Deposit(address lp, uint256 amount);

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

    // Deposit LP tokens to Vault for CAPL allocation.
    function depositStake(address _lp, uint256 _amount) external {

        User storage user = Users[msg.sender];
        Pool storage pool = Pools[_lp];
        Stake storage stake = Stakes[_lp];
        Stake storage userStake = userStakes[msg.sender][_lp];
        // updatePool(_lp);
        if (userStake.lpAmount > 0) {
            uint256 pending = userStake.lpAmount.mul(pool.averageRewardsPerUser).div(1e12).sub(user.rewardDebt);
            if(pending > 0) {
                capl.transfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            userStake.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            userStake.amount = userStake.amount.add(_amount);
        }
        userStake.rewardDebt = userStake.amount.mul(userStake.accCakePerShare).div(1e12);
        emit Deposit(msg.sender, _lp, _amount);
    }

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
    function checkTimelockThreshold() internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function mintCapl(address _to, uint256 _amount) external {}

    function addPool(address _lp) external {}

    function updatePool(uint256 _id, uint256 _totalRewards, uint256 _totalUsers) public {}

    function withdrawLP(address _lp) external {}

    function withdrawMATIC() external {}

    function updateTimelockDuration(uint256 _duration) external {}

}