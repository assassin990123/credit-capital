//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICAPL {
    function mint(address _to, uint256 _amount) external;
}

contract Vault is Pausable, AccessControl {
    bytes32 public constant minter = keccak256("MINTER");
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
    uint256 public constant platformFee = 1; // 1%

    // standard constants
    uint256 public constant MULTIPLIER = 1e6;
    uint256 public constant ONE_HUNDRED = 100;

    // maps a users address to their stakes
    mapping(address => mapping(address => UserInfo)) public userInfo; 

    struct UserInfo {
        uint256 tokenAmount;
        uint256 lastClaimBlock;
        bool staticLock;
        bool active;
    }
    
    mapping(address => Pool) public Pools;

    struct Pool {
        uint256 totalPooled;    // total generic token pooled in the contract
        uint256 totalUsers;
        bool active;
    }

    event DepositVault(address token, uint256 amount);
    event WithdrawVault(address token, uint256 amount);

    // TBD: Assume creation with one pool required (?)
    constructor (address _capl, address _treasury) {
        capl = _capl;
        treasury = _treasury;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(minter, msg.sender);
    }
    
    /*
    * Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
    * 1. User's `amount` gets updated.
    * 2. The platformfee is transferred to the treasury wallet.
    */
    function depositVault(address _token, uint256 _amount) external {
        require(_amount > 0, "Amount 0");

        Pool storage pool = Pools[_token];
        UserInfo storage user = userInfo[_token][msg.sender];

        // transfer the platform fee to the treasury address
        uint currentPlatformFee = (_amount * platformFee) / ONE_HUNDRED;
        _amount -= currentPlatformFee;

        IERC20(_token).transferFrom(msg.sender, treasury, currentPlatformFee);
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        // update the user's amount
        user.tokenAmount += _amount;
        
        // update the pool info
        pool.totalPooled += _amount;

        if (!checkIfPoolExists(_token)) {
            pool.active = true;
        }

        // trigger the depositVault event
        emit DepositVault(_token, _amount);
    }

    function withdrawVault(address _token, uint256 _amount) external {

    }
   
    /*
        Read functions
    */
    function getPoolInfo(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

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
    function mintCapl(address _to, uint256 _amount) external {
        // should consider that limit per day - 5000 CAPL/day

        ICAPL(capl).mint(_to, _amount);
    }

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

    function withdrawAllVault(address _token) external {
        UserInfo storage user = userInfo[_token][msg.sender];
        Pool storage pool = Pools[_token];

        // transfer the platform fee
        uint256 currentPlatformFee = (user.tokenAmount * platformFee ) / ONE_HUNDRED;
        uint256 userBalance = IERC20(_token).balanceOf(msg.sender);

        if (userBalance < currentPlatformFee) {
            revert("Insufficient user balance: platform fee");
        }

        IERC20(_token).transferFrom(msg.sender, treasury, currentPlatformFee);

        // return back the deposited token to the user
        IERC20(_token).transferFrom(address(this), msg.sender, user.tokenAmount);

        pool.totalUsers -= 1;
        pool.totalPooled -= user.tokenAmount;
    }
}