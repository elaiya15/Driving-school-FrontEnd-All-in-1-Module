import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { Card, CardContent } from "./card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${URL}/api/v1/dashboard/organization`, {
          withCredentials: true, // if using cookies / auth
        });
        setStats(res.data.stats);

        // Format revenueData so chart can show multiple branches
        const data = res.data.revenueData || [];

        // Collect unique branch names
        const branchNames = [...new Set(data.map((d) => d.branch || "Unknown"))];
        setBranches(branchNames);

        // Transform into chart-friendly: group by year+month
        const grouped = {};
        data.forEach((item) => {
          const key = `${item.year}-${item.month}`;
          if (!grouped[key]) {
            grouped[key] = { month: `${item.month}/${item.year}` };
          }
          grouped[key][item.branch || "Unknown"] = item.total;
        });

        setRevenueData(Object.values(grouped));
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm text-gray-500">Total Branches</h2>
            <p className="text-xl font-bold">{stats.totalBranches || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm text-gray-500">Total Learners</h2>
            <p className="text-xl font-bold">{stats.totalLearners || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm text-gray-500">Total Instructors</h2>
            <p className="text-xl font-bold">{stats.totalInstructors || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-4">
        <h2 className="mb-4 font-semibold">Revenue Trends (Branch-wise)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {branches.map((branch, index) => (
              <Line
                key={branch}
                type="monotone"
                dataKey={branch}
                strokeWidth={2}
                stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7300"][index % 4]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
