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
    bytes32 public constant REVENUE_CONTROLLER =
        keccak256("REVENUE_CONTROLLER");

    // treasury shares represent a users percentage amount in the treasury pot
    ITreasuryShares treasuryShares;

    struct UserPosition {
        uint256 totalAmount;
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

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        @dev - this function will mint _amount of treasury shares from the treasuryShares ERC20 token
             - these shares will be held here, in this contract.
             - 100% share is assumed by one user.
     */
    function deposit(address _user, uint256 _amount) external {
        if (this.checkIfUserPositionExists(_user, address(treasuryShares))) {
            this.addUserPosition(address(treasuryShares), _user, _amount);
        } else {
            this.setUserPosition(address(treasuryShares), _user, _amount);
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

    function withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _newRewardDebt
    ) external {
        require(
            getUnlockedAmount(_token, _user) > _amount,
            "Withdrawn amount exceed the user balance"
        );

        this.setUserPosition(_token, _user, _amount);

        Pool storage pool = Pools[_token];
        pool.totalPooled -= _amount;

        IERC20(_token).safeTransferFrom(address(this), _user, _amount);
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

    function mintTreasuryShares(address _destination, uint256 _amount)
        external
        onlyRole(TREASURY_FUND)
    {
        treasuryShares.mint(_destination, _amount);
    }

    function getUnlockedAmount(address _token, address _user)
        public
        view
        onlyRole(TREASURY_FUND)
        returns (uint256 unlockedAmount)
    {
        UserPosition storage userPosition = UserPositions[_user][_token];
        unlockedAmount = userPosition.totalAmount - userPosition.loanedAmount;
    }
}
