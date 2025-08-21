// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/WellToken.sol";
import "../src/WellnessNFT.sol";
import "../src/Rewards.sol";
import "../src/UserProfile.sol";

/**
 * @title DeployScript
 * @dev Script to deploy all wellness application contracts
 */
contract DeployScript is Script {
    function run() external {
        // Use private key for deployment (can be set via environment variable)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy WellToken first
        WellToken wellToken = new WellToken();
        console.log("WellToken deployed at:", address(wellToken));
        
        // Deploy WellnessNFT
        WellnessNFT wellnessNFT = new WellnessNFT();
        console.log("WellnessNFT deployed at:", address(wellnessNFT));
        
        // Deploy UserProfile contract
        UserProfile userProfile = new UserProfile();
        console.log("UserProfile deployed at:", address(userProfile));
        
        // Deploy Rewards contract with WellToken address
        Rewards rewards = new Rewards(address(wellToken));
        console.log("Rewards deployed at:", address(rewards));
        
        // Fund the rewards contract with some tokens for distribution
        // Transfer 10% of total supply to rewards contract
        uint256 fundingAmount = wellToken.totalSupply() / 10;
        wellToken.transfer(address(rewards), fundingAmount);
        console.log("Funded rewards contract with:", fundingAmount);
        
        vm.stopBroadcast();
        
        console.log("=== Deployment Summary ===");
        console.log("WellToken:", address(wellToken));
        console.log("WellnessNFT:", address(wellnessNFT));
        console.log("UserProfile:", address(userProfile));
        console.log("Rewards:", address(rewards));
        console.log("Total supply:", wellToken.totalSupply());
        console.log("Rewards funding:", fundingAmount);
    }
}

