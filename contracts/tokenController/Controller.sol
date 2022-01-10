import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract controller is AccessControl {
    // MINTER = mint & burn role
    bytes32 public constant minter = keccak256("MINTER");

    constructor(address _CAPL) {

    }
    // Add RBAC
    function mint(address destination, uint256 amount) external {

    }
    // Add RBAC
    function burn(address destination, uint256 amount) external {

    }
}