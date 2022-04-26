// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
    }
}

interface IUserPositions {
    struct UserPosition {
        uint256 totalAmount;
        uint256 loanedAmount; // amount that has been taken out of the treasury storage as a loan
        uint256 profit;
    }
}

interface ITreasuryStorage {
    function deposit(
        address _user,
        address _token,
        uint256 _amount
    ) external;

    function setUserPosition(
        address _token,
        address _user,
        uint256 _profit
    ) external;

    function addPool(address _token) external;

    function updatePool(address _token, uint256 _allocAmount)
        external
        returns (IPool.Pool memory);

    function loan(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function withdraw(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function returnPrincipal(
        address _user,
        address _token,
        uint256 _principal
    ) external;

    function getTokenSupply(address _token) external returns (uint256);

    function getPool(address _token) external returns (IPool.Pool memory);

    function getUserPosition(address _token, address _user)
        external
        view
        returns (IUserPositions.UserPosition memory);

    function getUnlockedAmount(address _token, address _user)
        external
        view
        returns (uint256);

    function checkIfPoolExists(address _token) external returns (bool);
}
