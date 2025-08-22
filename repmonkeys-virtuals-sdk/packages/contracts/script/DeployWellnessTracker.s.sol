// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/WellnessTracker.sol";

contract DeployWellnessTracker is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting with the private key
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the enhanced WellnessTracker contract
        WellnessTracker wellnessTracker = new WellnessTracker();
        
        // Log deployment information
        console.log("Enhanced WellnessTracker deployed at:", address(wellnessTracker));
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Private key loaded successfully");
        console.log("New features: Workout, Meditation, Meal (with macros), Sleep tracking");
        
        vm.stopBroadcast();
    }
}
