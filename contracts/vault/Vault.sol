//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Vault is Pausable, Ownable {
    using SafeERC20 for IERC20;

    uint256 timelock = 137092276; // 4 years, 4 months, 4 days ...
    uint256 rewardsPerDay;

    // map a users stakes to a specific pool
    mapping(address => mapping(address => Stake[])) Stakes;

    struct Stake {
        uint256 amount; // quantity staked
        uint256 startBlock; // stake creation timestamp
        uint256 timeLockEnd; // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
        bool active; // true = stake in vault, false = user withdrawn stake
    }

    struct UserPosition {
        uint256 totalAmount; // total value staked by user in given pool
        uint256 rewardDebt; // house fee (?)
        uint256[] sKey; // list of user stakes in pool subject to timelock
        bool staticLock; // guarantees a users stake is locked, even after timelock expiration
        bool autocompounding; // this userposition enables auto compounding (Auto restaking the rewards)
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
    mapping(address => UserPosition[]) PoolUsers; // token => userPosition

    event DepositVault(address user, address token, uint256 amount);
    event WithdrawVault(address user, address token, uint256 amount);
    event WithdrawMATIC(address destination, uint256 amount);

    // TBD: Assume creation with one pool required (?)
    constructor() {}

    function depositVault(
        address _token,
        address _user,
        uint256 _amount
    ) external whenNotPaused {
        require(_amount > 0, "Amount 0");

        // userPosition
        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.totalAmount += _amount;

        // check the last stake's timeLock
        uint256 sKey = userPosition.sKey[userPosition.sKey.length - 1];

        Stake storage lastStake = Stakes[_user][_token][sKey];

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
            Stakes[_user][_token].push(newStake);

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

    function withdrawVault(
        address _user,
        address _token,
        uint256 _amount,
        uint256 _stakeId
    ) external whenNotPaused {
        require(_amount > 0, "Amount 0");

        // we should consider about the withdrawfee during the timelock
        UserPosition storage userPosition = UserPositions[_user][_token];
        require(
            userPosition.totalAmount > _amount,
            "Withdrawn amount exceed the user balance"
        );
        userPosition.totalAmount -= _amount;

        // Update Pool info
        Pool storage pool = Pools[_token];
        pool.totalPooled -= _amount;

        // Stakes
        Stake storage stake = Stakes[_user][_token][_stakeId];

        stake.amount -= _amount;
        if (stake.amount == 0) {
            stake.active = false;
        }

        // transfer token to the user's wallet
        IERC20(_token).safeTransferFrom(address(this), _user, _amount);
        emit WithdrawVault(_user, _token, _amount);
    }

    /*
        Read functions
    */
    function getPoolInfo(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    /**
     * @dev Check if the user has stakes for the token - again, user has the token pool staked
     */
    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].totalPooled > 0;
    }

    /*
        Admin functions
        TODO: Add RBAC for all
    */

    function addPool(address _token, uint256 _rewardsPerBlock)
        external
        onlyOwner
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

    function addUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) public onlyOwner {
        uint256[] memory userStakeKeys;

        UserPosition memory newUser = UserPosition({
            totalAmount: _amount,
            rewardDebt: _rewardDebt,
            sKey: userStakeKeys,
            staticLock: false,
            autocompounding: true
        });

        // create new userPosition
        UserPositions[_user][_token] = newUser;
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

        Stakes[_user][_token].push(stake);
    }

    function setStake(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _stakeId
    ) external {
        Stake storage stake = Stakes[_user][_token][_stakeId];

        stake.amount += _amount; // ? how can I send transfer the amount from the user? what about the previous amount?
    }

    function withdrawToken(
        address _token,
        uint256 _amount,
        address _destination
    ) external onlyOwner {
        Pool storage pool = Pools[_token];

        require(_amount > 0 && pool.totalPooled >= _amount);

        // withdraw the token to user wallet
        IERC20(_token).safeTransferFrom(address(this), _destination, _amount);

        // update the pooled amount
        pool.totalPooled -= _amount;
    }

    function withdrawMATIC() public payable onlyOwner {
        require(address(this).balance > 0, "no matic to withdraw");
        uint256 balance = address(this).balance;

        payable(msg.sender).transfer(balance);

        emit WithdrawMATIC(msg.sender, balance);
    }

    function setTimeLock(uint256 _duration) external onlyOwner {
        timelock = _duration;
    }
}
