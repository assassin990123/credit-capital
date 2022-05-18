// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TreasurySotrage
import "hardhat/console.sol";
import "../../interfaces/ITreasuryStorage.sol";

contract TreasuryController is AccessControl {
    using SafeERC20 for IERC20;

    // user Roles for RBAC
    bytes32 public constant OPERATOR_ROLE =
        keccak256("OPERATOR_ROLE");
    uint256 CAPL_PRECISION = 1e18;

    // all principal must go back to the treasury, profit stays here.
    ITreasuryStorage TreasuryStorage;
    address treasuryStorage;

    event Deposit(address indexed _token, address _user, uint256 _amount);
    event PoolUpdated(address indexed _token);
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

    event Borrow(address indexed _token, address indexed _user, uint256 _amount);

    constructor(address _treasuryStorage) {
        treasuryStorage = _treasuryStorage;

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
        @dev - Deposits tokens into the treasury, updating the AUM
     */
    function deposit(address _token, uint256 _amount)
        external
    {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        require(
            TreasuryStorage.checkIfPoolExists(_token),
            "Pool does not exist"
        );

        TreasuryStorage.deposit(msg.sender, _token, _amount);
        
        emit Deposit(_token, msg.sender, _amount);
    }

    /**
        @dev - Withdraws tokens from the treasury, updating the AUM
     */
    function withdraw(address _token, uint256 _amount)
        external
        onlyRole(OPERATOR_ROLE)
    {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        // check if the amount is under allowance
        require(
            TreasuryStorage.getAvailableBalance(_token) >= _amount,
            "Unable to withdraw more than available balance"
        );
        TreasuryStorage.withdraw(_token, msg.sender, _amount);

        emit Withdraw(_token, msg.sender, _amount);
    }

    /**
        @dev - Temporarily withdraws tokens from the treasury while still tracking the AUM
     */
    function borrow(address token, uint256 amount)
        external
        onlyRole(OPERATOR_ROLE)
    {
        // check if the amount is under allowance
        require(
            TreasuryStorage.getAvailableBalance(token) >= amount,
            "Unable to borrow more than available balance"
        );

        TreasuryStorage.borrow(token, msg.sender, amount);
        emit Borrow(token, msg.sender, amount);
    }

    /**
        @dev - This function sends the principal back to the treasury, leaving profit in the controller
             - The profit can be distributed by distriubuteRevenue()
     */
    function treasuryIncome(address _token, uint256 _principal, uint256 _profit)
        external 
    {
        // call the treasuryStorage's treasuryIncome function
        ITreasuryStorage(treasuryStorage).repay(
            msg.sender,
            _token,
            _principal
        );

        // the profit remains here
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _profit);
    }

    /**
        This function distributes its current token balance to the weighted distributionList 
        Each recipient address receives a weight between 1-10000 representing up to 100% with 2 degrees of precison
        Multiply the current contract balance by this weight, dividing by 10000 and transfer the resulting token amount

     */
    function distributeRevenue(address _token)
        external
    {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        // Contract balance to distribute
        uint contractBalance = IERC20(_token).balanceOf(address(this));

        // get length of the distributionList
        address[] memory distributionList = TreasuryStorage.getDistributionList();

        for(uint i; i < distributionList.length; i++) {
            address addr = distributionList[i];
            uint256 weight = TreasuryStorage.getWeight(addr);

            uint amount = contractBalance * weight / 10000;
            IERC20(_token).safeTransfer(addr, amount);

            emit DistributeTokenAlloc(_token, addr, amount);
        }
    }
    /**
        Manually updates the pool for a specific token in the case of mismatch.
    */
    function updatePool(address _token)
        public
        returns (IPool.Pool memory pool)
    {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);
        IPool.Pool memory npool = TreasuryStorage.updatePool(_token);

        emit PoolUpdated(_token);
        return npool;
    }

    /**
        ADMIN FUNCTIONS
    */

    /**
        Sets the address of the treasury storage contract
    */
    function setTreasuryStorage(address _destination)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        treasuryStorage = _destination;
    }

    /**
        Adds a new pool to the allowed token list
    */
    function addPool(address _token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        ITreasuryStorage(treasuryStorage).addPool(_token);
    }

}
