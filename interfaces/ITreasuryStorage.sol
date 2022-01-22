// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface ITreasuryStorage {
    function deposit(
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

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
    ) external;

    function checkIfUserPositionExists(
        address _user,
        address _token
    ) external returns(bool);
}