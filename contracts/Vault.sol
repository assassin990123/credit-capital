//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICAPL {
    function mint(address _to, uint256 _amount) external;
}

contract Vault is Pausable, AccessControl {
    bytes32 public constant minter = keccak256("MINTER");

    // owner of vault contract
    address private _owner;

    // access control roles definition
    // reward token
    address public capl;

    // the Treasury funded via platform fees upon deposit & withdraw
    address public treasury;

    // 0.1% platform fee
    uint256 public constant depositFee = 1; // 1%

    // standard constants
    uint256 public constant MULTIPLIER = 1e6;
    uint256 public constant ONE_HUNDRED = 100;
    
    mapping(address => Pool) public Pools;

    struct Pool {
        uint256 totalPooled;    // total generic token pooled in the contract
        uint256 totalUsers;
    }

    event DepositVault(address user, address token, uint256 amount);
    event WithdrawVault(address user, address token, uint256 amount);
    event WithdrawAllVault(address user, address token);
    event WithdrawToken(address token, uint amount, address destination);

    // TBD: Assume creation with one pool required (?)
    constructor (address _capl, address _treasury) {
        capl = _capl;
        _owner = msg.sender;
        treasury = _treasury;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(minter, msg.sender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    
    function depositVault(address _user, address _token, uint256 _amount) external {
        require(_amount > 0, "Amount 0");

        Pool storage pool = Pools[_token];

        // platform fee
        _transferDepositFee(_user, _token, _amount);
        IERC20(_token).transferFrom(_user, address(this), _amount);
        
        // update the pool info
        pool.totalPooled += _amount;

        if (!checkIfPoolExists(_token)) {
            pool.totalUsers += 1;
        }

        // trigger the depositVault event
        emit DepositVault(_user, _token, _amount);
    }

    function withdrawVault(address _user, address _token, uint256 _amount) external {
        Pool storage pool = Pools[_token];

        require(pool.totalPooled > 0, "Nothing to withdraw");
        require(pool.totalPooled >= _amount, "Amount: exceed the pooled amount");

        // withdraw the token to user wallet
        IERC20(_token).transferFrom(address(this), _user, _amount);
        
        // update the pool info
        pool.totalPooled -= _amount;

        emit WithdrawVault(_user, _token, _amount);
    }
   
    /*
        Read functions
    */
    function getPoolInfo(address _token) external view returns (Pool memory) {
        return Pools[_token];
    }

    function getPools() external view returns (Pool[] memory) {}

    function checkIfPoolExists(address _token) public view returns (bool) {
        return Pools[_token].totalUsers != 0;
    }
   
    /*
        Admin functions
        TODO: Add RBAC for all
    */
    function mintCapl(address _to, uint256 _amount) external {
        // should consider the limit per day - 5000 CAPL/day

        ICAPL(capl).mint(_to, _amount);
    }

    function addPool(address _token, uint256 _amount) external {
        require(!checkIfPoolExists(_token), "This pool already exists");
        Pools[_token] = Pool({
            totalPooled: _amount,
            totalUsers: 1
        });
    }

    function withdrawToken(address _token, uint256 _amount, address _destination) external onlyOwner {
        Pool storage pool = Pools[_token];
        
        require(_amount > 0 && pool.totalPooled >= _amount);
        
        // withdraw the token to user wallet
        IERC20(_token).transferFrom(address(this), _destination, _amount);

        // update the pooled amount
        pool.totalPooled -= _amount;

        emit WithdrawToken(_token, _amount, _destination);
    }

    function withdrawMATIC(address _destination) external onlyOwner {
    }

    function withdrawAllVault(address _user, address _token) external onlyOwner {
        Pool storage pool = Pools[_token];

        // withdraw the token to user wallet
        IERC20(_token).transferFrom(address(this), _user, pool.totalPooled);

        pool.totalPooled = 0;
        pool.totalUsers -= 1;

        emit WithdrawAllVault(_user, _token);
    }

    // transfer the platform fee
    function _transferDepositFee(address _user, address _token, uint256 _amount) private {
        uint currentDepositFee = (_amount * depositFee) / ONE_HUNDRED;
        _amount -= currentDepositFee;
        IERC20(_token).transferFrom(_user, treasury, currentDepositFee);
    }
}