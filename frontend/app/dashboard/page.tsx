"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import supplyChainAbi from "../../abi/SupplyChain.json";
// The contract address you got when you deployed
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCAL_RPC_URL = "http://127.0.0.1:8545";

export default function BIDashboard() {
  const [totalLoss, setTotalLoss] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [spoiledEvents, setSpoiledEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBlockchainData() {
      try {
        // 1. Connect to our local Hardhat node running in Terminal 1
        const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
        
        // 2. Instantiate our contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, supplyChainAbi.abi, provider);

        // 3. Query all past "AssetSpoiled" events from the very first block (0) to the latest
        console.log("Fetching supply chain logs from immutable ledger...");
        const filter = contract.filters.AssetSpoiled();
        const events = await contract.queryFilter(filter, 0, "latest");

        // 4. Process data for Business Intelligence / Financial Analysis
        let lossAccumulator = 0;
        const processedEvents = events.map((event: any) => {
          // In ethers v6, event arguments are found in event.args
          const assetId = event.args[0].toString();
          const lossValueUSD = Number(event.args[1]);
          
          lossAccumulator += lossValueUSD;

          return {
            assetId,
            lossValueUSD,
            blockNumber: event.blockNumber,
          };
        });

        setTotalLoss(lossAccumulator);
        setSpoiledEvents(processedEvents);
        setLoading(false);
      } catch (error) {
        console.error("Error reading from blockchain:", error);
        setLoading(false);
      }
    }

    fetchBlockchainData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading BI Metrics from Blockchain...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Supply Chain BI & Financial Dashboard</h1>
      
      {/* Financial KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-red-500/30">
          <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Total Financial Loss (Spoiled Cargo)</h2>
          <p className="text-4xl font-extrabold text-red-500 mt-2">${totalLoss.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30">
          <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Ledger Status</h2>
          <p className="text-4xl font-extrabold text-green-400 mt-2">Connected</p>
          <p className="text-xs text-gray-500 mt-1">Reading local testnet via Ethers.js</p>
        </div>
      </div>

      {/* Raw Ledger Audit Table */}
      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Immutable Incident Log (Blockchain Audit Trail)</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="py-2">Asset ID</th>
              <th className="py-2">Incident Type</th>
              <th className="py-2 text-right">Financial Loss (USD)</th>
            </tr>
          </thead>
          <tbody>
            {spoiledEvents.map((evt, idx) => (
              <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3">Asset #{evt.assetId}</td>
                <td className="py-3 text-red-400 font-medium">Temperature Threshold Breached</td>
                <td className="py-3 text-right text-red-400 font-bold">${evt.lossValueUSD.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}