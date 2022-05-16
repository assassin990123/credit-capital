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

    // user Roles for RBAC
    bytes32 public constant OPERATOR_ROLE =
        keccak256("OPERATOR_ROLE");

    // This controller will be represented by single NFT
    IERC721 NFT;
    address public nft;

    // Swap contract
    ISwap Swap;
    address public swap;

    // track user weight
    uint256 public controllerWeight = 5; // 5% of the profit
    uint256 public swapWeight = 5; // 5% of the profit
    uint256 public nftOwnerWeight = 90; // 95% of the profit

    event Deposit(address indexed _token, address _user, uint256 _amount);
    event Splitter(
        address indexed _token,
        address indexed _user,
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
        grantRole(OPERATOR_ROLE, msg.sender);
    }

    /** Weight */
    function setControllerWeight(uint256 _weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
        controllerWeight = _weight;
    }

    function setNFTOwnerWeight(uint256 _weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
        nftOwnerWeight = _weight;
    }

    /**
        @dev - this function deposits eligible token amounts to the treasury storage, updating the corresponding storage state (to be implemented)
     */
    function depositProfit(address _token, uint256 _profit) external {
        // deposit funds into this contract;
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _profit);
        emit Deposit(_token, msg.sender, _profit);
    }

    /**
        @dev - this funciton withdraws a token amount from the this contract - emergency withdraw
     */
    function emergencyWithdraw(address _token) external onlyRole(OPERATOR_ROLE) {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, balance);

        emit Withdraw(_token, msg.sender, balance);
    }

    /**
        This function returns the allocAmount calculated to distribute to the NFT owner
     */
    function splitter(address _token, uint _profit, uint _tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address nftOwner = NFT.ownerOf(_tokenId);

        // send 95% of the profit to the NFT owner, rest 5% will remain to this contract
        uint sharedProfit = (_profit * nftOwnerWeight) / 100;
        IERC20(_token).safeTransfer(nftOwner, sharedProfit);

        emit Splitter(_token, nftOwner, sharedProfit);

        // the revenue controller will also get 5% of the profit, and swap to CAPL.
        uint profitForSwap = (_profit * swapWeight) / 100;
        IERC20(_token).safeTransfer(swap, profitForSwap);

        // 5% of the revenue will be swapped to CAPL and burned
        Swap.swapAndBurn();
    }
}