// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FreelanceEscrow} from "../src/FreelanceEscrow.sol";

contract DeployTestnet is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasuryWallet = 0xfdCc732Be626Db71b096c36b8de7C8471B3708bE;
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== TESTNET DEPLOYMENT ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasuryWallet);
        console.log("Chain ID:", block.chainid);

        FreelanceEscrow escrow = new FreelanceEscrow(treasuryWallet);
        
        console.log("FreelanceEscrow deployed at:", address(escrow));

        // Add testnet USDT (most important for testing)
        if (block.chainid == 80002) { // Amoy
            escrow.addSupportedToken(0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582); // USDC
            console.log("Added Amoy USDC");
        } else if (block.chainid == 80001) { // Mumbai  
            escrow.addSupportedToken(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // USDC
            console.log("Added Mumbai USDC");
        }

        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Contract Address:", address(escrow));
        console.log("Treasury Wallet:", treasuryWallet);
        console.log("Platform Fee: 10%");
        
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Copy contract address to frontend config");
        console.log("2. Test with small amounts first");
        console.log("3. Verify contract on explorer");
    }
}
