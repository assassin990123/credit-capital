//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault is Pausable, AccessControl {
    // access control roles definition
    // reward token
    address public capl;
    // the Treasury funded via platform fees upon deposit & withdraw
    address public treasury;

    // If a user adds a deposit below the locking threshold, the lp is absorbed into the previous lock.
    // else, a new stake is created.
    uint256 public lockingThreshold;
    // timelock duration
    uint256 timelock = 137092276;   // 4 years, 4 months, 4 days ...
    // 0.1% platform fee
    uint256 public constant depositFee = 1; // 1%

    uint256 public constant MULTIPLIER = 1e6;
    uint256 public constant ONE_HUNDRED = 100;

    // maps a users address to their stakes
    mapping(address => UserInfo) Users; 

    struct UserInfo {
        address token;
        uint256 tokenAmount;
        uint256 startBlock;
        uint256 lastClaimBlock;
        bool staticLock;
        bool active;
    }
    
    mapping(address => Pool) Pools;

    struct Pool {
        uint256 totalPooled;    // total generic token pooled in the contract
        uint256 totalUsers;
        bool active;
    }

    event DepositStake(address token, uint256 amount);
    event WithdrawStake(address token, uint256 amount);

    // TBD: Assume creation with one pool required (?)
    constructor (address _capl, address _treasury) {
        capl = _capl;
        treasury = _treasury;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
    * Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
    * 1. The stake's `accCAPLPerUser` (and `lastClaimBlock`) gets updated.
    * 2. User's `amount` gets updated.
    */
    function depositVault(address _token, uint256 _amount) external {

    }

    function withdrawVault(address _token, uint256 _amount) external {}
   
    /*
        Read functions
    */
    function getPoolInfo(uint256 id) external returns (Pool memory) {}

    function getPools() external returns (Pool[] memory) {}

    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].active;
    }


    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal returns (bool) {

    }
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function mintCapl(address _to, uint256 _amount) external {}

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