// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract Swap {
    address public pool;
    address public capl;
    address public usdc;

    constructor(address _pool, address _capl, address _usdc) {
        pool = _pool;
        capl = _capl;
        usdc = _usdc;
    }
}