// SPDX-License-Identifier: MIT
// Optimization: 1500
// Note: This is a testnet contract for use on Rinkeby, internal use only.
// Note: The ABI on this may be different, this is a simple ERC20 token, not a fork of mainnet USDC

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestnetUSDC is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("Testnet USDC", "TestUSDC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function setRole(string memory _role, address _user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(keccak256(bytes (_role)), _user);
    }
    
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
