// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/WellnessNFT.sol";

contract DeployWellnessNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy WellnessNFT contract
        WellnessNFT wellnessNFT = new WellnessNFT();
        
        console.log("WellnessNFT deployed at:", address(wellnessNFT));
        console.log("Deployer:", msg.sender);
        
        vm.stopBroadcast();
    }
}
