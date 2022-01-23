//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

interface IController {
    function mint(address destination, uint256 amount) external;
}