#!/usr/bin/env node

import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Devnet connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

async function testDevnetConnection() {
  console.log('🌐 Testing Devnet Connection...');
  
  try {
    // Get current slot to test connection
    const slot = await connection.getSlot();
    console.log(`📊 Current slot: ${slot}`);
    
    // Test with a known account (System Program)
    const systemProgramBalance = await connection.getBalance(new PublicKey('11111111111111111111111111111111'));
    console.log(`💰 System Program balance: ${systemProgramBalance / LAMPORTS_PER_SOL} SOL`);
    
    return true;
  } catch (error) {
    console.error('❌ Devnet connection failed:', error);
    return false;
  }
}

async function testWalletFunding() {
  console.log('\n💳 Testing Wallet Funding...');
  
  try {
    // Generate a test keypair
    const testKeypair = Keypair.generate();
    console.log(`🔑 Generated test wallet: ${testKeypair.publicKey.toString()}`);
    
    // Check initial balance
    let balance = await connection.getBalance(testKeypair.publicKey);
    console.log(`💰 Initial balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    if (balance === 0) {
      console.log('💧 Requesting airdrop (may take a moment)...');
      
      try {
        const airdropSignature = await connection.requestAirdrop(
          testKeypair.publicKey,
          2 * LAMPORTS_PER_SOL // Request 2 SOL
        );
        
        console.log(`📝 Airdrop signature: ${airdropSignature}`);
        
        // Wait for confirmation
        await connection.confirmTransaction(airdropSignature, 'confirmed');
        
        // Check new balance
        balance = await connection.getBalance(testKeypair.publicKey);
        console.log(`✅ New balance after airdrop: ${balance / LAMPORTS_PER_SOL} SOL`);
        
        return { keypair: testKeypair, balance };
      } catch (airdropError) {
        console.log('⚠️  Airdrop failed (rate limited). You can manually fund via:');
        console.log(`   https://faucet.solana.com/ with address: ${testKeypair.publicKey.toString()}`);
        return { keypair: testKeypair, balance: 0 };
      }
    }
    
    return { keypair: testKeypair, balance };
  } catch (error) {
    console.error('❌ Wallet funding test failed:', error);
    return null;
  }
}

async function checkProgramDeployment() {
  console.log('\n🏗️  Checking Program Deployment...');
  
  const programId = new PublicKey('FundrProgram11111111111111111111111111111111');
  
  try {
    const accountInfo = await connection.getAccountInfo(programId);
    
    if (accountInfo) {
      console.log('✅ Program found on devnet');
      console.log(`📊 Program data length: ${accountInfo.data.length} bytes`);
      console.log(`💰 Program account balance: ${accountInfo.lamports / LAMPORTS_PER_SOL} SOL`);
      console.log(`🏠 Program owner: ${accountInfo.owner.toString()}`);
      return true;
    } else {
      console.log('❌ Program not deployed yet');
      console.log('📝 To deploy, run: anchor build && anchor deploy --provider.cluster devnet');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking program:', error);
    return false;
  }
}

async function simulateFundOperations(wallet) {
  console.log('\n🎯 Simulating Fund Operations...');
  
  if (!wallet || wallet.balance === 0) {
    console.log('⚠️  Skipping fund operations - no funded wallet available');
    return;
  }
  
  console.log('📝 Fund operations that would be possible:');
  console.log(`   • Create fund (requires ~0.01 SOL for rent)`);
  console.log(`   • Deposit ${(wallet.balance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
  console.log(`   • Calculate shares based on fund NAV`);
  console.log(`   • Withdraw funds with fee calculation`);
  console.log(`   • Rebalance portfolio through Jupiter swaps`);
  
  // Show estimated costs
  const rentExemption = await connection.getMinimumBalanceForRentExemption(1000);
  console.log(`💸 Estimated costs:`);
  console.log(`   • Fund creation: ${(rentExemption / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
  console.log(`   • Transaction fees: ~0.000005 SOL per transaction`);
  console.log(`   • Platform fee: 1% of deposits/withdrawals`);
}

async function main() {
  console.log('🚀 Fundr Devnet Testing Suite\n');
  
  // Test basic connectivity
  const connected = await testDevnetConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without devnet connection');
    process.exit(1);
  }
  
  // Test wallet funding
  const wallet = await testWalletFunding();
  
  // Check if program is deployed
  const programDeployed = await checkProgramDeployment();
  
  // Simulate operations
  await simulateFundOperations(wallet);
  
  // Summary
  console.log('\n📋 SUMMARY:');
  console.log(`✅ Devnet connection: Working`);
  console.log(`${wallet?.balance > 0 ? '✅' : '⚠️'} Test wallet: ${wallet?.balance > 0 ? 'Funded' : 'Needs funding'}`);
  console.log(`${programDeployed ? '✅' : '❌'} Program deployment: ${programDeployed ? 'Ready' : 'Needed'}`);
  
  console.log('\n🎯 NEXT STEPS:');
  
  if (!programDeployed) {
    console.log('1. Install Solana CLI: curl -sSfL https://release.solana.com/v1.18.4/install | sh');
    console.log('2. Generate keypair: solana-keygen new');
    console.log('3. Set devnet: solana config set --url https://api.devnet.solana.com');
    console.log('4. Fund keypair: solana airdrop 2');
    console.log('5. Deploy program: anchor build && anchor deploy --provider.cluster devnet');
  } else {
    console.log('1. Connect wallet in frontend');
    console.log('2. Create test fund');
    console.log('3. Test deposit/withdraw cycle');
    console.log('4. Test rebalancing with Jupiter');
  }
  
  if (wallet?.keypair) {
    // Save test wallet for later use
    const walletData = {
      publicKey: wallet.keypair.publicKey.toString(),
      secretKey: Array.from(wallet.keypair.secretKey),
      balance: wallet.balance / LAMPORTS_PER_SOL,
      network: 'devnet',
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'test-wallet.json'),
      JSON.stringify(walletData, null, 2)
    );
    
    console.log('\n💾 Test wallet saved to test-wallet.json');
    console.log('⚠️  Keep this file secure - it contains your private key!');
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testDevnetConnection, testWalletFunding, checkProgramDeployment };