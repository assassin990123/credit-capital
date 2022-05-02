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

    // treasury storage contract, similar to the vault contract.
    // all principal must go back to the treasury, profit stays here.
    ITreasuryStorage TreasuryStorage;
    address treasuryStorage;

    uint256 CAPL_PRECISION = 1e18;

    // track user weight
    mapping(address => uint) Weights;

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

    constructor(address _treasuryStorage) {
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
             - the profit remains in the revenue controller contract to be distributed by splitter function below.
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

        // the profit remains here
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _profit);
    }

    /**
        @dev - this funciton withdraws a token amount from the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function withdraw(address _token) external {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        uint256 amount = TreasuryStorage.getUnlockedAmount(_token);
        TreasuryStorage.withdraw(_token, msg.sender, amount);

        emit Withdraw(_token, msg.sender, amount);
    }

    function loan(address token, uint256 amount) external {
        // check if the amount is under allowance
        require(
            TreasuryStorage.getUnlockedAmount(token) >= amount,
            "Can not loan over unlocked amount"
        );

        TreasuryStorage.loan(token, msg.sender, amount);
        emit Loan(token, msg.sender, amount);
    }

    /**
        This function returns the allocAmount calculated to distribute to the treasury storage
     */
    function splitter(address _token, uint _profit) external onlyRole(DEFAULT_ADMIN_ROLE) {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        // get length of the whitelist
        address[] memory whitelist = TreasuryStorage.getWhitelist();

        for(uint i; i < whitelist.length; i++) {
            address user = whitelist[i];
            uint256 weight = TreasuryStorage.getWeight(user);

            uint sharedProfit = (_profit / CAPL_PRECISION) * weight;
            console.log('sharedProfit', sharedProfit);
            IERC20(_token).safeTransfer(user, sharedProfit);

            emit DistributeTokenAlloc(_token, user, sharedProfit);
        }
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
