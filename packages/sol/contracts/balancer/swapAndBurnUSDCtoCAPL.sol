// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICAPL {
    function burn(uint256 _amount) external;
}

interface IVault {
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

contract swapAndBurnUSDCtoCAPL is AccessControl {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT = 2 ** 256 - 1;

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
		IERC20(_usdc).safeApprove(vault, MAX_UINT);
		IERC20(_capl).safeApprove(vault, MAX_UINT);
        
        // setup the admin role for the storage owner
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
	}

    function swapAndBurn() external {
        uint256 internalBalance = IERC20(usdc).balanceOf(address(this));

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
		
		VAULT.swap(swap, fundManagement, 0, block.timestamp + 10 minutes);

        // get the returned CAPL balance
        uint256 caplBalance = IERC20(capl).balanceOf(address(this));

        // burn returned CAPL
        ICAPL(capl).burn(caplBalance);
	}
    /**
        @dev - this funciton withdraws a token amount from the this contract - emergency withdraw
     */
    function emergencyWithdraw(address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, balance);

    }
}