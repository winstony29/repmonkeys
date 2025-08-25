// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/WellToken.sol";
import "../src/WellnessTracker.sol";
import "../src/WellnessNFT.sol";
import "../src/UserProfile.sol";
import "../src/Rewards.sol";

contract DeployMainnet is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting with the private key
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying WellSpace Wellness Contracts to Base Mainnet...");
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Network: Base Mainnet (Chain ID: 8453)");
        console.log("RPC: https://mainnet.base.org");
        console.log("Explorer: https://basescan.org");
        console.log("");
        
        // Deploy the WellToken contract first
        console.log("Deploying WellToken...");
        WellToken wellToken = new WellToken();
        console.log("WellToken deployed at:", address(wellToken));
        
        // Deploy the enhanced WellnessTracker contract
        console.log("Deploying WellnessTracker...");
        WellnessTracker wellnessTracker = new WellnessTracker();
        console.log("WellnessTracker deployed at:", address(wellnessTracker));
        
        // Deploy the WellnessNFT contract
        console.log("Deploying WellnessNFT...");
        WellnessNFT wellnessNFT = new WellnessNFT();
        console.log("WellnessNFT deployed at:", address(wellnessNFT));
        
        // Deploy the UserProfile contract
        console.log("Deploying UserProfile...");
        UserProfile userProfile = new UserProfile();
        console.log("UserProfile deployed at:", address(userProfile));
        
        // Deploy the Rewards contract with WellToken address
        console.log("Deploying Rewards...");
        Rewards rewards = new Rewards(address(wellToken));
        console.log("Rewards deployed at:", address(rewards));
        
        console.log("");
        console.log("All contracts deployed successfully to Base Mainnet!");
        console.log("");
        console.log("Contract Addresses:");
        console.log("WellToken:", address(wellToken));
        console.log("WellnessTracker:", address(wellnessTracker));
        console.log("WellnessNFT:", address(wellnessNFT));
        console.log("UserProfile:", address(userProfile));
        console.log("Rewards:", address(rewards));
        console.log("");
        console.log("View on BaseScan: https://basescan.org");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        vm.stopBroadcast();
    }
}
