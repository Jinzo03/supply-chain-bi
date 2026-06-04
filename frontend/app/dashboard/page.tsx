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
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

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
  const [totalShipments] = useState<number>(3); 
  const [spoiledCount, setSpoiledCount] = useState<number>(0);
  
  const [lossChartData, setLossChartData] = useState<any>(null);
  const [tempChartData, setTempChartData] = useState<any>(null);
  const [rawLogs, setRawLogs] = useState<any[]>([]); // Saved for CSV export

  // Main function to fetch and build charts
  const fetchBIAnalytics = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, supplyChainAbi.abi, provider);

      const spoiledFilter = contract.filters.AssetSpoiled();
      const spoiledEvents = await contract.queryFilter(spoiledFilter, 0, "latest");

      const telemetryFilter = contract.filters.TelemetryLogged();
      const telemetryEvents = await contract.queryFilter(telemetryFilter, 0, "latest");

      // --- Process Financial Data ---
      let lossAccumulator = 0;
      const assetLabels: string[] = [];
      const lossValues: number[] = [];
      const exportData: any[] = [];

      spoiledEvents.forEach((event: any) => {
        const assetId = event.args[0].toString();
        const lossValueUSD = Number(event.args[1]);
        lossAccumulator += lossValueUSD;

        assetLabels.push(`Asset #${assetId}`);
        lossValues.push(lossValueUSD);
        exportData.push({ assetId, incident: "Temperature Breach", loss: lossValueUSD, block: event.blockNumber });
      });

      setTotalLoss(lossAccumulator);
      setSpoiledCount(spoiledEvents.length);
      setRawLogs(exportData);

      setLossChartData({
        labels: assetLabels,
        datasets: [{
          label: "Financial Loss (USD)",
          data: lossValues,
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        }],
      });

      // --- Process Telemetry Data ---
      const sortedTelemetry = [...telemetryEvents].sort((a: any, b: any) => 
        Number(a.args[2]) - Number(b.args[2])
      );

      const timeLabels = sortedTelemetry.map((_, index) => `Log ${index + 1}`);
      const temperatures = sortedTelemetry.map((event: any) => Number(event.args[1]));

      setTempChartData({
        labels: timeLabels,
        datasets: [{
          label: "Recorded Temperature (°C)",
          data: temperatures,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.3,
          pointRadius: 5,
        }],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error building BI metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBIAnalytics();

    // Set up Real-Time Blockchain Listener
    const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, supplyChainAbi.abi, provider);
    
    // When a new temperature is logged, automatically refresh the charts
    contract.on("TelemetryLogged", () => {
      console.log("New block mined! Refreshing BI data...");
      fetchBIAnalytics();
    });

    return () => {
      contract.removeAllListeners("TelemetryLogged");
    };
  }, []);

  // CSV Export Utility for Analyse Financière
  const downloadCSV = () => {
    const headers = ["Asset ID,Incident Type,Financial Loss (USD),Block Number"];
    const rows = rawLogs.map(log => `${log.assetId},${log.incident},${log.loss},${log.block}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_audit_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8 text-center text-xl text-gray-400">Syncing with Blockchain...</div>;
  }

  const efficiencyRate = ((totalShipments - spoiledCount) / totalShipments) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <header className="flex justify-between items-end mb-10 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent">
            Supply Chain BI Platform
          </h1>
          <p className="text-sm text-gray-400 mt-1">Immutable Decentralized Ledger Audit & Financial Analytics</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
        >
          Download CSV Audit Report
        </button>
      </header>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-xl border border-red-500/20 shadow-lg">
          <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Total Financial Loss</h2>
          <p className="text-4xl font-black text-red-500 mt-2">${totalLoss.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-blue-500/20 shadow-lg">
          <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Supply Chain Efficiency</h2>
          <p className="text-4xl font-black text-blue-400 mt-2">{efficiencyRate.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-green-500/20 shadow-lg flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Ledger Health</h2>
            <p className="text-4xl font-black text-green-400 mt-2">SECURE</p>
          </div>
          <span className="relative flex h-4 w-4 mt-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-200">Financial Loss Allocation</h3>
          {lossChartData && (
            <div className="h-64">
              <Bar data={lossChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-200">Global Temperature Timeline</h3>
          {tempChartData && (
            <div className="h-64">
              <Line data={tempChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}