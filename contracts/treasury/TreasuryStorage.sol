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

    // treasury shares represent a users percentage amount in the treasury pot
    ITreasuryShares treasuryShares;
    
    struct UserPosition {
        uint256 totalAmount;
        uint256 rewardDebt;
        uint256 loanedAmount; // amount that has been taken out of the treasury storage as a loan
    }

    // Mapping from user to userpostion of the token
    mapping(address => mapping(address => UserPosition)) UserPositions;

    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 rewardsPerBlock; // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare; // weighted CAPL share in pool
        uint256 lastRewardBlock; // last time a claim was made
    }

    // pool tracking
    mapping(address => Pool) Pools; // token => pool

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
        uint256 _amount,
        uint256 _rewardDebt
    ) external {
        if (this.checkIfUserPositionExists(_user, address(treasuryShares))) {
            this.addUserPosition(
                address(treasuryShares),
                _user,
                _amount,
                _rewardDebt
            );
        } else {
            this.setUserPosition(
                address(treasuryShares),
                _user,
                _amount,
                _rewardDebt
            );
        }

        // assume that the treasuryShares token overrides the mint function
        treasuryShares.mint(address(this), _amount);
    }

    function updatePool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardBlock
    ) external returns (Pool memory) {
        Pools[_token].lastRewardBlock = _lastRewardBlock;
        Pools[_token].accCaplPerShare = _accCaplPerShare;

        return Pools[_token];
    }

    function addUserPosition(
        address _token,
        address _user,
        uint256 _totalAmount,
        uint256 _rewardDebt
    ) external {
        require(
            !this.checkIfUserPositionExists(_user, _token),
            "The user position is already exists"
        );

        UserPositions[_user][_token] = UserPosition({
            totalAmount: _totalAmount,
            rewardDebt: _rewardDebt,
            loanedAmount: 0
        });
    }

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external {
        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.totalAmount += _amount;
        userPosition.rewardDebt = _rewardDebt;
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

    function returnPrincipal(
        address _user,
        address _token,
        uint256 _principal
    ) external {
        UserPosition storage userPosition = UserPositions[_user][_token];
        userPosition.loanedAmount -= _principal;
        userPosition.totalAmount += _principal;

        IERC20(_token).safeTransferFrom(_user, address(this), _principal);
    }

    function getTokenSupply(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function getPool(address _token) external view returns (Pool memory) {
        require(this.checkIfPoolExists(_token), "The pool does not exists.");

        return Pools[_token];
    }

    function getUserPosition(address _token, address _user)
        external
        view
        returns (UserPosition memory)
    {
        return UserPositions[_user][_token];
    }

    function checkIfPoolExists(address _token) external view returns (bool) {
        return Pools[_token].rewardsPerBlock > 0;
    }

    function checkIfUserPositionExists(address _user, address _token)
        external
        view
        returns (bool)
    {
        return UserPositions[_user][_token].totalAmount > 0;
    }
}
