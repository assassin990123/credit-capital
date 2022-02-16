interface IVault {
    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

    function REWARDS() external view returns (bytes32);

    function addPool(address _token, uint256 _rewardsPerSecond) external;

    function addStake(
        address _token,
        address _user,
        uint256 _amount
    ) external;

    function addUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function checkIfPoolExists(address _token) external view returns (bool);

    function checkIfUserPositionExists(address _token, address _user)
        external
        view
        returns (bool);

    function getLastStake(address _token, address _user)
        external
        view
        returns (tuple);

    function getLastStakeKey(address _token, address _user)
        external
        view
        returns (uint256);

    function getPool(address _token) external view returns (tuple);

    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    function getTokenSupply(address _token) external view returns (uint256);

    function getUnlockedAmount(address _token, address _user)
        external
        returns (uint256);

    function getUserPosition(address _token, address _user)
        external
        view
        returns (tuple);

    function getUserStakedPosition(address _token, address _user)
        external
        returns (uint256);

    function grantRole(bytes32 role, address account) external;

    function hasRole(bytes32 role, address account)
        external
        view
        returns (bool);

    function paused() external view returns (bool);

    function renounceRole(bytes32 role, address account) external;

    function revokeRole(bytes32 role, address account) external;

    function setPool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardTime
    ) external returns (tuple);

    function setStake(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _stakeId
    ) external;

    function setUserDebt(
        address _token,
        address _user,
        uint256 rewardDebt
    ) external;

    function setUserPosition(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _rewardDebt
    ) external;

    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function updatePool(
        address _token,
        uint256 _accCaplPerShare,
        uint256 _lastRewardTime
    ) external returns (tuple);

    function withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _newRewardDebt
    ) external;

    function withdrawMATIC() external;

    function withdrawToken(
        address _token,
        uint256 _amount,
        address _destination
    ) external;
}
