// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FreelanceEscrow} from "../src/FreelanceEscrow.sol";

/**
 * @title DeployMainnet
 * @dev Production deployment script with additional security checks
 */
contract DeployMainnet is Script {
    // Production treasury wallets
    address constant POLYGON_TREASURY = 0xfdCc732Be626Db71b096c36b8de7C8471B3708bE;
    address constant BASE_TREASURY = 0xfdCc732Be626Db71b096c36b8de7C8471B3708bE;
    address constant ARBITRUM_TREASURY = 0xfdCc732Be626Db71b096c36b8de7C8471B3708bE;
    
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 chainId = block.chainid;
        
        // Security checks before deployment
        require(deployerPrivateKey != 0, "PRIVATE_KEY not set");
        require(chainId == 137 || chainId == 8453 || chainId == 42161, "Only mainnet deployments");
        
        address treasuryWallet = getTreasuryWallet(chainId);
        require(treasuryWallet != address(0), "Invalid treasury wallet");
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== MAINNET DEPLOYMENT ===");
        console.log("Chain ID:", chainId);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Treasury:", treasuryWallet);
        
        // Deploy contract
        FreelanceEscrow escrow = new FreelanceEscrow(treasuryWallet);
        address escrowAddress = address(escrow);
        
        console.log("FreelanceEscrow deployed at:", escrowAddress);

        // Post-deployment security checks
        require(escrow.owner() == vm.addr(deployerPrivateKey), "Owner mismatch");
        require(escrow.treasuryWallet() == treasuryWallet, "Treasury mismatch");
        require(escrow.platformFeePercentage() == 1000, "Fee percentage mismatch"); // 10%
        require(!escrow.paused(), "Contract should not be paused");

        // Add supported tokens based on network
        addSupportedTokens(escrow, chainId);

        // Verify arbitrator setup
        require(escrow.arbitrators(vm.addr(deployerPrivateKey)), "Deployer should be arbitrator");

        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Contract:", escrowAddress);
        console.log("Treasury:", treasuryWallet);
        console.log("Platform Fee:", "10%");
        
        // Post-deployment instructions
        console.log("\n=== NEXT STEPS ===");
        console.log("1. Verify contract on explorer");
        console.log("2. Update frontend config with new address");
        console.log("3. Set up monitoring and alerts");
        console.log("4. Transfer ownership to multisig (recommended)");
        console.log("5. Announce deployment to community");
        
        // Verification command
        console.log("\n=== VERIFICATION ===");
        console.log("Run: forge verify-contract", escrowAddress, "FreelanceEscrow");
        console.log("Args:", treasuryWallet);
    }

    function getTreasuryWallet(uint256 chainId) internal pure returns (address) {
        if (chainId == 137) return POLYGON_TREASURY; // Polygon
        if (chainId == 8453) return BASE_TREASURY; // Base
        if (chainId == 42161) return ARBITRUM_TREASURY; // Arbitrum
        return address(0);
    }

    function addSupportedTokens(FreelanceEscrow escrow, uint256 chainId) internal {
        console.log("Adding supported tokens...");
        
        if (chainId == 137) { // Polygon
            escrow.addSupportedToken(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // USDC
            escrow.addSupportedToken(0xc2132D05D31c914a87C6611C10748AEb04B58e8F); // USDT
            escrow.addSupportedToken(0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063); // DAI
            console.log("Added Polygon tokens: USDC, USDT, DAI");
        } 
        else if (chainId == 8453) { // Base
            escrow.addSupportedToken(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913); // USDC
            escrow.addSupportedToken(0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb); // DAI
            console.log("Added Base tokens: USDC, DAI");
        }
        else if (chainId == 42161) { // Arbitrum
            escrow.addSupportedToken(0xaf88d065e77c8cC2239327C5EDb3A432268e5831); // USDC
            escrow.addSupportedToken(0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9); // USDT
            escrow.addSupportedToken(0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1); // DAI
            console.log("Added Arbitrum tokens: USDC, USDT, DAI");
        }
    }
}
