// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICAPL {
    function burn(uint256 _amount) external;
}

interface IVault {
    function swap(
        SingleSwap memory singleSwap,
        FundManagement memory funds,
        uint256 limit,
        uint256 deadline
    ) external returns (uint256);
}

struct FundManagement {
    address sender;
    bool fromInternalBalance;
    address recipient;
    bool toInternalBalance;
}

enum SwapKind {
    GIVEN_IN,
    GIVEN_OUT
}

struct SingleSwap {
    bytes32 poolId;
    SwapKind kind;
    address assetIn;
    address assetOut;
    uint256 amount;
    bytes userData;
}

contract SwapAndBurnUSDCtoCAPL is AccessControl {
    using SafeERC20 for IERC20;

    uint256 private constant MAX_UINT = 2**256 - 1;

    bytes32 public poolId;
    address public capl;
    address public usdc;

    IVault VAULT;
    address public vault;

    constructor(
        address _capl,
        address _usdc,
        address _vault,
        uint256 _poolId
    ) {
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

    function swap() internal {
        uint256 internalBalance = IERC20(usdc).balanceOf(address(this));
        if (internalBalance == 0) {
            return;
        }

        SingleSwap memory Swap = SingleSwap(
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

        VAULT.swap(Swap, fundManagement, 0, block.timestamp + 10 minutes);
    }

    function burn() internal {
        // get the returned CAPL balance
        uint256 caplBalance = IERC20(capl).balanceOf(address(this));

        // burn returned CAPL
        ICAPL(capl).burn(caplBalance);
    }

    function swapAndBurn() public {
        // swap the internal contract balance to the CAPL
        swap();

        // burn capl contract balance
        burn();
    }

    // this will recieve usdc from the nft revenue controller, swap to capl and return to the nft owner.
    function swapAndSend(
        address _token,
        uint256 _amount,
        address _destination
    ) external {
        // swap&burn current contract balance
        swapAndBurn();

        // request transfer capl amount
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // swap token to capl
        swap();

        // get the returned CAPL balance
        uint256 caplBalance = IERC20(capl).balanceOf(address(this));

        // transfer swaped CAPL to the nft owner
        IERC20(capl).safeTransfer(_destination, caplBalance);
    }

    /**
        @dev - this funciton withdraws a token amount from the this contract - emergency withdraw
     */
    function emergencyWithdraw(address _token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, balance);
    }
}
