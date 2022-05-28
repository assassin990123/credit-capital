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
    bytes32 public constant ORACLE_SETTER = keccak256("ORACLE_SETTER");

    struct Pool {
        uint256 totalPooled; // loaned + actually in the contract
        uint256 loanedAmount; // loaned
        bool isActive; // determine if the pool exists
    }

    // pool tracking
    address[] poolAddresses;
    mapping(address => Pool) Pools; // token => pool
    mapping(address => uint256) PoolPrices;

    // token distribution addresses
    address[] distributionList;

    // track whitelisted user weight
    mapping(address => uint256) Weights;

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

    function getAvailableBalance(address _token)
        public
        view
        returns (uint256 availableBalance)
    {
        // get token balance of this contract
        uint256 balance = IERC20(_token).balanceOf(address(this));

        return balance;
    }

    function getPool(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    function getPoolTokenPrice(address _token)
        external
        view
        returns (uint256 price)
    {
        return PoolPrices[_token];
    }

    function getDistributionList() external view returns (address[] memory) {
        return distributionList;
    }

    function getWeight(address _addr) external view returns (uint256 weight) {
        return Weights[_addr];
    }

    /**
        This function returns the total AUM value
        This is the sum of each total token balance * the current token value
     */
    function getAUM() external view returns (uint256 total) {
        for (uint256 i; i < poolAddresses.length; i++) {
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
        // update Pool info
        Pool storage pool = Pools[_token];
        unchecked {
            pool.totalPooled += _amount;
        }
    }

    function withdraw(
        address _token,
        address _user,
        uint256 _amount
    ) external onlyRole(REVENUE_CONTROLLER) {
        require(
            getAvailableBalance(_token) >= _amount,
            "Withdrawn amount exceeds available balance"
        );

        // update Pool info
        Pool storage pool = Pools[_token];

        unchecked {
            pool.totalPooled -= _amount;
        }

        // transfer specified amount of tokens to the user
        IERC20(_token).safeTransfer(_user, _amount);
    }

    /**
        @dev - this function transfers _amount to the user and updates the user position to denote the loaned amount and change in contract balance.
     */
    function borrow(
        address _token,
        address _user,
        uint256 _amount
    ) external onlyRole(REVENUE_CONTROLLER) {
        require(
            getAvailableBalance(_token) >= _amount,
            "Borrow amount exceeds available balance"
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
    ) external {
        unchecked {
            Pools[_token].loanedAmount -= _principal;
        }

        // transfer token from the user
        IERC20(_token).safeTransferFrom(_user, address(this), _principal);
    }

    function addPool(address _token) external onlyRole(REVENUE_CONTROLLER) {
        require(!checkIfPoolExists(_token), "This pool already exists.");

        // get current contract balance
        uint256 balance = IERC20(_token).balanceOf(address(this));

        Pools[_token] = Pool({
            totalPooled: balance,
            loanedAmount: 0,
            isActive: true
        });

        // add pooladdress
        poolAddresses.push(_token);
    }

    /**
        In the case of manual token deposits, allows for recalculating the total AUM
    */
    function updatePool(address _token) external returns (Pool memory) {
        // get real amount of pooled
        Pool storage pool = Pools[_token];
        uint256 balance = IERC20(_token).balanceOf(address(this));

        unchecked {
            pool.totalPooled = (balance + pool.loanedAmount);
        }

        return pool;
    }

    // RBAC Oracle, price setter
    function setPoolTokenPrice(address _token, uint256 _price)
        external
        onlyRole(ORACLE_SETTER)
    {
        PoolPrices[_token] = _price;
    }

    function addDistributionList(address _addr)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            !distributionlistCheck(_addr),
            "DistributionList: Address already exists"
        );
        distributionList.push(_addr);
    }

    function distributionlistCheck(address _addr) internal view returns (bool) {
        for (uint256 i = 0; i < distributionList.length; i++) {
            if (distributionList[i] == _addr) {
                return true;
            }
        }
        return false;
    }

    function removeDistributionList(address _addr)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            distributionlistCheck(_addr),
            "DistributionList: Address does not exist"
        );

        // get index
        for (uint256 i = 0; i < distributionList.length; i++) {
            if (distributionList[i] == _addr) {
                distributionList[i] = distributionList[distributionList.length - 1];
                distributionList.pop();
            }
        }
    }

    /** 
    Sets the distribution weight for a specific address on the distribution list
    Weights must be set as an integer representing a percent with two degrees of precision
    Or more simply, a number between 1 and 10000. 10000 represents 100% of the pool.
    Weights for all addresses are *assumed* to add up to 10,000. Weights less than 10,000 will
    result in funds being left in the TreasuryController during distribution. Weights totaling more
    than 10,000 will result in the distribution failing due to insufficient balance.
    */
    function setWeight(address _addr, uint256 _weight)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        Weights[_addr] = _weight;
    }
}
