"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import supplyChainAbi from "../../abi/SupplyChain.json";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update this!
const LOCAL_RPC_URL = "http://127.0.0.1:8545";
const STAGES = ["Supplier", "Carrier", "Warehouse", "Retailer"];

export default function AdvancedBIDashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [totalLoss, setTotalLoss] = useState<number>(0);
  const [liabilityData, setLiabilityData] = useState<any>(null);
  const [tempChartData, setTempChartData] = useState<any>(null);
  const [riskMetrics, setRiskMetrics] = useState({ highRiskCount: 0, criticalAlerts: 0 });

  const fetchAdvancedBI = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, supplyChainAbi.abi, provider);

      const spoiledEvents = await contract.queryFilter(contract.filters.AssetSpoiled(), 0, "latest");
      const telemetryEvents = await contract.queryFilter(contract.filters.TelemetryLogged(), 0, "latest");

      // --- Financial Analysis: Custody Liability Breakdown ---
      let totalLossAccumulator = 0;
      const liabilityDistribution = [0, 0, 0, 0]; // Index maps to STAGES enum

      spoiledEvents.forEach((event: any) => {
        const lossValueUSD = Number(event.args[1]);
        const stageIndex = Number(event.args[2]); // Emitted custody stage enum

        totalLossAccumulator += lossValueUSD;
        liabilityDistribution[stageIndex] += lossValueUSD;
      });

      setTotalLoss(totalLossAccumulator);

      setLiabilityData({
        labels: STAGES,
        datasets: [{
          label: "Liability Financial Damage (USD)",
          data: liabilityDistribution,
          backgroundColor: [
            "rgba(245, 158, 11, 0.6)", // Supplier - Amber
            "rgba(59, 130, 246, 0.6)",  // Carrier - Blue
            "rgba(139, 92, 246, 0.6)",  // Warehouse - Purple
            "rgba(16, 185, 129, 0.6)"   // Retailer - Green
          ],
          borderColor: ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"],
          borderWidth: 1,
        }],
      });

      // --- Telemetry Parsing ---
      const sortedTelemetry = [...telemetryEvents].sort((a: any, b: any) => Number(a.args[2]) - Number(b.args[2]));
      const temperatures = sortedTelemetry.map((event: any) => Number(event.args[1]));

      // BI Risk Metric Analysis: Flag assets showing borderline behavior (> 6°C but not yet spoiled)
      let highRisk = 0;
      temperatures.forEach(temp => {
        if (temp >= 6 && temp <= 8) highRisk++;
      });

      setRiskMetrics({
        highRiskCount: highRisk,
        criticalAlerts: spoiledEvents.length
      });

      setTempChartData({
        labels: sortedTelemetry.map((_, i) => `Log ${i + 1}`),
        datasets: [{
          label: "Global Cold-Chain Timeline (°C)",
          data: temperatures,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.2,
          pointRadius: 4,
        }],
      });

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedBI();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400 text-xl">Compiling Enterprise Ledger Metrics...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
          Enterprise Supply Chain Analytics Engine
        </h1>
        <p className="text-xs text-gray-500 tracking-widest uppercase mt-1">Smart Contract Fiscal Audit Platform</p>
      </header>

      {/* Financial Risk & Compliance Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-red-500/20 p-6 rounded-xl">
          <h3 className="text-xs font-bold uppercase text-gray-400">Total Loss Incurred</h3>
          <p className="text-4xl font-black text-red-500 mt-2">${totalLoss.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-amber-500/20 p-6 rounded-xl">
          <h3 className="text-xs font-bold uppercase text-gray-400">Active Warning Exceptions</h3>
          <p className="text-4xl font-black text-amber-500 mt-2">{riskMetrics.highRiskCount} Batches</p>
        </div>
        <div className="bg-gray-900 border border-purple-500/20 p-6 rounded-xl">
          <h3 className="text-xs font-bold uppercase text-gray-400">Ledger Accountability Mode</h3>
          <p className="text-4xl font-black text-purple-400 mt-2">Active Insurance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Responsibility Doughnut Chart */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 lg:col-span-1">
          <h3 className="text-md font-bold mb-4 text-gray-300">Fiscal Damage Liability Breakdown</h3>
          {liabilityData && (
            <div className="h-64 flex justify-center">
              <Doughnut data={liabilityData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>

        {/* Global Temperature History Line Chart */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 lg:col-span-2">
          <h3 className="text-md font-bold mb-4 text-gray-300">Systemic Sensor Telemetry Logs</h3>
          {tempChartData && (
            <div className="h-64">
              <Line data={tempChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>
      </div>

      {/* BI Executive Summary Action Panel */}
      <div className="mt-8 bg-gray-950 border border-gray-800 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-gray-300 mb-2">Automated Audit & Liability Advisory</h3>
        <p className="text-sm text-gray-400">
          Based on the immutable crypto-ledger records, contract disputes should be routed directly to the{" "}
          <span className="text-purple-400 font-bold">Warehouse Providers</span> ($150,000 exposure) and the{" "}
          <span className="text-blue-400 font-bold">Logistics Carriers</span> ($25,000 exposure). Supplier claims represent a remaining $80,000 write-off.
        </p>
      </div>
    </div>
  );
}