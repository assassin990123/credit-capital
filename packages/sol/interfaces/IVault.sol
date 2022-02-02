//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

interface IVault {
    function addPool(
        address _token,
        uint256 _amount,
        uint256 _rewardsPerDay
    ) external;

    function checkIfPoolExists(address _token) external view returns (bool);

    function depositVault(address _token, uint256 _amount) external;

    function getPoolInfo(address _token)
        external
        view
        returns (IPool.Pool memory);

    function withdrawMATIC(address _destination) external;

    function withdrawToken(
        address _token,
        uint256 _amount,
        address _destination
    ) external;

    function withdrawVault(address _token, uint256 _amount) external;
}

interface IPool {
    struct Pool {
        uint256 totalPooled; // total token pooled in the contract
        uint256 totalUsers; // total number of active participants
        uint256 rewardsPerDay; // rate at which CAPL is minted for this pool
    }
}
