// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// TreasurySotrage
import "../../interfaces/ITreasuryStorage.sol";

contract TreasuryFund is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 capl;
    uint256 CAPL_PRECISION = 1e18;

    // tokens allowed to be deposited into the treasury, must be updatable
    address[] accessTokens;
    // see revenue controller contract for explanation on interaction
    address revenueController;
    // treasury storage, TBD, will eventually interface similar to the vault in the rewards contract
    address treasuryStorage;

    event Deposit(address _token, address _user, uint256 _amount);
    event PoolUpdated(address indexed _token, uint256 _block);

    constructor(address _capl, address _treasuryStorage) {
        capl = IERC20(_capl);
        treasuryStorage = _treasuryStorage;
    }

    /**
        @dev - this function deposits eligible token amounts to the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function deposit(address _token, uint256 _amount) external {
        ITreasuryStorage TreasuryStorage = ITreasuryStorage(treasuryStorage);

        require(TreasuryStorage.checkIfPoolExists(_token), "Pool does not exist");
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

        IERC20(_token).safeTransfer(treasuryStorage, _amount);
        emit Deposit(_token, msg.sender, _amount);
    }

    function updatePool(address _token)
        public
        returns (IPool.Pool memory pool)
    {
        ITreasuryStorage TreasuryStorage = ITreasuryStorage(treasuryStorage);

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
    function withdraw(address _token, uint256 _amount) external {
        
    }

    /**
        @dev - this function reads this contracts CAPL balance, and then (similar to rewards), calculates the pending revenue based on revenue share weight.
             - user treasury share percentage * contract CAPL balance = pending revenue
             - almost exact logic same as rewards 
     */
    function pendingRevenue() external returns(uint256 pending){
        IPool.Pool memory pool = ITreasuryStorage(treasuryStorage).getPool(address(capl));
        IUserPositions.UserPosition memory user = ITreasuryStorage(treasuryStorage).getUserPosition(
            address(capl),
            msg.sender
        );

        uint256 accCaplPerShare = pool.accCaplPerShare;
        uint256 tokenSupply = ITreasuryStorage(treasuryStorage).getTokenSupply(address(capl));

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
    function claimRevenue() external {}

    /**
        @dev - this function gets the total amount of access tokens in the treasury storage.
             - then, the liquidity pool is read (CAPL-USDC) and a USD value is determined.
     */
    function getTotalManagedValue() external {}

    /**
        ADMIN FUNCTIONS
        TODO: Add RBAC @dev
    */
    function setRevenueController(address _destination) external {
        revenueController = _destination;
    }
}
