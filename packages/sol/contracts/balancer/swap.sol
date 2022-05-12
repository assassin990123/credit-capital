// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICAPL {
    function burn(uint256 _amount) external;
}

interface IVault {
    function getPoolTokens(bytes32 poolD) external view returns (address[] memory, uint256[] memory);
	function swap(SingleSwap memory singleSwap, FundManagement memory funds, uint256 limit, uint256 deadline) external returns (uint256);
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

contract Swap {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT = 2 ** 256 - 1;
    uint256 public constant DEADLINE = 10 minutes;

    bytes32 public poolId;
    address public capl;
    address public usdc;

    IVault VAULT;
    address public vault;

	constructor(address _capl, address _usdc, address _vault, uint _poolId) {
        poolId = bytes32(_poolId);
        capl = _capl;
        usdc = _usdc;
        vault = _vault;

        VAULT = IVault(_vault);
		IERC20(_usdc).approve(vault, MAX_UINT);
		IERC20(_capl).safeApprove(vault, MAX_UINT);
	}

    function doSwap() external {
        uint256 internalBalance = getUSDCBalance();

        SingleSwap memory swap = SingleSwap(
            poolId,
            SwapKind.GIVEN_IN,
            usdc,
            capl,
            internalBalance,
            "0x"
        );

		FundManagement memory fundManagement = FundManagement(
            address(this),
            false,
            address(this),
            false
        );
		
		VAULT.swap(swap, fundManagement, 0, block.timestamp + DEADLINE);
	}

    function burn() external {
        // get the returned CAPL balance
        uint256 caplBalance = getCAPLBalance();

        // burn returned CAPL
        ICAPL(capl).burn(caplBalance);
    }

    function getCAPLBalance() public view returns (uint256) {
        return IERC20(capl).balanceOf(address(this));
    }

    function getUSDCBalance() public view returns (uint256) {
        return IERC20(usdc).balanceOf(address(this));
    }
}