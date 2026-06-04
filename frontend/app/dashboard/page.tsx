"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import supplyChainAbi from "../../abi/SupplyChain.json";

// Import Chart.js essentials
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register ChartJS modules so React-Chartjs-2 can use them
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCAL_RPC_URL = "http://127.0.0.1:8545";

export default function BIDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [totalLoss, setTotalLoss] = useState<number>(0);
  const [totalShipments, setTotalShipments] = useState<number>(3); // Set from mock data
  const [spoiledCount, setSpoiledCount] = useState<number>(0);
  
  // Chart Data States
  const [lossChartData, setLossChartData] = useState<any>(null);
  const [tempChartData, setTempChartData] = useState<any>(null);

  useEffect(() => {
    async function fetchBIAnalytics() {
      try {
        const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, supplyChainAbi.abi, provider);

        // 1. Fetch ALL Spoiled Events for Financial Analysis
        const spoiledFilter = contract.filters.AssetSpoiled();
        const spoiledEvents = await contract.queryFilter(spoiledFilter, 0, "latest");

        // 2. Fetch ALL Telemetry Events for Temperature Tracking
        const telemetryFilter = contract.filters.TelemetryLogged();
        const telemetryEvents = await contract.queryFilter(telemetryFilter, 0, "latest");

        // --- Process Financial Data (Bar Chart) ---
        let lossAccumulator = 0;
        const assetLabels: string[] = [];
        const lossValues: number[] = [];

        spoiledEvents.forEach((event: any) => {
          const assetId = `Asset #${event.args[0].toString()}`;
          const lossValueUSD = Number(event.args[1]);
          lossAccumulator += lossValueUSD;

          assetLabels.push(assetId);
          lossValues.push(lossValueUSD);
        });

        setTotalLoss(lossAccumulator);
        setSpoiledCount(spoiledEvents.length);

        setLossChartData({
          labels: assetLabels,
          datasets: [
            {
              label: "Financial Loss (USD)",
              data: lossValues,
              backgroundColor: "rgba(239, 68, 68, 0.6)", // Red
              borderColor: "rgba(239, 68, 68, 1)",
              borderWidth: 1,
            },
          ],
        });

        // --- Process Telemetry Data (Line Chart) ---
        // Let's sort telemetry logs by timestamp (chronological order)
        const sortedTelemetry = [...telemetryEvents].sort((a: any, b: any) => 
          Number(a.args[2]) - Number(b.args[2])
        );

        const timeLabels = sortedTelemetry.map((_, index) => `Reading ${index + 1}`);
        const temperatures = sortedTelemetry.map((event: any) => Number(event.args[1]));

        setTempChartData({
          labels: timeLabels,
          datasets: [
            {
              label: "Recorded Temperature (°C)",
              data: temperatures,
              borderColor: "rgba(59, 130, 246, 1)", // Blue
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              tension: 0.3, // Curve smooth lines
              pointRadius: 5,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error building BI metrics:", error);
        setLoading(false);
      }
    }

    fetchBIAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xl text-gray-400">Aggregating Real-Time Blockchain Logs...</div>;
  }

  // Calculate supply chain efficiency metric
  const efficiencyRate = ((totalShipments - spoiledCount) / totalShipments) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-10 border-b border-gray-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent">
          Supply Chain Core Intelligence Platform
        </h1>
        <p className="text-sm text-gray-400 mt-1">Immutable Decentralized Ledger Audit & Financial Analytics</p>
      </header>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-xl border border-red-500/20 shadow-lg">
          <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Total Financial Loss</h2>
          <p className="text-4xl font-black text-red-500 mt-2">${totalLoss.toLocaleString()}</p>
          <p className="text-xs text-red-400/60 mt-1">From temperature critical failures</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-blue-500/20 shadow-lg">
          <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Supply Chain Efficiency</h2>
          <p className="text-4xl font-black text-blue-400 mt-2">{efficiencyRate.toFixed(1)}%</p>
          <p className="text-xs text-blue-400/60 mt-1">Successful vs compromised assets</p>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-xl border border-green-500/20 shadow-lg">
          <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Ledger Health Status</h2>
          <p className="text-4xl font-black text-green-400 mt-2">SECURE</p>
          <p className="text-xs text-green-400/60 mt-1">Connected to EDR-Simulated Local Node</p>
        </div>
      </div>

      {/* Chart Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Bar Chart */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-200">Financial Loss Allocation</h3>
          {lossChartData && (
            <div className="h-64">
              <Bar 
                data={lossChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { grid: { color: '#1f2937' } }, x: { grid: { display: false } } } 
                }} 
              />
            </div>
          )}
        </div>

        {/* Temperature Telemetry Line Chart */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-200">Global Temperature Timeline Logs</h3>
          {tempChartData && (
            <div className="h-64">
              <Line 
                data={tempChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { grid: { color: '#1f2937' } }, x: { grid: { display: false } } } 
                }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}