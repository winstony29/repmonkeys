// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

contract TestPrivateKey is Script {
    function run() external {
        // Test if private key can be loaded
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address walletAddress = vm.addr(privateKey);
        
        console.log("Private key loaded successfully");
        console.log("Wallet address:", walletAddress);
        
        // Test if we can sign with this private key
        bytes32 messageHash = keccak256("Hello World");
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, messageHash);
        
        console.log("Signing test successful");
        console.log("Message hash:", vm.toString(messageHash));
        console.log("Signature v:", v);
        console.log("Signature r:", vm.toString(r));
        console.log("Signature s:", vm.toString(s));
    }
}
