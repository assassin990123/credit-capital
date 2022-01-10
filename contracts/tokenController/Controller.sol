import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICAPL {
    function mint(address _to, uint256 _amount) external;
}

contract controller is AccessControl {
    // MINTER = mint & burn role
    bytes32 public constant minter = keccak256("MINTER");

    // address of CAPL token
    address public CAPL;

    // address of burner
    address public burner;

    event RoleCreated(uint256 role);
    event BearerAdded(address account, uint256 role);
    event BearerRemoved(address account, uint256 role);
    uint256 constant NO_ROLE = 0;
    /**
    * @notice A role, which will be used to group users.
    * @dev The role id is its position in the roles array.
    * @param description A description for the role.
    * @param admin The only role that can add or remove bearers from
    * this role. To have the role bearers to be also the role admins 
    * you should pass roles.length as the admin role.
    * @param bearers Addresses belonging to this role.
    */
    struct Role {
        string description;
        uint256 admin;
        mapping (address => bool) bearers;
    }
    /**
    * @notice All roles ever created.
    */
    Role[] public roles;

    constructor(address _CAPL, address _burner) {
        CAPL = _CAPL;
        burner = _burner;

        addRootRole("NO_ROLE");
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(minter, msg.sender);
    }
    // Add RBAC
    function mint(address destination, uint256 amount) external onlyRole(minter) {
        ICAPL(CAPL).mint(destination, amount);
    }
    // Add RBAC
    function burn(uint256 amount) external onlyOwner {
        ICAPL(CAPL).safeTransfer(burner, amount);
    }

    /**
    * @notice Create a new role that has itself as an admin. 
    * msg.sender is added as a bearer.
    * @param _roleDescription The description of the role created.
    * @return The role id.
    */
    function addRootRole(string memory _roleDescription)
        public
        returns(uint256)
    {
        uint256 role = addRole(_roleDescription, roles.length);
        roles[role].bearers[msg.sender] = true;
        emit BearerAdded(msg.sender, role);
    }
    /**
    * @notice Create a new role.
    * @param _roleDescription The description of the role created.
    * @param _admin The role that is allowed to add and remove
    * bearers from the role being created.
    * @return The role id.
    */
    function addRole(string memory _roleDescription, uint256 _admin)
        public
        returns(uint256)
    {
        require(_admin <= roles.length, "Admin role doesn't exist.");
        uint256 role = roles.push(
        Role({
            description: _roleDescription,
            admin: _admin
        })
        ) - 1;
        emit RoleCreated(role);
        return role;
    }
    /**
    * @notice Retrieve the number of roles in the contract.
    * @dev The zero position in the roles array is reserved for
    * NO_ROLE and doesn't count towards this total.
    */
    function totalRoles()
        public
        view
        returns(uint256)
    {
        return roles.length - 1;
    }
    /**
    * @notice Verify whether an account is a bearer of a role
    * @param _account The account to verify.
    * @param _role The role to look into.
    * @return Whether the account is a bearer of the role.
    */
    function hasRole(address _account, uint256 _role)
        public
        view
        returns(bool)
    {
        return _role < roles.length && roles[_role].bearers[_account];
    }
    /**
    * @notice A method to add a bearer to a role
    * @param _account The account to add as a bearer.
    * @param _role The role to add the bearer to.
    */
    function addBearer(address _account, uint256 _role)
        public
    {
        require(
        _role < roles.length,
        "Role doesn't exist."
        );
        require(
        hasRole(msg.sender, roles[_role].admin),
        "User can't add bearers."
        );
        require(
        !hasRole(_account, _role),
        "Account is bearer of role."
        );
        roles[_role].bearers[_account] = true;
        emit BearerAdded(_account, _role);
    }
    /**
    * @notice A method to remove a bearer from a role
    * @param _account The account to remove as a bearer.
    * @param _role The role to remove the bearer from.
    */
    function removeBearer(address _account, uint256 _role)
        public
    {
        require(
        _role < roles.length,
        "Role doesn't exist."
        );
        require(
        hasRole(msg.sender, roles[_role].admin),
        "User can't remove bearers."
        );
        require(
        hasRole(_account, _role),
        "Account is not bearer of role."
        );
        delete roles[_role].bearers[_account];
        emit BearerRemoved(_account, _role);
    }
}