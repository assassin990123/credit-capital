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
	address payable recipient;
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
	function swap(SingleSwap memory singleSwap, FundManagement memory funds, uint256 limit, uint256 deadline) external payable returns (uint256);
}

contract Swap {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT = 2 ** 256 - 1;
    uint256 poolId;

    IVault constant private VAULT = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

	constructor(address _capl, address _usdc, uint _poolId) {
        poolId = _poolId;
		IERC20(_usdc).approve(address(VAULT), MAX_UINT);
		IERC20(_capl).safeApprove(address(VAULT), MAX_UINT);
	}

    function doSwap(SingleSwap memory swap, uint256 _initialAmount, uint256 _requiredBalance) private {
		uint256 limit = swap.kind == SwapKind.GIVEN_IN ? 0 : MAX_UINT;
		FundManagement memory fundManagement = FundManagement(address(msg.sender), false, payable(address(msg.sender)), false);
		if (swap.kind == SwapKind.GIVEN_OUT) wrapToken(address(swap.assetIn), _initialAmount);
		require(IERC20(swap.assetIn).balanceOf(address(this)) >= _requiredBalance, "Not enough asset in balance");
		VAULT.swap(swap, fundManagement, limit, block.timestamp);
		if (swap.kind == SwapKind.GIVEN_IN) unwrapToken(address(swap.assetOut), IERC20(swap.assetOut).balanceOf(address(this)));
	}

	function wrapToken(address _wrappedToken, uint256 _amount) private {
		IERC20(_wrappedToken).safeTransferFrom(msg.sender, address(this), _amount);
	}

	function unwrapToken(address _wrappedToken, uint256 _amount) private {
        // burn the capl returned from swap
		ICAPL(_wrappedToken).burn(_amount);
	}

	receive() payable external {}
}