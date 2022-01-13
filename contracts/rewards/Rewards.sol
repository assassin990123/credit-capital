//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVault {
  function addPool ( address _token, uint256 _rewardsPerDay ) external;
  function checkIfPoolExists ( address _token ) external view returns ( bool );
  function checkIfUserPositionExists(address _token) external view returns (bool);
  function depositVault ( address _token, uint256 _amount ) external;
  function getPoolInfo ( address _token ) external view returns ( IPool.Pool memory );
  function withdrawMATIC ( address _destination ) external;
  function withdrawToken ( address _token, uint256 _amount, address _destination ) external;
  function withdrawVault ( address _token, uint256 _amount ) external;
  function addUserPosition(address _token, address _user, uint256 _amount, uint256 _rewardDebt) external;
  function updateUserPosition(address _token, address _user, uint256 _amount, uint256 _rewardDebt) external;
  function getUserPosition(address _token, address _user) external returns (IUserPositions.UserPosition memory);
  function addStake(address _user, uint256 _amount) external;
  function getLastStake(address _token, address _user) external returns (IStake.Stake memory);
  function getUserStakes(address _token, address _user) external returns (IStake.Stake[] memory);
  function updatePool(address _token, uint256 _accCaplPerShare, uint256 _lastRewardBlock) external returns (IPool.Pool memory);
  function updateStake(address _token, address _user, uint256 _amount) external;
  function getPool(address _token) external returns (IPool.Pool memory);
  function getTokenSupply(address _token) external returns (uint256);
  function updateUserDebt(address _token, address _user, uint256 rewardDebt) external;
  function getUnlockedAmount(address _token, address _user) external returns (uint256 _unlockedAmount);
  function withdraw(address _token, address _user, uint256 _amount, uint256 _newUserAmount, uint256 _newRewardDebt) external;

}

interface IPool {
  struct Pool {
      uint256 totalPooled;        // total token pooled in the contract
      uint256 rewardsPerBlock;    // rate at which CAPL is minted for this pool
      uint256 accCaplPerShare;    // weighted CAPL share in pool
      uint256 lastRewardBlock;    // last time a claim was made
  }
}

interface IUserPositions {
  struct UserPosition {
      address token;           // MRC20 associated with pool
      uint256 totalAmount;     // total value staked by user in given pool
      uint256 pendingRewards;  // total rewards pending for user 
      uint256 rewardDebt;      // house fee (?)
      uint256 claimedRewards;  // total rewards claimed by user for given pool
      uint256[] sKey;          // list of user stakes in pool subject to timelock
      bool staticLock;         // guarantees a users stake is locked, even after timelock expiration
  }
}

interface IStake {
  struct Stake {
      uint256 amount;          // quantity staked
      uint256 startBlock;      // stake creation timestamp
      uint256 timeLockEnd;     // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
      bool active;             // true = stake in vault, false = user withdrawn stake
  }
}

interface IController {
  function mint ( address destination, uint256 amount ) external;
}

contract RewardsV2 is Pausable, AccessControl {

    using SafeERC20 for IERC20;

    IVault vault;

    uint256 CAPL_PRECISION = 1e18;

    IController controller;

    constructor (address _vault) {
        vault = IVault(_vault);
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
      Write functions
    */
    // TODO: Implement functions in vault
    function deposit(address _token, uint256 _amount) external {
      require(vault.checkIfPoolExists(_token), "Pool does not exist");

      // update pool to current block 
      IPool.Pool memory pool = updatePool(_token);

      uint256 rewardDebt = _amount * pool.accCaplPerShare / CAPL_PRECISION;

      if (!vault.checkIfUserPositionExists(_token)) {
        // new user position & new stake
        // no timelock
        vault.addUserPosition(_token, msg.sender, _amount, rewardDebt);
      } else {
        // only update the position
        vault.updateUserPosition(_token, msg.sender, _amount, rewardDebt);
        // check timelock
        IStake.Stake memory lastStake = vault.getLastStake(_token, msg.sender);

        if (checkTimelockThreshold(lastStake.startBlock)) {
          // add a new stake for the user
          // this function adds a new stake, and a new stake key in the user position instance
          vault.addStake(msg.sender, _amount);
        } else {
          // Update the last stake
          vault.updateStake(_token, msg.sender, _amount);
        }
      }
    }

    function updatePool(address _token) public returns (IPool.Pool memory pool) {
      IPool.Pool memory cpool = vault.getPool(_token);
      uint256 totalSupply = vault.getTokenSupply(_token);
      uint256 accCaplPerShare;
      if (block.number > cpool.lastRewardBlock) {
        if (totalSupply > 0) {
          uint256 blocks = block.number - cpool.lastRewardBlock;
          uint256 caplReward = blocks * cpool.rewardsPerBlock;
          accCaplPerShare = cpool.accCaplPerShare + (caplReward * CAPL_PRECISION) / totalSupply;
        }
        uint256 lastRewardBlock = block.number;
        return vault.updatePool(_token, accCaplPerShare, lastRewardBlock);
      }
    }
    /*
      _userPosition: actualized values,
      _pool: actualized values
     */

    function pendingRewards(address _token, address _user) external returns (uint256 pending){
      IPool.Pool memory pool = vault.getPool(_token);
      IUserPositions.UserPosition memory user = vault.getUserPosition(_token, _user);

      uint256 accCaplPerShare = pool.accCaplPerShare;
      uint256 tokenSupply = vault.getTokenSupply(_token);

      if (block.number > pool.lastRewardBlock && tokenSupply != 0) {
        uint256 blocks = block.number - pool.lastRewardBlock;
        uint256 caplReward = blocks * pool.rewardsPerBlock;
        accCaplPerShare = accCaplPerShare + (caplReward * CAPL_PRECISION) / tokenSupply;
      }
      pending = (user.totalAmount * accCaplPerShare / CAPL_PRECISION) - user.rewardDebt;
    }

    function claim(address _token, address _user) external {
      IPool.Pool memory pool = updatePool(_token);
      IUserPositions.UserPosition memory user = vault.getUserPosition(_token, _user);

      uint256 accumulatedCapl = user.totalAmount * pool.accCaplPerShare / CAPL_PRECISION;
      uint256 pendingCapl = accumulatedCapl - user.rewardDebt;

      // _user.rewardDebt = accumulatedCapl
      vault.updateUserDebt(_token, _user, accumulatedCapl);

      if (pendingCapl > 0) {
        controller.mint(_user, pendingCapl);
      }
    }

    /**
     we do this one directly in the vault because otherwise we would have a potentially large payload when a user has many stakes
    */
    function pendingWithdrawals(address _token, address _user) public returns (uint256 _unlockedAmount) {
      _unlockedAmount = vault.getUnlockedAmount(_token, _user);
    }

    function withdraw(address _token, address _user) external {
      IPool.Pool memory pool = updatePool(_token);
      IUserPositions.UserPosition memory user = vault.getUserPosition(_token, _user);

      uint256 amount = pendingWithdrawals(_token, _user);
      uint256 newRewardDebt = user.rewardDebt - amount * pool.accCaplPerShare / CAPL_PRECISION;
      uint256 newUserAmount = user.totalAmount - amount;

      vault.withdraw(_token, _user, amount, newUserAmount, newRewardDebt);
    }
   
    /*
        Read functions
    */

    function unclaimedRewards(address _token) external {}

    // TODO: move to vault
    //function getUserInfo() external returns (User memory) {}

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold(uint256 _timelock) internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function addPool(address _token, uint256 _rewardsPerBlock) external onlyRole(DEFAULT_ADMIN_ROLE) {
        vault.addPool(_token, _rewardsPerBlock);
    }
    function withdrawToken(address _token, uint256 _amount, address _destination) external onlyRole(DEFAULT_ADMIN_ROLE) {}

    function withdrawMATIC(address _destination) external onlyRole(DEFAULT_ADMIN_ROLE) {
      IVault(vault).withdrawMATIC(_destination);
    }

    function setController(address _controller) external onlyRole(DEFAULT_ADMIN_ROLE){
      controller = IController(_controller);
    }

}