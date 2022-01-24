//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ITreasuryShares {
    function mint(address _to, uint256 _amount) external;
}

contract TreasuryStorage is AccessControl {
    using SafeERC20 for IERC20;

    // user Roles for RBAC
    bytes32 public constant TREASURY_FUND = keccak256("TREASURY_FUND");

    struct UserPosition {
        uint256 totalAmount;
        uint256 loanedAmount; // amount that has been taken out of the treasury storage as a loan
    }

    // Mapping from user to userpostion of the token
    mapping(address => mapping(address => UserPosition)) UserPositions;

    // treasury shares represent a users percentage amount in the treasury pot
    ITreasuryShares treasuryShares;

    constructor(address _treasuryShares) {
        treasuryShares = ITreasuryShares(_treasuryShares);
    }
    /**
        @dev - this function will mint _amount of treasury shares from the treasuryShares ERC20 token
             - these shares will be held here, in this contract.
             - 100% share is assumed by one user.
     */
    function deposit(
        address _user,
        uint256 _amount
    ) external {
        if (this.checkIfUserPositionExists(_user, address(treasuryShares))) {
            this.addUserPosition(
                address(treasuryShares),
                _user,
                _amount
            );
        } else {
            this.setUserPosition(
                address(treasuryShares),
                _user,
                _amount
            );
        }
    }

    function addUserPosition(
        address _token,
        address _user,
        uint256 _totalAmount
    ) external onlyRole(TREASURY_FUND) {
        require(
            !this.checkIfUserPositionExists(_user, _token),
            "The user position is already exists"
        );

        UserPositions[_user][_token] = UserPosition({
            totalAmount: _totalAmount,
            loanedAmount: 0
        });
    }

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount
    ) external onlyRole(TREASURY_FUND) {
        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.totalAmount += _amount;
    }

    /**
        @dev - this function transfers _amount to the user and updates the user position to denote the loaned amount and change in contract balance.
     */
    function loan(
        address _token,
        address _user,
        uint256 _amount
    ) external onlyRole(TREASURY_FUND) {
        require(
            IERC20(_token).balanceOf(address(this)) > _amount,
            "The amount exceed the treasury balance."
        );

        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.loanedAmount += _amount;

        IERC20(_token).safeTransferFrom(address(this), _user, _amount);
    }

    function getTokenSupply(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function checkIfUserPositionExists(address _user, address _token)
        external
        view
        returns (bool)
    {
        return UserPositions[_user][_token].totalAmount > 0;
    }

    function mintTreasuryShares(address _destination, uint256 _amount) external onlyRole(TREASURY_FUND) {
        treasuryShares.mint(_destination, _amount);
    }
}
