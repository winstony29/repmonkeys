// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title WellnessNFT
 * @dev ERC-721 NFT representing user wellness profiles
 * - Each user gets one NFT representing their wellness profile
 * - Metadata URI points to IPFS with Sogni AI generated artwork
 * - Only owner can mint new NFTs
 */
contract WellnessNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    
    // Mapping to track if a user already has an NFT
    mapping(address => bool) public hasProfile;
    
    // Mapping to track user's token ID
    mapping(address => uint256) public userTokenId;
    
    // Events
    event NFTMinted(address indexed user, uint256 indexed tokenId, string uri);
    
    constructor() ERC721("Wellness Profile", "WELLP") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new wellness profile NFT (owner only)
     * @param to Address to mint the NFT to
     * @param uri IPFS URI containing metadata and artwork
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        require(!hasProfile[to], "User already has a profile");
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        hasProfile[to] = true;
        userTokenId[to] = newTokenId;
    }
    
    /**
     * @dev Mint a new wellness profile NFT (user minting)
     * @param uri IPFS URI containing metadata and artwork
     */
    function mintWellnessNFT(string memory uri) public {
        require(!hasProfile[msg.sender], "User already has a profile");
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        hasProfile[msg.sender] = true;
        userTokenId[msg.sender] = newTokenId;
        
        emit NFTMinted(msg.sender, newTokenId, uri);
    }
    
    /**
     * @dev Get the token ID for a specific user
     * @param user Address of the user
     * @return Token ID if user has a profile, 0 otherwise
     */
    function getUserTokenId(address user) public view returns (uint256) {
        return userTokenId[user];
    }
    
    /**
     * @dev Check if a user has a wellness profile
     * @param user Address of the user
     * @return True if user has a profile, false otherwise
     */
    function userHasProfile(address user) public view returns (bool) {
        return hasProfile[user];
    }
    
    /**
     * @dev Get total number of NFTs minted
     * @return Total count of NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Get all NFTs for a user (if you want to allow multiple NFTs per user)
     * @param user Address of the user
     * @return Array of token IDs owned by the user
     */
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        uint256[] memory userTokens = new uint256[](balanceOf(user));
        uint256 tokenIndex = 0;
        
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_ownerOf(i) == user) {
                userTokens[tokenIndex] = i;
                tokenIndex++;
            }
        }
        
        return userTokens;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

