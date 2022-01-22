// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TreasurySotrage
import "../../interfaces/ITreasuryStorage.sol";

contract RevenueController is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 capl;
    // treasury storage contract, similar to the vault contract.
    // all principal must go back to the treasury, profit stays here.
    address treasuryStorage;
    // treasury fund is similar to the rewards contract, it manages the logic of the treasury.
    address treasuryFund;

    constructor(
        address _capl,
        address _treasuryStorage,
        address _treasuryFund
    ) {
        capl = IERC20(_capl);
        treasuryStorage = _treasuryStorage;
        treasuryFund = _treasuryFund;
    }

    /**
        @dev - this function sends the principal back to the storage contract via a function called treasuryStorage.returnPrincipal (to be implemented).
             - the profit remains in the revenue controller contract to be distributed by getCAPLAlloc function below.
     */
    function treasuryIncome(
        address _token,
        uint256 _principal,
        uint256 _profit
    ) external {
        // call the treasuryStorage's returnPrincipal function
        ITreasuryStorage(treasuryStorage).returnPrincipal(
            msg.sender,
            _token,
            _principal
        );
        IERC20(_token).safeTransfer(address(this), _profit);
    }

    /**
        @dev - this function calculates the amount of CAPL to distribute to the treasury fund contract:
             -  current CAPL balance / 30 days = transfer amount.
     */
    function getCAPLAlloc() external {}

    /**
        ADMIN FUNCTIONS
        TODO: Add RBAC @dev
    */

    function setTreasuryStorage(address _destination) external {
        treasuryStorage = _destination;
    }

    function setTreasuryFund(address _destination) external {
        treasuryFund = _destination;
    }
}
