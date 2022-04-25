// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TreasurySotrage
import "hardhat/console.sol";
import "../../interfaces/ITreasuryStorage.sol";

contract RevenueController is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 capl;

    ITreasuryStorage TreasuryStorage;
    // treasury storage contract, similar to the vault contract.
    // all principal must go back to the treasury, profit stays here.
    address treasuryStorage;

    event Deposit(address indexed _token, address _user, uint256 _amount);
    event PoolUpdated(address indexed _token, uint256 _amount);
    event PoolAdded(address indexed _token);
    event DistributeTokenAlloc(
        address indexed _token,
        address indexed _user,
        uint256 _amount
    );
    event Withdraw(
        address indexed _token,
        address indexed _user,
        uint256 _amount
    );

    event Loan(address indexed _token, address indexed _user, uint256 _amount);

    constructor(address _capl, address _treasuryStorage) {
        capl = IERC20(_capl);
        treasuryStorage = _treasuryStorage;

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        @dev - this function deposits eligible token amounts to the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function deposit(address _token, uint256 _amount) external {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        require(
            TreasuryStorage.checkIfPoolExists(_token),
            "Pool does not exist"
        );

        // update pool to current block
        updatePool(_token, _amount);

        TreasuryStorage.deposit(msg.sender, _token, _amount);
        emit Deposit(_token, msg.sender, _amount);
    }

    function addPool(address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ITreasuryStorage(treasuryStorage).addPool(_token);
    }

    function updatePool(address _token, uint256 _amount)
        internal
        returns (IPool.Pool memory pool)
    {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);
        IPool.Pool memory npool = TreasuryStorage.updatePool(_token, _amount);

        emit PoolUpdated(_token, _amount);
        return npool;
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
        // update pool info
        ITreasuryStorage(treasuryStorage).updatePool(_token, _principal);

        // call the treasuryStorage's returnPrincipal function
        ITreasuryStorage(treasuryStorage).returnPrincipal(
            msg.sender,
            _token,
            _principal
        );

        // // set the last distribution block
        // // update user state(in this case - the profit) in the storage
        // ITreasuryStorage(treasuryStorage).setUserPosition(
        //     _token,
        //     msg.sender,
        //     0
        // );

        // the profit remains here
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _profit);
    }

    /**
        @dev - this funciton withdraws a token amount from the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function withdraw(address _token) external {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        uint256 amount = TreasuryStorage.getUnlockedAmount(_token, msg.sender);
        TreasuryStorage.withdraw(_token, msg.sender, amount);

        emit Withdraw(_token, msg.sender, amount);
    }

    function loan(address token, uint256 amount) external {
        // check if the amount is under allowance
        require(
            TreasuryStorage.getUnlockedAmount(token, msg.sender) >= amount,
            "Can not loan over unlocked amount"
        );

        TreasuryStorage.loan(token, msg.sender, amount);
        emit Loan(token, msg.sender, amount);
    }

    /**
        @dev - this function calculates the amount of access token to distribute to the treasury storage contract:
             -  current access token balance / blocksPerDay * 30 days = transfer amount.
     */
    function getTokenAlloc(address _token) public view returns (uint256 allocAmount) {
        // get the access token profit
        uint256 profit = IERC20(_token).balanceOf(address(this));

        if (profit == 0) {
            return 0;
        }

        // get the total amount the assets (total amount in the contract + outstanding amount)
        uint256 assetsUnderManagement = ITreasuryStorage(treasuryStorage).getAUM(_token);

        // get the user position
        IUserPositions.UserPosition memory userPosition = ITreasuryStorage(
            treasuryStorage
        ).getUserPosition(_token, msg.sender);

        // get user weight count for calcualtion of distribution
        uint256 allocPerShare = userPosition.totalAmount / assetsUnderManagement;

        // get total amount to distribute
        allocAmount = profit * allocPerShare;
    }

    /**
        This function returns the allocAmount calculated to distribute to the treasury storage
     */
    function distributeTokenAlloc(address _token) external {
        uint256 allocAmount = getTokenAlloc(_token);

        // update user state(in this case - the profit) in the storage
        ITreasuryStorage(treasuryStorage).setUserPosition(
            _token,
            msg.sender,
            allocAmount
        );

        // update the pool state
        ITreasuryStorage(treasuryStorage).updatePool(_token, allocAmount);

        // get the distributable access token amount
        IERC20(_token).safeTransfer(treasuryStorage, allocAmount);

        emit DistributeTokenAlloc(_token, msg.sender, allocAmount);
    }

    function getTotalManagedValue(address _token)
        external
        returns (uint256 totalManagedValue)
    {
        totalManagedValue = ITreasuryStorage(treasuryStorage).getTokenSupply(
            _token
        );
    }

    /**
        ADMIN FUNCTIONS
        TODO: Add RBAC @dev
    */

    function setTreasuryStorage(address _destination)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        treasuryStorage = _destination;
    }
}
