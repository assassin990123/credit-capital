// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyToken is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    // @dev - NFT transfer locks
    mapping(uint => bool) locks;

    // @dev - NFT on chain data
    struct NFTData {
        string name;
        string description;
        uint value; // in dollars
        uint timelockEnd;
    }

    mapping(uint => NFTData) metadataOnChain;

    constructor() ERC721("MyToken", "MTK") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /** Getters */
    function getMetadataOnChain(uint _tokenId) external view returns (NFTData memory) {
        return metadataOnChain[_tokenId];
    }

    function lockNFT(uint _tokenId, uint _timelock) external {
        require(ownerOf(_tokenId) == msg.sender, "Permission: the sender is not the owner of this token");
        metadataOnChain[_tokenId].timelockEnd = block.timestamp + _timelock;
    }

    function safeMint(address to, string memory uri, string calldata name, string calldata description, uint value) public onlyRole(MINTER_ROLE) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        metadataOnChain[tokenId] = NFTData(
            name,
            description,
            value,
            block.timestamp
        );
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        require(metadataOnChain[tokenId].timelockEnd <= block.timestamp, "Timelock: Locked token");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}