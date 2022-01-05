//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    uint256 timelock = 137092276;   // 4 years, 4 months, 4 days ...
    // 0.1% deposit fee
    uint256 public constant depositFee = 0.1; // 1%

    uint256 public constant MULTIPLIER = 1e6;

    // unique stake identifier
    mapping (address => Stake) Stakes;
    // maps a users address to their stakes
    mapping(address => mapping (address => Stake)) userStakes; 

    struct Stake {
        // address token; // I think this part can be omitted as we can use the token address as a mapping key.
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
        uint256 accCAPLPerUser;
    }

    mapping(address => User) Users;

    struct User {
        uint256 pendingRewards; // I think there is no need to store this value as the pending rewards will only be calculated when it return back to the user on Deposit/Withdraw.
        uint256 rewardDebt;     // house fee (?)
        uint256 claimedRewards;
        // Stake[] stakes; // I think this is not needed as we declared the userStakes mapping.
    }

    event DepositStake(address token, uint256 amount);
    event WithdrawStake(address token, uint256 amount);

    // TBD: Assume creation with one pool required (?)
    constructor (address _capl) {
        capl = _capl;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
    * Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
    * 1. The stake's `accCAPLPerUser` (and `lastClaimBlock`) gets updated.
    * 2. User receives the pending reward sent to his/her address. - perhaps this should go to ther reward contract
    * 3. User's `amount` gets updated.
    * 4. User's `rewardDebt` gets updated.
    */
    function depositStake(address _token, uint256 _amount) external {
        Pool memory pool = Pools[_token];
        User storage user = Users[msg.sender]; 
        Stake storage userStake = userStakes[msg.sender][_token];

        // update the userstake's lastClaimBlock
        if (block.number <= userStake.lastClaimBlock) {
            return;
        }
        uint256 lpSupply = IERC20(_token).balanceOf(address(this));
        if (lpSupply == 0) {
            userStake.lastClaimBlock = block.number;
            return;
        }

        // return the user's pending reward - I am not suer this part should go to the reward contract.
        if (userStake.tokenAmount > 0) {
            uint256 pending = userStake.tokenAmount.mul(pool.accCAPLPerUser).div(1e12).sub(user.rewardDebt);
            if(pending > 0) {
                IERC20(_token).transfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            IERC20(_token).transferFrom(address(msg.sender), address(this), _amount);
            userStake.tokenAmount = userStake.tokenAmount.add(_amount);
        }

        // update uesr's rewardDebt
        user.rewardDebt = userStake.tokenAmount.mul(pool.accCAPLPerUser).div(1e6);
        emit DepositStake(_token, _amount);
    }

    function withdrawStake(address _token, uint256 _stake, uint256 _amount) external {
        User storage user = Users[msg.sender];
        Pool storage pool = Pools[_token];
        Stake storage userStake = userStakes[msg.sender][_token];
        require(userStake.tokenAmount >= _amount, "withdraw: not good");

        // updatePool(_pid);
        uint256 pending = userStake.tokenAmount.mul(pool.accCAPLPerUser).div(1e12).sub(user.rewardDebt);
        if(pending > 0) {
            IERC20(_token).transfer(msg.sender, pending);
        }
        if(_amount > 0) {
            userStake.tokenAmount = userStake.tokenAmount.sub(_amount);
            IERC20(_token).transfer(address(msg.sender), _amount);
        }
        user.rewardDebt = userStake.tokenAmount.mul(pool.accCAPLPerUser).div(1e12);
        emit WithdrawStake(_token, _amount);
    }

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