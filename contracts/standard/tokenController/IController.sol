//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

interface IController {
    function CAPL() external view returns (address);

    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

    function MINTER() external view returns (bytes32);

    function addMinter(address _account) external;

    function burn(uint256 amount) external;

    function burner() external view returns (address);

    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    function grantRole(bytes32 role, address account) external;

    function hasRole(bytes32 role, address account)
        external
        view
        returns (bool);

    function mint(address destination, uint256 amount) external;

    function renounceRole(bytes32 role, address account) external;

    function revokeRole(bytes32 role, address account) external;

    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
