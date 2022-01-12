//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVault {
  function addPool ( address _token, uint256 _amount, uint256 _rewardsPerDay ) external;
  function checkIfPoolExists ( address _token ) external view returns ( bool );
  function depositVault ( address _token, uint256 _amount ) external;
  function getPoolInfo ( address _token ) external view returns ( IPool.Pool memory );
  function withdrawMATIC ( address _destination ) external;
  function withdrawToken ( address _token, uint256 _amount, address _destination ) external;
  function withdrawVault ( address _token, uint256 _amount ) external;
  function setTimeLock(uint256 _duration) external;
  
  struct UserPosition {
      uint256 totalAmount;     // total value staked by user in given pool
      uint256 pendingRewards;  // total rewards pending for user 
      uint256 rewardDebt;      // house fee (?)
      uint256 claimedRewards;  // total rewards claimed by user for given pool
      uint256[] sKey;          // list of user stakes in pool subject to timelock
      bool staticLock;         // guarantees a users stake is locked, even after timelock expiration
      bool autocompounding;    // this userposition enables auto compounding (Auto restaking the rewards)
  }
}

interface IPool {
  struct Pool {
    uint256 totalPooled;    // total token pooled in the contract
    uint256 totalUsers;     // total number of active participants
    uint256 rewardsPerDay;  // rate at which CAPL is minted for this pool
  }
}

contract RewardsV2 is Pausable, AccessControl {

    using SafeERC20 for IERC20;
    // reward token
    address public capl;

    // If a user adds a deposit below the locking threshold, the lp is absorbed into the previous lock.
    // else, a new stake is created.
    uint256 public lockingThreshold;
    // timelock duration

    address vault;

    // events for notice to the frontend
    event WithdrawStake(address token, uint256 amount);

    constructor (address _vault) {
        vault = _vault;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
        Write functions
    */
    function unclaimedRewards(address _token, uint256 _amount) external {}

    // compounding: autocompound by default
    function claimRewards(address _token) external {}

    // interfaces with vault
    function withdrawStake(address _token, uint256 _stake, uint256 _amount) external whenNotPaused {
      // call the withdrawVault function from the vault contract
      IVault(vault).withdrawVault(msg.sender, _token, _amount, _stake);

      emit WithdrawStake(_token, _amount);
    }
    
    // interfaces with vault
    function withdrawAllStake(address _token) external {}

    function setStaticLock(address _token, uint256 _stakeId) external {}
   
    /*
        Read functions
    */

    function unclaimedRewards(address _token) external {}

    // TODO: move to vault
    //function getUserInfo() external returns (User memory) {}

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    // interfaces with vault
    function addPool(address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {}

    function withdrawToken(address _token, uint256 _amount, address _destination) external onlyRole(DEFAULT_ADMIN_ROLE) {}

    function withdrawMATIC(address _destination) external onlyRole(DEFAULT_ADMIN_ROLE) {}

    function updateTimelockDuration(uint256 _duration) external onlyRole(DEFAULT_ADMIN_ROLE) {
      IVault(vault).setTimeLock(_duration);
    }

}