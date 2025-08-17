// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WellToken
 * @dev ERC-20 token for the wellness application
 * - Fixed maximum supply of 1,000,000,000 tokens
 * - Initial supply goes to the deployer
 * - Used for rewarding user activity
 */
contract WellToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens with 18 decimals
    
    constructor() ERC20("Well Token", "WELL") Ownable(msg.sender) {
        // Mint initial supply to the deployer
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev Override decimals to return 18
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Function to mint additional tokens (only owner)
     * Note: This is disabled since we have a fixed supply
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
}
