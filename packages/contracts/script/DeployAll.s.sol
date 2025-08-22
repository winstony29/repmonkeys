// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/WellToken.sol";
import "../src/WellnessTracker.sol";
import "../src/WellnessNFT.sol";
import "../src/UserProfile.sol";
import "../src/Rewards.sol";

contract DeployAll is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting with the private key
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying WellSpace Wellness Contracts...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        // Deploy the WellToken contract first
        WellToken wellToken = new WellToken();
        console.log("WellToken deployed at:", address(wellToken));
        
        // Deploy the enhanced WellnessTracker contract
        WellnessTracker wellnessTracker = new WellnessTracker();
        console.log("Enhanced WellnessTracker deployed at:", address(wellnessTracker));
        
        // Deploy the WellnessNFT contract
        WellnessNFT wellnessNFT = new WellnessNFT();
        console.log("WellnessNFT deployed at:", address(wellnessNFT));
        
        // Deploy the UserProfile contract
        UserProfile userProfile = new UserProfile();
        console.log("UserProfile deployed at:", address(userProfile));
        
        // Deploy the Rewards contract with WellToken address
        Rewards rewards = new Rewards(address(wellToken));
        console.log("Rewards deployed at:", address(rewards));
        
        console.log("All contracts deployed successfully!");
        console.log("Contract Addresses:");
        console.log("WellToken:", address(wellToken));
        console.log("WellnessTracker:", address(wellnessTracker));
        console.log("WellnessNFT:", address(wellnessNFT));
        console.log("UserProfile:", address(userProfile));
        console.log("Rewards:", address(rewards));
        
        vm.stopBroadcast();
    }
}
