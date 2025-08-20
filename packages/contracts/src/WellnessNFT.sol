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
    
    constructor() ERC721("Wellness Profile", "WELLP") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new wellness profile NFT
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
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WellnessNFT
 * @dev ERC-721 NFT representing user wellness profiles with on-chain activity logging.
 */
contract WellnessNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // --- NEW: Wellness Activity Struct ---
    struct WellnessActivity {
        uint256 timestamp;
        uint256 sleepDuration; // in minutes
        uint256 sleepQuality; // 1-5 rating
        string fitnessActivityType;
        uint256 fitnessDuration; // in minutes
    }

    mapping(address => bool) public hasProfile;
    mapping(address => uint256) public userTokenId;

    // --- NEW: Mapping for wellness data ---
    mapping(uint256 => WellnessActivity[]) public wellnessLog;

    event ActivityLogged(uint256 indexed tokenId, uint256 timestamp);

    constructor() ERC721("Wellness Profile", "WELLP") Ownable(msg.sender) {}

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

    // --- NEW: Function to log wellness data ---
    function logWellnessActivity(
        uint256 tokenId,
        uint256 sleepDuration,
        uint256 sleepQuality,
        string calldata fitnessActivityType,
        uint256 fitnessDuration
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        wellnessLog[tokenId].push(WellnessActivity({
            timestamp: block.timestamp,
            sleepDuration: sleepDuration,
            sleepQuality: sleepQuality,
            fitnessActivityType: fitnessActivityType,
            fitnessDuration: fitnessDuration
        }));

        emit ActivityLogged(tokenId, block.timestamp);
    }

    function getUserTokenId(address user) public view returns (uint256) {
        return userTokenId[user];
    }

    function userHasProfile(address user) public view returns (bool) {
        return hasProfile[user];
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}