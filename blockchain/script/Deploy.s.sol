// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FreelanceEscrow} from "../src/FreelanceEscrow.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Определяем treasury wallet на основе сети
        address treasuryWallet;
        uint256 currentChainId = block.chainid;
        
        if (currentChainId == 80001 || currentChainId == 80002) { // Mumbai/Amoy testnet
            treasuryWallet = 0x742d35Cc6635c0532925a3B8D5C9e9C16b8b2E2e;
        } else if (currentChainId == 137) { // Polygon mainnet
            treasuryWallet = 0x742d35Cc6635c0532925a3B8D5C9e9C16b8b2E2e;
        } else if (currentChainId == 8453 || currentChainId == 84532) { // Base
            treasuryWallet = 0x742d35Cc6635c0532925a3B8D5C9e9C16b8b2E2e;
        } else if (currentChainId == 42161 || currentChainId == 421614) { // Arbitrum
            treasuryWallet = 0x742d35Cc6635c0532925a3B8D5C9e9C16b8b2E2e;
        } else {
            // Fallback to env variable or deployer
            treasuryWallet = vm.envOr("TREASURY_WALLET", vm.addr(deployerPrivateKey));
        }
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying FreelanceEscrow...");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasuryWallet);

        FreelanceEscrow escrow = new FreelanceEscrow(treasuryWallet);
        
        console.log("FreelanceEscrow deployed at:", address(escrow));

        // Add supported tokens based on network
        console.log("Chain ID:", currentChainId);
        
        if (currentChainId == 80001) { // Mumbai
            console.log("Adding Mumbai tokens...");
            escrow.addSupportedToken(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // USDC
            escrow.addSupportedToken(0xc2132D05D31c914a87C6611C10748AEb04B58e8F); // USDT
            escrow.addSupportedToken(0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063); // DAI
        } else if (currentChainId == 80002) { // Amoy
            console.log("Adding Amoy tokens...");
            escrow.addSupportedToken(0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582); // USDC
        } else if (currentChainId == 137) { // Polygon
            console.log("Adding Polygon tokens...");
            escrow.addSupportedToken(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // USDC
            escrow.addSupportedToken(0xc2132D05D31c914a87C6611C10748AEb04B58e8F); // USDT
            escrow.addSupportedToken(0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063); // DAI
        }

        vm.stopBroadcast();
        
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Contract address:", address(escrow));
        console.log("Update your config:");
        console.log("PLATFORM_CONTRACTS[chainId].escrow =", address(escrow));
    }
}
