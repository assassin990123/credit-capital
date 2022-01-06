//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault is Pausable, AccessControl {
    // access control roles definition
    // reward token
    address public capl;
    // pool tracking
    /* 
        I'm still undecided if I want to create one contract for all of the pools, or multiple contracts. 
        I'm currently leaning towards a single contract. Open to suggestions and critique from anyone.
    */
    mapping(address => Pool) Pools;

    struct Pool {
        uint256 totalPooled;    // total generic token pooled in the contract
        uint256 totalUsers;
        bool active;
    }
    // TBD: Assume creation with one pool required (?)
    constructor (address _capl) {
        capl = _capl;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /*
        Write functions
    */
    function depositVault(address _token, uint256 _amount) external {}

    function withdrawVault(address _token, uint256 _amount) external {}
   
    /*
        Read functions
    */
    function getPoolInfo(uint256 id) external returns (Pool memory) {}

    function getPools() external returns (Pool[] memory) {}

    function checkIfPoolExists(address _token) public returns (bool) {
        return Pools[_token].active;
    }


    /*  This function will check if a new stake needs to be created based on lockingThreshold.
        See readme for details.
    */
    function checkTimelockThreshold() internal returns (bool) {}
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function mintCapl(address _to, uint256 _amount) external {}

    function addPool(address _token, uint256 _amount) external {
        require(!checkIfPoolExists(_token), "This pool already exists");
        Pools[_token] = Pool({
            totalPooled: _amount,
            totalUsers: 1,
            active: true
        });
    }

    function updatePool(uint256 _id, uint256 _totalRewards, uint256 _totalUsers) internal {}

    function withdrawToken(address _token, uint256 _amount, address _destination) external {}

    function withdrawMATIC(address _destination) external {}

    function withdrawAllVault(address _token) external {}


}