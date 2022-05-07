// SPDX-License-Identifier: MIT
// Optimization: 1500
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TreasuryShares is
    ERC20,
    ERC20Burnable,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Sets the value of the `cap`. This value is immutable, it can only be
     * set once during construction.
     */
    constructor()
        ERC20("CreditCapital Platform Token", "CAPL")
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev See {ERC20-_mint}.
     */
    function _mint(address account, uint256 amount)
        internal
        virtual
        override(ERC20)
    {
        super._mint(account, amount);
    }
}
