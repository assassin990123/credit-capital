//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TreasuryStorage is AccessControl {
    using SafeERC20 for IERC20;

    // user Roles for RBAC
    bytes32 public constant REVENUE_CONTROLLER =
        keccak256("REVENUE_CONTROLLER");

    struct Pool {
        uint256 totalPooled; // loaned + actually in the contract
        uint256 loanedAmount; // loaned
        bool isActive; // determine if the pool exists
    }

    // pool tracking
    address[] poolAddresses;
    mapping(address => Pool) Pools; // token => pool
    mapping(address => uint) PoolPrices;

    // token distribution addresses
    address[] distributionList;

    // track whitelisted user weight
    mapping(address => uint) Weights;

    constructor() {
        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        Getters
     */
    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].isActive;
    }

    function getUnlockedAmount(address _token)
        public
        view
        returns (uint256 unlockedAmount)
    {
        // get token balance of this contract
        uint balance = IERC20(_token).balanceOf(address(this));

        return balance;
    }

    function getPool(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    function getPoolTokenPrice(address _token) external view returns (uint256 price) {
        return PoolPrices[_token];
    }

    function getDistributionList() external view returns (address[] memory) {
        return distributionList;
    }
    
    function getWeight(address _user) external view returns (uint256 weight) {
        return Weights[_user];
    }
    
    /**
        This function get the total amount of the access token under management.
     */
    function getAUM() external view returns (uint256 total) {
        for(uint i; i < poolAddresses.length; i++) {
            address token = poolAddresses[i];
            total += Pools[token].totalPooled * PoolPrices[token];
        }
    }

    /**
        Write functions
     */
    function deposit(
        address _user,
        address _token,
        uint256 _amount
    ) external {
        require(checkIfPoolExists(_token), "Pool does not exist");
        IERC20(_token).safeTransferFrom(_user, address(this), _amount);
    }

    function withdraw(
        address _token,
        address _user,
        uint256 _amount
    ) external onlyRole(REVENUE_CONTROLLER) {
        require(
            getUnlockedAmount(_token) >= _amount,
            "Withdrawn amount exceed the allowance"
        );

        // update Pool info
        Pool storage pool = Pools[_token];
        uint balance = IERC20(_token).balanceOf(address(this));

        unchecked {
            pool.totalPooled = (balance + pool.loanedAmount) - _amount;
        }

        // transfer access token amount to the user
        IERC20(_token).safeTransfer(_user, _amount);
    }

    /**
        @dev - this function transfers _amount to the user and updates the user position to denote the loaned amount and change in contract balance.
     */
    function borrow(
        address _token,
        address _user,
        uint256 _amount
    ) external {
        require(
            getUnlockedAmount(_token) >= _amount,
            "The amount exceed the treasury balance."
        );

        // update the total amount of the access token pooled
        unchecked {
            Pools[_token].loanedAmount += _amount;
        }

        IERC20(_token).safeTransfer(_user, _amount);
    }

    function repay(
        address _user,
        address _token,
        uint256 _principal
    ) external onlyRole(REVENUE_CONTROLLER) {
        unchecked {
            Pools[_token].loanedAmount -= _principal;
        }

        // transfer token from the user
        IERC20(_token).safeTransferFrom(_user, address(this), _principal);
    }

    function addPool(address _token) external onlyRole(REVENUE_CONTROLLER) {
        require(!checkIfPoolExists(_token), "This pool already exists.");

        // get current contract balance
        uint balance = IERC20(_token).balanceOf(address(this));

        Pools[_token] = Pool({
            totalPooled: balance,
            loanedAmount: 0,
            isActive: true
        });

        // add pooladdress
        poolAddresses.push(_token);
    }

    function updatePool(address _token, uint256 _amount)
        external
        onlyRole(REVENUE_CONTROLLER)
        returns (Pool memory)
    {
        // get real amount of pooled
        Pool storage pool = Pools[_token];
        uint balance = IERC20(_token).balanceOf(address(this));

        unchecked {
            pool.totalPooled = (balance + pool.loanedAmount) + _amount;
        }

        return pool;
    }

    // RBAC Oracle, price setter (getter needed as well, not included here)
    function setPoolTokenPrice(address _token, uint _price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        PoolPrices[_token] = _price;
    }
}
