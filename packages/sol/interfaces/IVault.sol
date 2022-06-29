// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IVault {
    function addPool(address _token, uint256 _rewardsPerSecond) external;

    function addPoolPosition(address _token, uint256 _amount) external;

    function removePoolPosition(address _token, uint256 _amount) external;

    function checkIfPoolExists(address _token) external view returns (bool);

    function updatePool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardTime
    ) external returns (IPool.Pool memory);

    function getPool(address _token) external returns (IPool.Pool memory);

    function checkIfUserPositionExists(address _token, address _user)
        external
        view
        returns (bool);

    /* update */
    function addUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function getUserPosition(address _token, address _user)
        external
        returns (IUserPositions.UserPosition memory);

    function setUserDebt(
        address _token,
        address _user,
        uint256 rewardDebt
    ) external;

    /* update */
    function getUnlockedAmount(address _token, address _user)
        external
        returns (uint256);

    function addStake(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function getLastStake(address _token, address _user)
        external
        returns (IStake.Stake memory);

    /* update */
    function setStake(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _stakeId
    ) external;

    function getLastStakeKey(address _token, address _user)
        external
        returns (uint256);

    function getTokenSupply(address _token) external returns (uint256);

    function withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _newRewardDebt
    ) external;
}

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 rewardsPerSecond; // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare; // weighted CAPL share in pool
        uint256 lastRewardTime; // last time a claim was made
    }
}

interface IUserPositions {
    struct UserPosition {
        uint256 totalAmount; // total value staked by user in given pool
        uint256 rewardDebt; // house fee (?)
        uint256 userLastWithdrawnStakeIndex; // track the last unlocked index for each user's position in a pool, so that withdrawal iteration is less expensive
        bool staticLock; // guarantees a users stake is locked, even after timelock expiration
        bool autocompounding; // this userposition enables auto compounding (Auto restaking the rewards)
        IStake.Stake[] stakes; // list of user stakes in pool subject to timelock
    }
}

interface IStake {
    struct Stake {
        uint256 amount; // quantity staked
        uint256 startTime; // stake creation timestamp
        uint256 timeLockEnd; // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
        bool active; // true = stake in vault, false = user withdrawn stake
    }
}
