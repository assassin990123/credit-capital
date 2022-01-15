//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Vault is AccessControl, Pausable {
    using SafeERC20 for IERC20;
    
    // MINTER = mint & burn role
    bytes32 public constant MINTER = keccak256("MINTER");

    uint256 timelock = 137092276;   // 4 years, 4 months, 4 days ...
    uint256 rewardsPerDay;

    struct Stake {
        uint256 amount;          // quantity staked
        uint256 startBlock;      // stake creation timestamp
        uint256 timeLockEnd;     // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
        bool active;             // true = stake in vault, false = user withdrawn stake
    }

    // users stake identifiers
    mapping(address => Stake[]) Stakes; // account => stake[]

    struct UserPosition {
        uint256 totalAmount;     // total value staked by user in given pool
        uint256 rewardDebt;      // house fee (?)
        uint256[] sKey;          // list of user stakes in pool subject to timelock
        bool staticLock;         // guarantees a users stake is locked, even after timelock expiration
        bool autocompounding;    // this userposition enables auto compounding (Auto restaking the rewards)
    }

    // user position tracking
    mapping(address => mapping(address => UserPosition)) UserPositions; // account => (token => userposition)

    struct Pool {
        uint256 totalPooled;        // total token pooled in the contract
        uint256 rewardsPerBlock;    // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare;    // weighted CAPL share in pool
        uint256 lastRewardBlock;    // last time a claim was made
    }

    // pool tracking
    mapping(address => Pool) Pools; // token => pool
    mapping(address => UserPosition[]) PoolUsers; // token => userPosition

    event DepositVault(address user, address token, uint amount);
    event WithdrawVault(address user, address token, uint amount);
    event WithdrawMATIC(address destination, uint amount);

    // TBD: Assume creation with one pool required (?)
    constructor () {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function depositVault(address _user, address _token, uint256 _amount) external whenNotPaused {
        require(_amount > 0, "Amount 0");

        // userPosition
        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.totalAmount += _amount;

        // check the last stake's timeLock
        uint256 sKey = userPosition.sKey[userPosition.sKey.length - 1];

        Stake storage lastStake = Stakes[_user][sKey];

        if (checkTimelockThreshold(lastStake)) {
            require(!checkIfPoolExists(_token), "This pool already exists.");

            // create new stake
            Stake memory newStake = Stake ({
                amount: _amount,
                startBlock: block.timestamp,
                timeLockEnd: block.timestamp + timelock,
                active: true
            });

            // add new Stake for the user
            Stakes[_user].push(newStake);

            // add stake for the current userposition
            userPosition.sKey.push(userPosition.sKey.length);
        } else {
            // update the stake
            lastStake.amount += _amount;
        }

        // pools
        Pool storage pool = Pools[_token];

        // update the pool info
        pool.totalPooled += _amount;

        // _transferDepositFee(_user, _token, _amount);
        IERC20(_token).safeTransferFrom(_user, address(this), _amount);

        // trigger the depositVault event
        emit DepositVault(_user, _token, _amount);
    }

    function withdrawVault(address _user, address _token, uint256 _amount, uint _stakeId) external whenNotPaused {
        require(_amount > 0, "Amount 0");

        // we should consider about the withdrawfee during the timelock
        UserPosition storage userPosition = UserPositions[_user][_token];
        require(userPosition.totalAmount > _amount, "Withdrawn amount exceed the user balance");
        userPosition.totalAmount -= _amount;

        // Update Pool info
        Pool storage pool = Pools[_token];
        pool.totalPooled -= _amount;

        // Stakes
        Stake storage stake = Stakes[_user][_stakeId];
        stake.amount -= _amount;
        if (stake.amount == 0) {
            stake.active = false;
        }

        // transfer token to the user's wallet
        IERC20(_token).safeTransferFrom(address(this), _user, _amount);
        emit WithdrawVault(_user, _token, _amount);
    }

    /**
        @dev - here we can assume that there are no timelocks, since the vault has no knowledge of the pool.
     */
    function addPool(address _token, uint256 _amount, uint256 _rewardsPerDay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!checkIfPoolExists(_token), "This pool already exists.");

        // create user & stake data
        Stake memory newStake = Stake({
            amount: _amount,                   // first stake
            startBlock: block.timestamp,
            timeLockEnd: block.timestamp + timelock,
            active: true
        });

        addUserPosition(_token, msg.sender, _amount, 0);

        // add new stake key
        UserPositions[msg.sender][_token].sKey.push(0);
        // register users Stake
        Stakes[msg.sender].push(newStake);

        // transfer funds to the vault
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
    }
   
    /*
        Read functions
    */
    function getPool(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    /**
     * @dev Check if there are users who stakes in the token pool
     */
    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].totalUsers > 0;
    }

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold(Stake storage _lastStake) internal view returns (bool) {
        return _lastStake.timeLockEnd < block.timestamp;
    }

    function checkIfUserPositionExists(address _token) external view returns (bool);    
    function getUserPosition(address _token, address _user) external returns (UserPosition memory) {

    }
    function getUnlockedAmount(address _token, address _user) external returns (uint256);

    function getLastStake(address _token, address _user) external returns (Stake memory) {
        UserPosition memory userPosition = UserPositions[_user][_token];
        uint256 lastStakeKey = userPosition.sKey.length - 1;

        return Stakes[_user][userPosition];
    }

    function getLastStakeKey(address _token, address _user) external returns (uint256);

    /*
        Admin functions
    */
    
    function registerPool(address _token, uint256 _amount, uint256 _rewardsPerDay) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!checkIfPoolExists(_token.sender), "This pool already exists");
        Pools[_token] = Pool({
            totalPooled: _amount,
            totalUsers: 1,
            rewardsPerDay: _rewardsPerDay
        });
    }
    
    function setPool(address _token, uint256 _accCaplPerShare, uint256 _lastRewardBlock) external onlyRole(DEFAULT_ADMIN_ROLE) returns (Pool memory) {
        Pool memory pool = Pools[_token];
        pool._accCaplPerShare = _accCaplPerShare;
        pool._lastRewardBlock = _lastRewardBlock;
        Pools[_token] = pool;

        return pool;
    }

    function addUserPosition(address _token, address _user, uint256 _amount, uint _rewardDebt) internal onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256[] memory userStakeKeys;

        UserPosition memory newUser = UserPosition ({
            totalAmount: _amount,
            pendingRewards: 0,
            rewardDebt: _rewardDebt,
            claimedRewards: 0,
            sKey: userStakeKeys,
            staticLock: false,
            autocompounding: true
        });

        // create new userPosition
        UserPositions[_user][_token] = newUser;
    }

    function setUserPosition(address _token, address _user, uint256 _amount, uint256 _rewardDebt) external;
    function setUserDebt(address _token, address _user, uint256 rewardDebt) external onlyRole(DEFAULT_ADMIN_ROLE) {

    }

    function addStake(address _token, address _user, uint256 _amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // create user & stake data
        Stake memory newStake = Stake({
            amount: _amount,                   // first stake
            startBlock: block.timestamp,
            timeLockEnd: block.timestamp + timelock,
            active: true
        });
    }

    /**
     * Update stake - called from rewards contract
     */
    function setStake(address _token, address _user, uint _amount, uint256 _stakeId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Stake storage stake = Stakes[_user][_stakeId];

        // update stake
        stake.amount = _amount; // ? how can I send transfer the amount from the user? what about the previous amount?

        // transfer the updated account
        
    }

    function withdrawToken(address _token, uint256 _amount, address _destination) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Pool storage pool = Pools[_token];
        
        require(_amount > 0 && pool.totalPooled >= _amount);
        
        // withdraw the token to user wallet
        IERC20(_token).safeTransferFrom(address(this), _destination, _amount);

        // update the pooled amount
        pool.totalPooled -= _amount;
    }

    function withdrawMATIC(address _destination) public payable onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;

        (bool sent, bytes memory data) = _destination.call{value: balance}("");
        require(sent, "Failed to send MATIC");

        emit WithdrawMATIC(_destination, balance);
    }

    function setTimeLock(uint256 _duration) external onlyRole(DEFAULT_ADMIN_ROLE) {
        timelock = _duration;
        
    }


}