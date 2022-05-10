// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICAPL {
    function burn(uint256 _amount) external;
}

struct FundManagement {
	address sender;
	bool fromInternalBalance;
	address recipient;
	bool toInternalBalance;
}

enum SwapKind { GIVEN_IN, GIVEN_OUT }

struct SingleSwap {
	bytes32 poolId;
	SwapKind kind;
	address assetIn;
	address assetOut;
	uint256 amount;
	bytes userData;
}

interface IVault {
    function getPoolTokens(bytes32 poolD) external view returns (address[] memory, uint256[] memory);
	function swap(SingleSwap memory singleSwap, FundManagement memory funds, uint256 limit, uint256 deadline) external returns (uint256);
}

contract Swap {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT = 2 ** 256 - 1;
    bytes32 poolId;

    address capl;
    address usdc;

    IVault constant private VAULT = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

	constructor(address _capl, address _usdc, uint _poolId) {
        poolId = bytes32(_poolId);
        capl = _capl;
        usdc = _usdc;

		IERC20(_usdc).approve(address(VAULT), MAX_UINT);
		IERC20(_capl).safeApprove(address(VAULT), MAX_UINT);
	}

    function doSwap() private {
        uint256 internalBalance = IERC20(usdc).balanceOf(address(this));

        SingleSwap memory swap = SingleSwap(
            poolId,
            SwapKind.GIVEN_IN,
            usdc,
            capl,
            internalBalance,
            ""
        );

		FundManagement memory fundManagement = FundManagement(
            address(this),
            false,
            address(this),
            false
        );
		
		VAULT.swap(swap, fundManagement, MAX_UINT, block.timestamp);

        // get the returned CAPL balance
        uint256 caplBalance = IERC20(capl).balanceOf(address(this));

        // burn returned CAPL
        ICAPL(capl).burn(caplBalance);
	}
}