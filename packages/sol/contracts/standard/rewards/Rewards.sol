//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICAPL {
    function mint(address _destination, uint256 _amount) external;
}

interface IVault {
    function addPool(address _token, uint256 _rewardsPerSecond) external;

    function addPoolPosition(address _token, uint256 _amount) external;

    function removePoolPosition(address _token, uint256 _amount) external;

    function checkIfPoolExists(address _token) external view returns (bool);

    function updatePool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardTime
    ) external returns (IPool.Pool memory);

    function getPool(address _token) external returns (IPool.Pool memory);

    function checkIfUserPositionExists(address _token, address _user)
        external
        view
        returns (bool);

    /* update */
    function addUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function getUserPosition(address _token, address _user)
        external
        returns (IUserPositions.UserPosition memory);

    function setUserDebt(
        address _token,
        address _user,
        uint256 rewardDebt
    ) external;

    /* update */
    function getUnlockedAmount(address _token, address _user)
        external
        returns (uint256);

    function addStake(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function getLastStake(address _token, address _user)
        external
        returns (IStake.Stake memory);

    /* update */
    function setStake(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _stakeId
    ) external;

    function getLastStakeKey(address _token, address _user)
        external
        returns (uint256);

    function getTokenSupply(address _token) external returns (uint256);

    function withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _newRewardDebt
    ) external;
}

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 rewardsPerSecond; // rate at which CAPL is minted for this pool
        uint256 accCaplPerShare; // weighted CAPL share in pool
        uint256 lastRewardTime; // last time a claim was made
    }
}

interface IUserPositions {
    struct UserPosition {
        uint256 totalAmount; // total value staked by user in given pool
        uint256 rewardDebt; // house fee (?)
        uint256 userLastWithdrawnStakeIndex; // track the last unlocked index for each user's position in a pool, so that withdrawal iteration is less expensive
        bool staticLock; // guarantees a users stake is locked, even after timelock expiration
        bool autocompounding; // this userposition enables auto compounding (Auto restaking the rewards)
        IStake.Stake[] stakes; // list of user stakes in pool subject to timelock
    }
}

interface IStake {
    struct Stake {
        uint256 amount; // quantity staked
        uint256 startTime; // stake creation timestamp
        uint256 timeLockEnd; // The point at which the (4 yr, 4 mo, 4 day) timelock ends for a stake, and thus the funds can be withdrawn.
        bool active; // true = stake in vault, false = user withdrawn stake
    }
}

contract Rewards is Pausable, AccessControl {
    using SafeERC20 for IERC20;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    IVault vault;
    address vaultAddress;

    ICAPL capl;

    uint256 CAPL_PRECISION = 1e18;
    uint256 timelockThreshold = 1 weeks;

    event Claim(address indexed _token, address indexed _user, uint256 _amount);
    event Deposit(
        address indexed _token,
        address indexed _user,
        uint256 _amount
    );
    event PoolUpdated(address indexed _token, uint256 _block);
    event Withdraw(
        address indexed _token,
        address indexed _user,
        uint256 _amount
    );
    event AddPool(address _token, uint256 _rewardsPerSecond);
    event WithdrawMATIC(address destination, uint256 amount);

    mapping(address => mapping(address => bool)) autoCompoudLocks;

    constructor(address _vault, address _capl) {
        vault = IVault(_vault);
        capl = ICAPL(_capl);
        vaultAddress = _vault;
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function depositTest(address _token, uint256 _amount) external returns (bool) {
        require(vault.checkIfPoolExists(_token), "Pool does not exist");
        require(_amount > 0, "Deposit mount should not be 0");

        // update pool to current block
        IPool.Pool memory pool = updatePool(_token);

        uint256 rewardDebt = (_amount * pool.accCaplPerShare) / CAPL_PRECISION;

        if (!vault.checkIfUserPositionExists(_token, msg.sender)) {
            // new user position & new stake
            // no timelock
            vault.addUserPosition(_token, msg.sender, _amount, rewardDebt);
            return true;
        } else {
            vault.setUserPosition(_token, msg.sender, _amount, rewardDebt);

            return false;
            /*
            // check timelock
            IStake.Stake memory lastStake = vault.getLastStake(
                _token,
                msg.sender
            );

            if (checkTimelockThreshold(lastStake.startTime)) {
                // add a new stake for the user
                // this function adds a new stake, and a new stake key in the user position instance
                vault.addStake(_token, msg.sender, _amount);
            } else {
                uint256 lastStakeKey = vault.getLastStakeKey(
                    _token,
                    msg.sender
                );
                vault.setStake(_token, msg.sender, _amount, lastStakeKey);
            }
            */
        }

        IERC20(_token).safeTransferFrom(msg.sender, vaultAddress, _amount);
        vault.addPoolPosition(_token, _amount);

        emit Deposit(_token, msg.sender, _amount);
    }

    function deposit(address _token, uint256 _amount) external {
        require(vault.checkIfPoolExists(_token), "Pool does not exist");
        require(_amount > 0, "Deposit mount should not be 0");

        // update pool to current block
        IPool.Pool memory pool = updatePool(_token);

        uint256 rewardDebt = (_amount * pool.accCaplPerShare) / CAPL_PRECISION;

        if (!vault.checkIfUserPositionExists(_token, msg.sender)) {
            // new user position & new stake
            // no timelock
            vault.addUserPosition(_token, msg.sender, _amount, rewardDebt);
        } else {
            vault.setUserPosition(_token, msg.sender, _amount, rewardDebt);
            // check timelock
            IStake.Stake memory lastStake = vault.getLastStake(
                _token,
                msg.sender
            );

            if (checkTimelockThreshold(lastStake.startTime)) {
                // add a new stake for the user
                // this function adds a new stake, and a new stake key in the user position instance
                vault.addStake(_token, msg.sender, _amount);
            } else {
                uint256 lastStakeKey = vault.getLastStakeKey(
                    _token,
                    msg.sender
                );
                vault.setStake(_token, msg.sender, _amount, lastStakeKey);
            }
        }

        IERC20(_token).safeTransferFrom(msg.sender, vaultAddress, _amount);
        vault.addPoolPosition(_token, _amount);

        emit Deposit(_token, msg.sender, _amount);
    }

    function updatePool(address _token)
        public
        returns (IPool.Pool memory pool)
    {
        IPool.Pool memory cpool = vault.getPool(_token);
        uint256 tokenSupply = vault.getTokenSupply(_token);
        uint256 accCaplPerShare;
        if (block.timestamp > cpool.lastRewardTime) {
            if (tokenSupply > 0) {
                uint256 passedTime = block.timestamp - cpool.lastRewardTime;
                uint256 caplReward = passedTime * cpool.rewardsPerSecond;
                accCaplPerShare =
                    cpool.accCaplPerShare +
                    (caplReward * CAPL_PRECISION) /
                    tokenSupply;
            }
            uint256 lastRewardTime = block.timestamp;
            IPool.Pool memory npool = vault.updatePool(
                _token,
                accCaplPerShare,
                lastRewardTime
            );

            emit PoolUpdated(_token, lastRewardTime);
            return npool;
        }
    }

    function pendingRewards(address _token, address _user)
        external
        returns (uint256 pending)
    {
        IPool.Pool memory pool = vault.getPool(_token);
        IUserPositions.UserPosition memory user = vault.getUserPosition(
            _token,
            _user
        );

        uint256 accCaplPerShare = pool.accCaplPerShare;
        uint256 tokenSupply = vault.getTokenSupply(_token);

        if (block.timestamp > pool.lastRewardTime && tokenSupply != 0) {
            uint256 passedTime = block.timestamp - pool.lastRewardTime;
            uint256 caplReward = passedTime * pool.rewardsPerSecond;
            accCaplPerShare = accCaplPerShare + caplReward / tokenSupply;
        }
        pending =
            ((user.totalAmount * accCaplPerShare) / CAPL_PRECISION) -
            user.rewardDebt;
    }

    function claim(address _token, address _user) external returns (uint256) {
        IPool.Pool memory pool = updatePool(_token);
        IUserPositions.UserPosition memory user = vault.getUserPosition(
            _token,
            _user
        );

        uint256 accumulatedCapl = (user.totalAmount * pool.accCaplPerShare) /
            CAPL_PRECISION;

        uint256 pendingCapl = accumulatedCapl - user.rewardDebt;

        // _user.rewardDebt = accumulatedCapl
        vault.setUserDebt(_token, _user, accumulatedCapl);

        if (pendingCapl > 0) {
            capl.mint(_user, pendingCapl);
        }

        emit Claim(_token, _user, pendingCapl);
    }

    function withdraw(address _token, address _user) external {
        IPool.Pool memory pool = updatePool(_token);
        IUserPositions.UserPosition memory user = vault.getUserPosition(
            _token,
            _user
        );

        uint256 amount = vault.getUnlockedAmount(_token, _user);
        uint256 newRewardDebt;

        // check if the user withdraw token right after the first deposit
        if (user.rewardDebt > 0) {
            newRewardDebt =
                user.rewardDebt -
                (amount * pool.accCaplPerShare) /
                CAPL_PRECISION;
        }

        vault.withdraw(_token, _user, amount, newRewardDebt);
        vault.removePoolPosition(_token, amount);

        emit Withdraw(_token, _user, amount);
    }

    // TODO: Implement
    function checkTimelockThreshold(uint256 _startTime)
        internal
        view
        returns (bool)
    {
        return _startTime + timelockThreshold < block.timestamp;
    }

    // fallback functions
    function withdrawToken(
        address _token,
        uint256 _amount,
        address _destination
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {}

    function withdrawMATIC() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance > 0, "no matic to withdraw");
        uint256 balance = address(this).balance;

        payable(msg.sender).transfer(balance);

        emit WithdrawMATIC(msg.sender, balance);
    }

    function addPool(address _token, uint256 _rewardsPerSecond)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        vault.addPool(_token, _rewardsPerSecond);
    }
}
