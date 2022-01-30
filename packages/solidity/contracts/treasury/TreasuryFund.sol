// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TreasurySotrage
import "../../interfaces/ITreasuryStorage.sol";
import "../../interfaces/IController.sol";

contract TreasuryFund is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 capl;
    uint256 CAPL_PRECISION = 1e18;

    IController controller;
    ITreasuryStorage TreasuryStorage;

    // tokens allowed to be deposited into the treasury, must be updatable
    address[] accessTokens;
    // see revenue controller contract for explanation on interaction
    address revenueController;
    // treasury storage, TBD, will eventually interface similar to the vault in the rewards contract
    address treasuryStorage;

    event Deposit(address _token, address _user, uint256 _amount);
    event PoolUpdated(address indexed _token, uint256 _block);
    event Claim(address indexed _token, address indexed _user, uint256 _amount);
    event Withdraw(
        address indexed _token,
        address indexed _user,
        uint256 _amount
    );

    constructor(address _capl, address _treasuryStorage) {
        capl = IERC20(_capl);
        treasuryStorage = _treasuryStorage;
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
        IPool.Pool memory pool = updatePool(_token);

        uint256 _rewardDebt = (_amount * pool.accCaplPerShare) / CAPL_PRECISION;

        if (TreasuryStorage.checkIfUserPositionExists(msg.sender, _token)) {
            TreasuryStorage.addUserPosition(
                _token,
                msg.sender,
                _amount,
                _rewardDebt
            );
        } else {
            TreasuryStorage.setUserPosition(
                _token,
                msg.sender,
                _amount,
                _rewardDebt
            );
        }

        accessTokens.push(_token);

        IERC20(_token).safeTransfer(treasuryStorage, _amount);
        emit Deposit(_token, msg.sender, _amount);
    }

    function updatePool(address _token)
        public
        returns (IPool.Pool memory pool)
    {
        TreasuryStorage = ITreasuryStorage(treasuryStorage);

        IPool.Pool memory cpool = TreasuryStorage.getPool(_token);
        uint256 totalSupply = TreasuryStorage.getTokenSupply(_token);
        uint256 accCaplPerShare;
        if (block.number > cpool.lastRewardBlock) {
            if (totalSupply > 0) {
                uint256 blocks = block.number - cpool.lastRewardBlock;
                uint256 caplReward = blocks * cpool.rewardsPerBlock;
                accCaplPerShare =
                    cpool.accCaplPerShare +
                    (caplReward * CAPL_PRECISION) /
                    totalSupply;
            }
            uint256 lastRewardBlock = block.number;
            IPool.Pool memory npool = TreasuryStorage.updatePool(
                _token,
                accCaplPerShare,
                lastRewardBlock
            );

            emit PoolUpdated(_token, lastRewardBlock);
            return npool;
        }
    }

    /**
        @dev - this funciton withdraws a token amount from the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function withdraw(address _token) external {
        IPool.Pool memory pool = updatePool(_token);
        IUserPositions.UserPosition memory user = TreasuryStorage
            .getUserPosition(_token, msg.sender);

        uint256 amount = TreasuryStorage.getUnlockedAmount(_token, msg.sender);

        uint256 newRewardDebt = user.rewardDebt -
            (amount * pool.accCaplPerShare) /
            CAPL_PRECISION;

        IERC20(_token).approve(address(TreasuryStorage), amount);
        TreasuryStorage.withdraw(_token, msg.sender, amount, newRewardDebt);

        emit Withdraw(_token, msg.sender, amount);
    }

    /**
        @dev - this function reads this contracts CAPL balance, and then (similar to rewards), calculates the pending revenue based on revenue share weight.
             - user treasury share percentage * contract CAPL balance = pending revenue
             - almost exact logic same as rewards 
     */
    function pendingRevenue() external returns (uint256 pending) {
        IPool.Pool memory pool = ITreasuryStorage(treasuryStorage).getPool(
            address(capl)
        );
        IUserPositions.UserPosition memory user = ITreasuryStorage(
            treasuryStorage
        ).getUserPosition(address(capl), msg.sender);

        uint256 accCaplPerShare = pool.accCaplPerShare;
        uint256 tokenSupply = ITreasuryStorage(treasuryStorage).getTokenSupply(
            address(capl)
        );

        if (block.number > pool.lastRewardBlock && tokenSupply != 0) {
            uint256 blocks = block.number - pool.lastRewardBlock;
            uint256 caplReward = blocks * pool.rewardsPerBlock;
            accCaplPerShare =
                accCaplPerShare +
                (caplReward * CAPL_PRECISION) /
                tokenSupply;
        }
        pending =
            ((user.totalAmount * accCaplPerShare) / CAPL_PRECISION) -
            user.rewardDebt;
    }

    /**
        @dev - claim revenue, similar to rewards contract, will calculate the pending rewards and then safeTransfer from here, to the user.
             - almost exact logic same as rewards
      */
    function claimRevenue() external {
        IPool.Pool memory pool = updatePool(address(capl));
        IUserPositions.UserPosition memory user = TreasuryStorage
            .getUserPosition(address(capl), msg.sender);

        uint256 accumulatedCapl = (user.totalAmount * pool.accCaplPerShare) /
            CAPL_PRECISION;
        uint256 pendingCapl = accumulatedCapl - user.rewardDebt;

        // _user.rewardDebt = accumulatedCapl
        TreasuryStorage.setUserDebt(address(capl), msg.sender, accumulatedCapl);

        if (pendingCapl > 0) {
            controller.mint(msg.sender, pendingCapl);
        }

        emit Claim(address(capl), msg.sender, pendingCapl);
    }

    /**
        @dev - this function gets the total amount of access tokens in the treasury storage.
             - then, the liquidity pool is read (CAPL-USDC) and a USD value is determined.
     */
    function getTotalManagedValue()
        external
        returns (uint256 totalManagedValue)
    {
        totalManagedValue = 0;

        for (uint256 i = 0; i < accessTokens.length; i++) {
            totalManagedValue += ITreasuryStorage(treasuryStorage)
                .getTokenSupply(accessTokens[i]);
        }
    }

    /**
        ADMIN FUNCTIONS
        TODO: Add RBAC @dev
    */
    function setRevenueController(address _destination)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        revenueController = _destination;
    }
}
