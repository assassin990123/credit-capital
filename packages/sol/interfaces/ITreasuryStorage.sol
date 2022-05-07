// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
    }
}

interface ILoanPositions {
    struct LoanPosition {
        uint256 loanedAmount; // amount that has been taken out of the treasury storage as a loan
    }
}

interface ITreasuryStorage {
    function deposit(
        address _user,
        address _token,
        uint256 _amount
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

    function getUnlockedAmount(address _token)
        external
        view
        returns (uint256);

    
    function checkIfPoolExists(address _token) external returns (bool);
}
