//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TreasuryStorage is AccessControl {
    using SafeERC20 for IERC20;

    struct UserPosition {
        uint256 totalAmount;
        uint256 rewardDebt;
        uint256 loanedAmount; // amount that has been taken out of the treasury storage as a loan
    }

    mapping(address => UserPosition) UserPositions;

    // treasury shares represent a users percentage amount in the treasury pot
    IERC20 treasuryShares;

    constructor(address _treasuryShares) {
        treasuryShares = IERC20(_treasuryShares);
    }

    /**
        @dev - this function will mint _amount of treasury shares from the treasuryShares ERC20 token
             - these shares will be held here, in this contract.
             - 100% share is assumed by one user.
     */
    function deposit(uint256 _amount) external {}

    function addUserPosition(address _token, uint256 _totalAmount) external {}

    /**
        @dev - this function transfers _amount to the user and updates the user position to denote the loaned amount and change in contract balance.
     */
    function loan(address _token, uint256 _amount) external {}

    function getTokenSupply(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
}
