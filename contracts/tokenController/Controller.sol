//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ICAPL {
    function mint(address _to, uint256 _amount) external;
}

contract controller is AccessControl {
    using SafeERC20 for IERC20;

    // MINTER = mint & burn role
    bytes32 public constant MINTER = keccak256("MINTER");

    // address of CAPL token
    address public CAPL;

    // address of burner
    address public burner;

    constructor(address _CAPL, address _burner) {
        CAPL = _CAPL;
        burner = _burner;

        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER, msg.sender);
    }

    // Add RBAC
    function mint(address destination, uint256 amount) external onlyRole(MINTER) {
        ICAPL(CAPL).mint(destination, amount);
    }
    // Add RBAC
    function burn(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(CAPL).safeTransfer(burner, amount);
    }

    /**
    * @param _account The role that would be added to the MINTER role
    */
    function addMinter(address _account) public onlyRole(getRoleAdmin(MINTER)) {
        grantRole(MINTER, _account);
    }
}