// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
    }
}

interface ITreasuryStorage {
    function deposit(
        address _user,
        address _token,
        uint256 _amount
    ) external;

    function addPool(address _token) external;

    function updatePool(address _token) external returns (IPool.Pool memory);

    function borrow(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function withdraw(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function repay(
        address _user,
        address _token,
        uint256 _principal
    ) external;

    function getAvailableBalance(address _token)
        external
        view
        returns (uint256);

    function getDistributionList() external view returns (address[] memory);

    function getWeight(address _user) external view returns (uint256 weight);

    function checkIfPoolExists(address _token) external returns (bool);
}
