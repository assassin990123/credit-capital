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

    struct LoanPosition {
        uint256 loanAmount; // amount that has been taken out of the treasury storage as a loan
    }

    // Mapping from user to loanpostion of the token
    mapping(address => mapping(address => LoanPosition)) LoanPositions; // user => (token => loanposition)

    struct Pool {
        uint256 totalPooled; // loaned + actually in the contract
        uint256 loanedAmount; // loaned
        bool isActive; // determine if the pool exists
    }

    address[] poolAddresses;

    // pool tracking
    mapping(address => Pool) Pools; // token => pool
    mapping(address => uint) PoolPrices;

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
        Pool memory pool = Pools[_token];
        return pool.totalPooled - pool.loanedAmount;
    }

    function getPool(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    function getLoanPosition(address _token, address _user) external view returns (LoanPosition memory) {
        return LoanPositions[_user][_token];
    }

    function getPoolTokenPrice(address _token) external view returns (uint256 price) {
        return PoolPrices[_token];
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

        // update Pool info
        Pool storage pool = Pools[_token];
        unchecked {
            pool.totalPooled += _amount;
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
        unchecked {
            pool.totalPooled -= _amount;
        }

        // transfer access token amount to the user
        IERC20(_token).safeTransfer(_user, _amount);
    }

    /**
        @dev - this function transfers _amount to the user and updates the user position to denote the loaned amount and change in contract balance.
     */
    function loan(
        address _token,
        address _user,
        uint256 _amount
    ) external {
        require(
            getUnlockedAmount(_token) >= _amount,
            "The amount exceed the treasury balance."
        );

        // update user state
        LoanPosition storage loanPosition = LoanPositions[_user][_token];
        unchecked {
            loanPosition.loanAmount += _amount;
        }

        // update the total amount of the access token pooled
        unchecked {
            Pools[_token].loanedAmount += _amount;
        }

        IERC20(_token).safeTransfer(_user, _amount);
    }

    function returnPrincipal(
        address _user,
        address _token,
        uint256 _principal
    ) external onlyRole(REVENUE_CONTROLLER) {
        // get the loanposition
        LoanPosition storage loanPosition = LoanPositions[_user][_token];
        unchecked {
            loanPosition.loanAmount -= _principal;
        }

        unchecked {
            Pools[_token].loanedAmount -= _principal;
        }

        // transfer token from the user
        IERC20(_token).safeTransferFrom(_user, address(this), _principal);
    }

    function addPool(address _token) external onlyRole(REVENUE_CONTROLLER) {
        require(!checkIfPoolExists(_token), "This pool already exists.");

        Pools[_token] = Pool({
            totalPooled: 0,
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
        Pool storage pool = Pools[_token];
        unchecked {
            pool.totalPooled += _amount;
        }

        return pool;
    }

    // RBAC Oracle, price setter (getter needed as well, not included here)
    function setPoolTokenPrice(address _token, uint _price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        PoolPrices[_token] = _price;
    }
}
