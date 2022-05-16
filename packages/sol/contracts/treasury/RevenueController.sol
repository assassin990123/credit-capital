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

    // treasury storage contract, similar to the vault contract.
    // all principal must go back to the treasury, profit stays here.
    ITreasuryStorage TreasuryStorage;
    address treasuryStorage;

    // token distribution addresses
    address[] distributionList;

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

    event Borrow(address indexed _token, address indexed _user, uint256 _amount);

    constructor(address _treasuryStorage) {
        treasuryStorage = _treasuryStorage;

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(OPERATOR_ROLE, msg.sender);
    }

    /** DistributionList */
    function getDistributionList() public view returns (address[] memory) {
        return distributionList;
    }
    
    function addDistributionList(address _user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!distributionlistCheck(_user), "DistributionList: existing user");
        distributionList.push(_user);
    }
    
    function distributionlistCheck(address _user) internal view returns (bool) {
        for (uint i = 0; i < distributionList.length; i++) {
            if (distributionList[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function removeDistributionListedUser(address _user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(distributionlistCheck(_user), "DistributionList: not existing user");

        // get index
        for (uint i = 0; i < distributionList.length; i++) {
            if (distributionList[i] == _user) {
                delete distributionList[i];
            }
        }
    }

    /** Weight */
    function getWeight(address _user) public view returns (uint256 weight) {
        return Weights[_user];
    }

    function setWeight(address _user, uint256 _weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Weights[_user] = _weight;
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
        @dev - this function sends the principal back to the storage contract via a function called treasuryStorage.treasuryIncome (to be implemented).
             - the profit remains in the revenue controller contract to be distributed by splitter function below.
     */
    function treasuryIncome(
        address _token,
        uint256 _principal,
        uint256 _profit
    ) external {
        // call the treasuryStorage's treasuryIncome function
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
    function withdraw(address _token) external onlyRole(OPERATOR_ROLE) {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        uint256 amount = TreasuryStorage.getUnlockedAmount(_token);
        TreasuryStorage.withdraw(_token, msg.sender, amount);

        emit Withdraw(_token, msg.sender, amount);
    }

    function borrow(address token, uint256 amount) external {
        // check if the amount is under allowance
        require(
            TreasuryStorage.getUnlockedAmount(token) >= amount,
            "Can not borrow over unlocked amount"
        );

        TreasuryStorage.loan(token, msg.sender, amount);
        emit Borrow(token, msg.sender, amount);
    }

    /**
        This function returns the allocAmount calculated to distribute to the treasury storage
     */
    function splitter(address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        // Contract balance to distribute
        uint contractBalance = IERC20(_token).balanceOf(address(this));

        for(uint i; i < distributionList.length; i++) {
            address user = distributionList[i];
            uint256 weight = Weights[user];

            uint sharedAmount = (contractBalance / CAPL_PRECISION) * weight;
            IERC20(_token).safeTransfer(user, sharedAmount);

            emit DistributeTokenAlloc(_token, user, sharedAmount);
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
