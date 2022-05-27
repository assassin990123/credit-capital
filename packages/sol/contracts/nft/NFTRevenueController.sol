// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

interface ISwap {
    function swapAndSend(address _token, uint256 _amount, address _destination) external;
}

contract NFTRevenueController is AccessControl {
    using SafeERC20 for IERC20;

    uint256 constant MAX_UINT = 2 ** 256 -1;

    // This controller will be represented by single NFT
    IERC721 NFT;
    address public nft;

    // Specific NFT ID
    uint256 public NftID;

    // Swap contract
    ISwap Swap;
    address public swap;

    // CAPL, USDC address
    address public capl;
    address public usdc;

    // treasuryController
    address public treasuryController;

    // track user weight
    uint256 public controllerWeight = 5; // 5% of the profit to treasury controller
    uint256 public swapWeight = 5; // 5% of the profit swapped into CAPL for the owner
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

    constructor(address _nft, uint256 _nftid, address _swap, address _usdc, address _capl, address _treasuryController) {
        // set representing NFT contract
        NFT = IERC721(_nft);
        nft = _nft;
        
        // NFT ID
        NftID = uint256(_nftid);

        capl = _capl;
        usdc = _usdc;
        treasuryController = _treasuryController;
        setSwap(_swap)

        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /** set swap contract for the swap contract to transfer tokens from this contract.
    If the admin sets this to an incorrect or malicious contract this can result
    in a loss of funds.
    Assumes USDC, additional approvals may be added with approveSwap(_token)
    */
    function setSwap(address _swap)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        Swap = ISwap(_swap);
        swap = _swap;

        // approve USDC on swap contract. Approve other tokens as necessary.
        approveSwap(usdc);
    }

    /** Approve Swap Contract */
    /** Any address can call this function as it approves any token
    only on the swap contract. Only the admin can change the swap contract. */
    function approveSwap(address _token)
        external
    {
        IERC20(_token).approve(swap, MAX_UINT);
    }

    /** Weight */
    function setControllerWeight(uint256 _weight)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        controllerWeight = _weight;
    }

    function setNFTOwnerWeight(uint256 _weight)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        nftOwnerWeight = _weight;
    }

    function setSwapWeight(uint256 _weight)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        swapWeight = _weight;
    }

    /**
        @dev - this funciton withdraws a token balance from the this contract - emergency withdraw
     */
    function emergencyWithdraw(address _token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, balance);

        emit Withdraw(_token, msg.sender, balance);
    }

    /**
        This function distributes the contract's balance of a token to designated recipients
     */
    function distributeRevenue(
        address _token
    ) external {
        address nftOwner = NFT.ownerOf(NftID);
        uint256 balance = IERC20(_token).balanceOf(address(this));

        // send 90% of the balance to the NFT owner
        uint256 ownerShare = (balance * nftOwnerWeight) / 100;
        IERC20(_token).safeTransfer(nftOwner, ownerShare);

        // Send 5% of the revenue to the treasury controller
        uint256 treasuryShare = (balance * controllerWeight) / 100;
        IERC20(_token).safeTransfer(treasuryController, treasuryShare);

        // 5% of the revenue will be swapped to CAPL and sent to the owner
        uint256 swapShare = (balance * swapWeight) / 100;

        // swap swapShare amount to CAPL and return to nft owner
        Swap.swapAndSend(_token, swapShare, nftOwner);

        // Todo: Initialize the capl global var, another constructor arg, right?
        uint256 caplBalance = IERC20(capl).balanceOf(address(this));
        IERC20(_token).safeTransfer(nftOwner, caplBalance);

        emit DistributeRevenue(_token, balance);
    }
}
