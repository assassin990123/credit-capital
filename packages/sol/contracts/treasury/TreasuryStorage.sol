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
    bytes32 public constant REVENUE_CONTROLLER =
        keccak256("REVENUE_CONTROLLER");

    // tracking the total assets under the management (contract balance + outstanding(loanded, debt etc...))
    mapping(address => uint256) assetsUnderManagement;

    // treasury shares represent a users percentage amount in the treasury pot
    ITreasuryShares treasuryShares;

    struct UserPosition {
        uint256 totalAmount;
        uint256 loanedAmount; // amount that has been taken out of the treasury storage as a loan
        uint256 profit;
    }

    // Mapping from user to userpostion of the token
    mapping(address => mapping(address => UserPosition)) UserPositions; // user => (token => userposition)

    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        bool isActive; // determine if the pool exists
    }

    // pool tracking
    mapping(address => Pool) Pools; // token => pool

    constructor(address _treasuryShares) {
        treasuryShares = ITreasuryShares(_treasuryShares);

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        Read functions
     */
    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].isActive;
    }

    function checkIfUserPositionExists(address _user, address _token)
        public
        view
        returns (bool)
    {
        return UserPositions[_user][_token].totalAmount > 0;
    }

    function getUnlockedAmount(address _token, address _user)
        public
        view
        returns (uint256 unlockedAmount)
    {
        UserPosition memory userPosition = UserPositions[_user][_token];
        unchecked {
            unlockedAmount =
                userPosition.totalAmount -
                userPosition.loanedAmount;
        }
    }

    /**
        This function get the total amount of the access token that the storage has.
     */
    function getTokenSupply(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function getPool(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    function getUserPosition(address _token, address _user)
        public
        view
        returns (UserPosition memory)
    {
        return UserPositions[_user][_token];
    }

    function getAUM(address _token)
        external
        view
        returns (uint256)
    {
        return assetsUnderManagement[_token];
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

        if (!checkIfUserPositionExists(_user, _token)) {
            addUserPosition(_token, _user, _amount);
        } else {
            // update userPosition
            UserPosition storage userPosition = UserPositions[_user][_token];
            unchecked {
                userPosition.totalAmount += _amount;
            }
            
            // update the AUM amount
            assetsUnderManagement[_token] += _amount;
        }

        IERC20(_token).safeTransferFrom(_user, address(this), _amount);
    }

    function withdraw(
        address _token,
        address _user,
        uint256 _amount
    ) external {
        require(
            getUnlockedAmount(_token, _user) >= _amount,
            "Withdrawn amount exceed the allowance"
        );

        // update userPosition
        UserPosition storage userPosition = UserPositions[_user][_token];
        unchecked {
            userPosition.totalAmount -= _amount;
        }

        // update Pool info
        Pool storage pool = Pools[_token];
        unchecked {
            pool.totalPooled -= _amount;
        }

        // update the AUM
        assetsUnderManagement[_token] -= _amount;

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
            getUnlockedAmount(_token, _user) >= _amount,
            "The amount exceed the treasury balance."
        );

        // update user state
        UserPosition storage userPosition = UserPositions[_user][_token];
        unchecked {
            userPosition.loanedAmount += _amount;
        }
        // userPosition.totalAmount -= _amount;

        // update the total amount of the access token pooled
        unchecked {
            Pools[_token].totalPooled -= _amount;
        }

        IERC20(_token).safeTransfer(_user, _amount);
    }

    function returnPrincipal(
        address _user,
        address _token,
        uint256 _principal
    ) external onlyRole(REVENUE_CONTROLLER) {
        // get the userposition
        UserPosition storage userPosition = UserPositions[_user][_token];
        unchecked {
            userPosition.loanedAmount -= _principal;
        }
        // userPosition.totalAmount += _principal;

        // transfer token from the user
        IERC20(_token).safeTransferFrom(_user, address(this), _principal);
    }

    function addUserPosition(
        address _token,
        address _user,
        uint256 _totalAmount
    ) internal {
        UserPositions[_user][_token] = UserPosition({
            totalAmount: _totalAmount,
            loanedAmount: 0,
            profit: 0
        });

        // update the AUM amount
        assetsUnderManagement[_token] += _totalAmount;

    }

    function setUserPosition(
        address _token,
        address _user,
        uint256 _profit
    ) external onlyRole(REVENUE_CONTROLLER) {
        UserPosition storage userPosition = UserPositions[_user][_token];

        unchecked {
            userPosition.profit += _profit;
        }
        unchecked {
            userPosition.totalAmount += _profit;
        }

        // update the AUM
        assetsUnderManagement[_token] += _profit;
    }

    function addPool(address _token) external onlyRole(REVENUE_CONTROLLER) {
        require(!checkIfPoolExists(_token), "This pool already exists.");

        Pools[_token] = Pool({totalPooled: 0, isActive: true});
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

    function mintTreasuryShares(address _destination, uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        treasuryShares.mint(_destination, _amount);
    }
}
