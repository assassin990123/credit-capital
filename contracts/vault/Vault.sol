//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Vault is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant REWARDS = keccak256("REWARDS");

    uint256 timelock = 137092276; // 4 years, 4 months, 4 days ...
    uint256 rewardsPerDay;
    struct Stake {
        uint256 amount; // quantity staked
        uint256 startBlock; // stake creation timestamp
        uint256 timeLockEnd; // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
        bool active; // true = stake in vault, false = user withdrawn stake
    }

    struct UserPosition {
        uint256 totalAmount; // total value staked by user in given pool
        uint256 rewardDebt; // house fee (?)
        uint256 userLastWithdrawnStakeIndex; // track the last unlocked index for each user's position in a pool, so that withdrawal iteration is less expensive
        bool staticLock; // guarantees a users stake is locked, even after timelock expiration
        bool autocompounding; // this userposition enables auto compounding (Auto restaking the rewards)
        Stake[] stakes; // list of user stakes in pool subject to timelock
    }

    // user position tracking
    mapping(address => mapping(address => UserPosition)) UserPositions; // account => (token => userposition)

    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 rewardsPerBlock; // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare; // weighted CAPL share in pool
        uint256 lastRewardBlock; // last time a claim was made
    }

    // pool tracking
    mapping(address => Pool) Pools; // token => pool

    event Deposit(address user, address token, uint256 amount);
    event Withdraw(address user, address token, uint256 amount);
    event WithdrawMATIC(address destination, uint256 amount);

    // TBD: Assume creation with one pool required (?)
    constructor() {
        // RBAC
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REWARDS, msg.sender);
    }

    function deposit(
        address _token,
        address _user,
        uint256 _amount
    ) external whenNotPaused {
        require(_amount > 0, "Amount 0");

        // userPosition
        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.totalAmount += _amount;

        // check the last stake's timeLock
        uint256 sKey = userPosition.stakes.length - 1;

        Stake storage lastStake = UserPositions[_user][_token].stakes[sKey];

        if (checkTimelockThreshold(lastStake)) {
            require(!checkIfPoolExists(_token), "This pool already exists.");

            // create new stake
            Stake memory newStake = Stake({
                amount: _amount,
                startBlock: block.timestamp,
                timeLockEnd: block.timestamp + timelock,
                active: true
            });

            // add new Stake for the user
            UserPositions[_user][_token].stakes.push(newStake);
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

        // trigger the deposit event
        emit Deposit(_user, _token, _amount);
    }

    function updatePool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardBlock
    ) external returns (Pool memory) {
        Pools[_token].lastRewardBlock = _lastRewardBlock;
        Pools[_token].accCaplPerShare = _accCaplPerShare;

        return Pools[_token];
    }

    function withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _newRewardDebt
    ) external whenNotPaused onlyRole(REWARDS) {
        require(_amount > 0, "Amount 0");

        UserPosition storage userPosition = UserPositions[_user][_token];
        require(
            userPosition.totalAmount > _amount,
            "Withdrawn amount exceed the user balance"
        );

        userPosition.totalAmount -= _amount;
        userPosition.rewardDebt = _newRewardDebt;

        Pool storage pool = Pools[_token];
        pool.totalPooled -= _amount;

        // reset the stakes to the default value related to the unlocked amount
        Stake[] storage stakes = UserPositions[_user][_token].stakes;
        for (
            uint256 i = 0;
            i <= userPosition.userLastWithdrawnStakeIndex;
            i++
        ) {
            // reset the stake to the default value - in this case 0
            delete stakes[i];
        }

        IERC20(_token).safeTransferFrom(address(this), _user, _amount);

        emit Withdraw(_user, _token, _amount);
    }

    function addStake(
        address _token,
        address _user,
        uint256 _amount
    ) external {
        // create user & stake data
        Stake memory stake = Stake({
            amount: _amount, // first stake
            startBlock: block.timestamp,
            timeLockEnd: block.timestamp + timelock,
            active: true
        });

        UserPositions[_user][_token].stakes.push(stake);
    }

    function setStake(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _stakeId
    ) external onlyRole(REWARDS) {
        Stake storage stake = UserPositions[_user][_token].stakes[_stakeId];

        stake.amount += _amount;
    }

    /*
        Read functions
    */
    function getPool(address _token) external view returns (Pool memory) {
        require(checkIfPoolExists(_token), "The pool does not exists.");

        return Pools[_token];
    }

    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].rewardsPerBlock > 0;
    }

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold(Stake storage _lastStake)
        internal
        view
        returns (bool)
    {
        return _lastStake.timeLockEnd < block.timestamp;
    }

    function checkIfUserPositionExists(address _token)
        external
        view
        returns (bool)
    {
        return UserPositions[msg.sender][_token].totalAmount > 0;
    }

    function getUserPosition(address _token, address _user)
        external
        view
        onlyRole(REWARDS)
        returns (UserPosition memory)
    {
        return UserPositions[_user][_token];
    }

    function getUnlockedAmount(address _token, address _user)
        external
        onlyRole(REWARDS)
        returns (uint256)
    {
        UserPosition storage userPosition = UserPositions[_user][_token];
        Stake[] memory stakes = UserPositions[_user][_token].stakes;

        if (stakes.length != 0) {
            return 0;
        }

        uint256 unlockedAmount = 0;
        uint256 lastUnlockedIndex;

        for (
            uint256 i = userPosition.userLastWithdrawnStakeIndex;
            i < stakes.length;
            i++
        ) {
            if (stakes[i].timeLockEnd > block.timestamp) {
                lastUnlockedIndex = i;
                break;
            }
            unlockedAmount += stakes[i].amount;
        }

        userPosition.userLastWithdrawnStakeIndex = lastUnlockedIndex;

        return unlockedAmount;
    }

    function getLastStake(address _token, address _user)
        external
        view
        onlyRole(REWARDS)
        returns (Stake memory)
    {
        UserPosition memory userPosition = UserPositions[_user][_token];
        uint256 lastStakeKey = userPosition.stakes.length - 1;

        return UserPositions[_user][_token].stakes[lastStakeKey];
    }

    function getLastStakeKey(address _token, address _user)
        external
        view
        onlyRole(REWARDS)
        returns (uint256)
    {
        return UserPositions[_user][_token].stakes.length - 1;
    }

    function getTokenSupply(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    /*
        Admin functions
    */

    function addPool(address _token, uint256 _rewardsPerBlock)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(!checkIfPoolExists(_token), "This pool already exists.");

        Pool memory pool = Pool({
            totalPooled: 0,
            rewardsPerBlock: _rewardsPerBlock,
            accCaplPerShare: 0,
            lastRewardBlock: block.number
        });

        Pools[_token] = pool;
    }

    function setPool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardBlock
    ) external onlyRole(REWARDS) returns (Pool memory) {
        require(checkIfPoolExists(_token), "Pool does not exist");

        Pools[_token].accCaplPerShare = _accCaplPerShare;
        Pools[_token].lastRewardBlock = _lastRewardBlock;

        return Pools[_token];
    }

    function addUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) public onlyRole(REWARDS) {
        Stake[] memory userStakes;

        // create new userPosition
        UserPositions[_user][_token] = UserPosition({
            totalAmount: _amount,
            rewardDebt: _rewardDebt,
            stakes: userStakes,
            userLastWithdrawnStakeIndex: 0,
            staticLock: false,
            autocompounding: true
        });
    }

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external onlyRole(REWARDS) {
        // create new userPosition
        UserPositions[_user][_token].totalAmount = _amount;
        UserPositions[_user][_token].rewardDebt = _rewardDebt;
    }

    function setUserDebt(
        address _token,
        address _user,
        uint256 rewardDebt
    ) external onlyRole(REWARDS) {
        UserPositions[_user][_token].rewardDebt = rewardDebt;
    }

    function withdrawToken(
        address _token,
        uint256 _amount,
        address _destination
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Pool storage pool = Pools[_token];

        require(_amount > 0 && pool.totalPooled >= _amount);

        // withdraw the token to user wallet
        IERC20(_token).safeTransferFrom(address(this), _destination, _amount);

        // update the pooled amount
        pool.totalPooled -= _amount;
    }

    function withdrawMATIC() public payable onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance > 0, "no matic to withdraw");
        uint256 balance = address(this).balance;

        payable(msg.sender).transfer(balance);

        emit WithdrawMATIC(msg.sender, balance);
    }
}
