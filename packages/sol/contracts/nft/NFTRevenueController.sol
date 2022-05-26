// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

interface ISwap {
    function swapAndBurn() external;
}

contract NFTRevenueController is AccessControl {
    using SafeERC20 for IERC20;

    // This controller will be represented by single NFT
    IERC721 NFT;
    address public nft;

    // Swap contract
    ISwap Swap;
    address public swap;

    // track user weight
    uint256 public controllerWeight = 5; // 5% of the profit
    uint256 public swapWeight = 5; // 5% of the profit
    uint256 public nftOwnerWeight = 90; // 90% of the profit

    event Deposit(address indexed _token, address _user, uint256 _amount);
    event DistributeRevenue(
        address indexed _token,
        uint256 _amount
    );
    event Withdraw(
        address indexed _token,
        address indexed _user,
        uint256 _amount
    );

    constructor(address _nft, address _swap) {
        // set representing NFT contract
        NFT = IERC721(_nft);
        nft = _nft;

        Swap = ISwap(_swap);
        swap = _swap;

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /** Weight */
    function setControllerWeight(uint256 _weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
        controllerWeight = _weight;
    }

    function setNFTOwnerWeight(uint256 _weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
        nftOwnerWeight = _weight;
    }

    function setSwapWeight(uint256 _weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
        swapWeight = _weight;
    }

    /**
        @dev - this funciton withdraws a token balance from the this contract - emergency withdraw
     */
    function emergencyWithdraw(address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, balance);

        emit Withdraw(_token, msg.sender, balance);
    }

    /**
        This function distributes the contract's balance of a token to designated recipients
     */
    function distributeRevenue(address _token, uint _tokenId) external {
        address nftOwner = NFT.ownerOf(_tokenId);

        // send 95% of the profit to the NFT owner, rest 5% will remain to this contract
        uint sharedProfit = (_profit * nftOwnerWeight) / 100;
        IERC20(_token).safeTransfer(nftOwner, sharedProfit);

        emit DistributeRevenue(_token, sharedProfit);

        // the revenue controller will also get 5% of the profit, and swap to CAPL.
        uint profitForSwap = (_profit * swapWeight) / 100;
        IERC20(_token).safeTransfer(swap, profitForSwap);

        // 5% of the revenue will be swapped to CAPL and burned
        Swap.swapAndBurn();
    }
}
