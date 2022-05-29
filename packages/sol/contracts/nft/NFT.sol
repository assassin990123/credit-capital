// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CCAssets is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    AccessControl
{
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant LOCKER_ROLE = keccak256("LOCKER_ROLE");
    Counters.Counter private _tokenIdCounter;

    // @dev - NFT on chain data
    struct NFTData {
        string name;
        string description;
        uint256 value; // in dollars
        bool isLocked;
    }

    mapping(uint256 => NFTData) metadataOnChain;

    constructor() ERC721("CreditCapital Asset", "CCAsset") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /** Getters */
    function getMetadataOnChain(uint256 _tokenId)
        external
        view
        returns (NFTData memory)
    {
        return metadataOnChain[_tokenId];
    }

    /** Setters */
    function setMetadataOnChain(uint256 _tokenId, string memory _name, uint256 _value, bool _isLocked)
        external
    {
        NFTData storage metadata = metadataOnChain[_tokenId];
        metadata.name = _name;
        metadata.value = _value;
        metadata.isLocked = _isLocked;
    }

    function handleLock(uint256 _tokenId, bool _lock)
        external
        onlyRole(LOCKER_ROLE)
    {
        metadataOnChain[_tokenId].isLocked = _lock;
    }

    function verifyLockedState(uint256 _tokenId) external view returns (bool) {
        return metadataOnChain[_tokenId].isLocked;
    }

    function safeMint(
        address to,
        string memory uri,
        string calldata name,
        string calldata description,
        uint256 value
    ) public onlyRole(MINTER_ROLE) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        metadataOnChain[tokenId] = NFTData(name, description, value, false);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        require(!metadataOnChain[tokenId].isLocked, "Denied: Locked token");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI)
        external
    {
        _setTokenURI(tokenId, _tokenURI);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
