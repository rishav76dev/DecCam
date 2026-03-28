import { ethers } from "ethers";

// Simple Campaign ABI 
const CampaignABI = [
  "function submissions(uint256) view returns (address creator, string link, uint256 views, uint256 reward, bool paid)",
  "function setViews(uint256 index, uint256 views) external",
  "function finalizeResults() external"
];

async function runCampaignWorker() {
  // 1. Setup Provider & Wallet
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
  const brandWallet = new ethers.Wallet(process.env.PRIVATE_KEY || "0x_BRAND_PRIVATE_KEY", provider);
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000";
  
  const campaign = new ethers.Contract(contractAddress, CampaignABI, brandWallet);

  console.log("Fetching submissions to log views off-chain...");
  let index = 0;
  
  // 2. Iterate Submissions & Update Views
  while (true) {
    try {
      const sub = await campaign.submissions(index);
      
      // MOCK: Fetch metrics from offchain APIs
      const mockFetchedViews = Math.floor(Math.random() * 500) + 10;
      
      console.log(`Setting ${mockFetchedViews} views for submission [${index}] -> ${sub.link}`);
      
      const tx = await campaign.setViews(index, mockFetchedViews);
      await tx.wait(); 
      
      index++;
    } catch (e) {
      break;
    }
  }

  if (index === 0) {
      console.log("No submissions found.");
      return;
  }

  // 3. Finalize Network Results 
  console.log("Calling finalizeResults()...");
  const txFinal = await campaign.finalizeResults();
  await txFinal.wait();

  console.log("Campaign completely finalized! Creators can now securely claim their allocated piece of the pool.");
}

runCampaignWorker().catch(console.error);
