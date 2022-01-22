// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TreasurySotrage
import "../../interfaces/ITreasuryStorage.sol";

contract TreasuryFund is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 capl;

    // tokens allowed to be deposited into the treasury, must be updatable
    address[] accessTokens;
    // see revenue controller contract for explanation on interaction
    address revenueController;
    // treasury storage, TBD, will eventually interface similar to the vault in the rewards contract
    address treasuryStorage;

    event Deposit(address _token, address _user, uint256 _amount);

    constructor(address _capl, address _treasuryStorage) {
        capl = IERC20(_capl);
        treasuryStorage = _treasuryStorage;
    }

    /**
        @dev - this function deposits eligible token amounts to the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function deposit(address _token, uint256 _amount, uint256 _rewardDebt) external {
        ITreasuryStorage TreasuryStorage = ITreasuryStorage(treasuryStorage);

        if (TreasuryStorage.checkIfUserPositionExists(msg.sender, _token)) {
            TreasuryStorage.addUserPosition(
                _token,
                msg.sender,
                _amount,
                _rewardDebt
            );
        } else {
            TreasuryStorage.setUserPosition(
                _token,
                msg.sender,
                _amount,
                _rewardDebt
            );
        }

        IERC20(_token).safeTransfer(treasuryStorage, _amount);
        emit Deposit(_token, msg.sender, _amount);
    }

    /**
        @dev - this funciton withdraws a token amount from the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function withdraw(address _token, uint256 _amount) external {
        
    }

    /**
        @dev - this function reads this contracts CAPL balance, and then (similar to rewards), calculates the pending revenue based on revenue share weight.
             - user treasury share percentage * contract CAPL balance = pending revenue
             - almost exact logic same as rewards 
     */
    function pendingRevenue() external {}

    /**
        @dev - claim revenue, similar to rewards contract, will calculate the pending rewards and then safeTransfer from here, to the user.
             - almost exact logic same as rewards
      */
    function claimRevenue() external {}

    /**
        @dev - this function gets the total amount of access tokens in the treasury storage.
             - then, the liquidity pool is read (CAPL-USDC) and a USD value is determined.
     */
    function getTotalManagedValue() external {}

    /**
        ADMIN FUNCTIONS
        TODO: Add RBAC @dev
    */
    function setRevenueController(address _destination) external {
        revenueController = _destination;
    }
}
