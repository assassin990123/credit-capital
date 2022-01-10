//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault is Pausable, AccessControl {
    // stake tracking
    mapping (address => Stake[]) Stakes;

    struct Stake {
        uint256 key;             // stake identifier
        uint256 amount;          // quantity staked
        uint256 startBlock;      // stake creation timestamp
        uint256 timeLockEnd;     // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
        bool active;             // true = stake in vault, false = user withdrawn stake
    }
    // user position tracking
    mapping(address => UserPosition[]) Users;

    struct UserPosition {
        address token;           // MRC20 associated with pool
        uint256 totalAmount;     // total value staked by user in given pool
        uint256 pendingRewards;  // total rewards pending for user 
        uint256 rewardDebt;      // house fee (?)
        uint256 claimedRewards;  // total rewards claimed by user for given pool
        Stake[] stakes;          // list of user stakes in pool subject to timelock
        bool staticLock;         // guarantees a users stake is locked, even after timelock expiration
    }

    // pool tracking
    mapping(address => Pool) Pools;

    struct Pool {
        uint256 totalPooled;    // total token pooled in the contract
        uint256 totalUsers;     // total number of active participants
        uint256 rewardsPerDay;  // rate at which CAPL is minted for this pool
    }
    // TBD: Assume creation with one pool required (?)
    constructor () {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
        Write functions
    */
    function depositVault(address _token, uint256 _amount) external {}

    function withdrawVault(address _token, uint256 _amount) external {}
   
    /*
        Read functions
    */
    function getPoolInfo(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    function getPools() external returns (Pool[] memory) {}

    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].totalUsers > 0;
    }


    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function addPool(address _token, uint256 _amount) external {
        require(!checkIfPoolExists(_token), "This pool already exists");
        Pools[_token] = Pool({
            totalPooled: _amount,
            totalUsers: 1,
            active: true
        });
    }

    function updatePool(uint256 _id, uint256 _totalRewards, uint256 _totalUsers) internal {}

    function withdrawToken(address _token, uint256 _amount, address _destination) external {}

    function withdrawMATIC(address _destination) external {}

    function withdrawAllVault(address _token) external {}


}