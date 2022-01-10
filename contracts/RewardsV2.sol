//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

interface IVault {
    event Paused(address account);
    event RoleAdminChanged(
        bytes32 indexed role,
        bytes32 indexed previousAdminRole,
        bytes32 indexed newAdminRole
    );
    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    event Unpaused(address account);

    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

    function addPool(address _token, uint256 amount) external;

    function capl() external view returns (address);

    function depositVault(address _token, uint256 _amount) external;

    function getPoolInfo(uint256 id) external returns (IPools.Pool memory);

    function getPools() external returns (IPools.Pool[] memory);

    function checkIfPoolExists(address _token) external returns (bool);

    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    function grantRole(bytes32 role, address account) external;

    function hasRole(bytes32 role, address account)
        external
        view
        returns (bool);

    function mintCapl(address _to, uint256 _amount) external;

    function paused() external view returns (bool);

    function renounceRole(bytes32 role, address account) external;

    function revokeRole(bytes32 role, address account) external;

    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function withdrawAllVault(address _token) external;

    function withdrawMATIC(address _destination) external;

    function withdrawToken(
        address _token,
        uint256 _amount,
        address _destination
    ) external;

    function withdrawVault(address _token, uint256 _amount) external;
}

interface IPools {
    struct Pool {
        uint256 totalPooled;
        uint256 totalUsers;
    }
}

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RewardsV2 is Pausable, AccessControl {

    using SafeERC20 for IERC20;
    // access control roles definition
    // reward token
    address public capl;

    // If a user adds a deposit below the locking threshold, the lp is absorbed into the previous lock.
    // else, a new stake is created.
    uint256 public lockingThreshold;
    // timelock duration
    uint256 timelock = 137092276;   // 4 years, 4 months, 4 days ...

    address vault;

    IVault vaultInstance;

    constructor (address _vault) {
        vault = _vault;

        vaultInstance = IVault(_vault);
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
        Write functions
    */

    function depositStake(address _token, uint256 _amount) external {}

    /**
        @dev - here we can assume that there are no timelocks, since the vault has no knowledge of the pool.
     */
    function depositStakeNew(address _token, uint256 _amount) external {
        require(!vaultInstance.checkIfPoolExists(_token), "This pool already exists.");
        // create user & stake data
        Stake memory newStake = Stake({
            key: 0,                         // first stake
            token: _token,
            tokenAmount: _amount,
            startBlock: block.timestamp,
            lastClaimBlock: 0,
            staticLock: false,
            active: true
        });

        uint256[] memory userStakeKeys;

        User memory newUser = User ({
            pendingRewards: 0,
            rewardDebt: 0,
            claimedRewards: 0,
            stakeKeys: userStakeKeys
        });
        // persist user & stake data
        Users[msg.sender] = newUser;
        Users[msg.sender].stakeKeys.push(0);

        Stakes[msg.sender].push(newStake);

        // transfer funds to the vault
        IERC20(_token).safeTransferFrom(msg.sender, vault, _amount);

        vaultInstance.addPool(_token, _amount);
    } 

    // compounding: autocompound by default
    function claimRewards(address _token) external {}

    // interfaces with vault
    function withdrawStake(address _token, uint256 _stake, uint256 _amount) external {}
    
    // interfaces with vault
    function withdrawAllStake(address _token) external {}

    function setStaticLock(address _token, uint256 _stakeId) external {}
   
    /*
        Read functions
    */

    function unclaimedRewards(address _token) external {}

    // interfaces with vault
    function getPools() external {}

    function getUserInfo() external returns (User memory) {}

    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    // interfaces with vault
    function addPool(address _token) external {}

    function withdrawToken(address _token, uint256 _amount, address _destination) external {}

    function withdrawMATIC(address _destination) external {}

    function updateTimelockDuration(uint256 _duration) external {}

}