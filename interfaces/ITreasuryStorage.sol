// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 rewardsPerBlock; // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare; // weighted CAPL share in pool
        uint256 lastRewardBlock; // last time a claim was made
    }
}

interface ITreasuryStorage {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 rewardsPerBlock; // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare; // weighted CAPL share in pool
        uint256 lastRewardBlock; // last time a claim was made
    }

    function deposit(
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function updatePool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardBlock
    ) external returns (IPool.Pool memory);

    function addUserPosition(
        address _token,
        address _user,
        uint256 _totalAmount,
        uint256 _rewardDebt
    ) external;

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function loan(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function returnPrincipal(
        address _user,
        address _token,
        uint256 _principal
    ) external;

    function getTokenSupply(
        address _token
    ) external returns (uint256);

    function checkIfUserPositionExists(
        address _user,
        address _token
    ) external returns(bool);

    function getPool(
        address _token
    ) external returns (IPool.Pool memory);

    function checkIfPoolExists(
        address _token
    ) external returns (bool);
}