import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateHiringFunnelData } from "@/utils/mockAnalyticsData";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function HiringFunnel() {
  const { current, previous } = generateHiringFunnelData();
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "hiring-funnel.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Combine data for side-by-side comparison
  const combinedData = current.map((curr, i) => ({
    stage: curr.stage,
    currentCount: curr.count,
    previousCount: previous[i].count,
    currentConversion: curr.conversionRate,
    previousConversion: previous[i].conversionRate,
  }));

  const funnelColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c026d3'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-blue-600">Current Q:</span>
              <span className="font-medium">{data.currentCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Previous Q:</span>
              <span className="font-medium">{data.previousCount}</span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="flex justify-between gap-4">
                <span className="text-blue-600">Conversion:</span>
                <span className="font-medium">{data.currentConversion}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Prev Conversion:</span>
                <span className="font-medium">{data.previousConversion}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const calculateTimeToFill = () => {
    // Mock calculation: average days from Applied to Accepted
    return 42; // days
  };

  const calculateOverallConversion = () => {
    const accepted = current.find(s => s.stage === 'Accepted')?.count || 0;
    const applied = current.find(s => s.stage === 'Applied')?.count || 1;
    return ((accepted / applied) * 100).toFixed(1);
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hiring Funnel & Time-to-Fill</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          {/* Funnel visualization */}
          <div className="mb-6">
            {current.map((stage, index) => {
              const width = 100 - (index * 15);
              const prevStage = index > 0 ? current[index - 1] : null;
              const conversionFromPrev = prevStage 
                ? ((stage.count / prevStage.count) * 100).toFixed(0)
                : 100;

              return (
                <div key={index} className="mb-2">
                  <div 
                    className="relative mx-auto rounded-lg flex items-center justify-between px-6 py-4 transition-all hover:scale-105"
                    style={{ 
                      width: `${width}%`,
                      backgroundColor: funnelColors[index],
                      minWidth: '200px'
                    }}
                  >
                    <div className="text-white">
                      <p className="font-semibold text-sm">{stage.stage}</p>
                      <p className="text-xs opacity-90">
                        {index > 0 && `${conversionFromPrev}% conversion`}
                      </p>
                    </div>
                    <div className="text-white text-right">
                      <p className="text-2xl font-bold">{stage.count}</p>
                      {index > 0 && (
                        <p className="text-xs opacity-90">
                          {stage.count > previous[index].count ? '▲' : '▼'} {Math.abs(stage.count - previous[index].count)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-side comparison chart */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="stage" 
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                label={{ value: 'Candidates', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="currentCount" name="Current Quarter" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previousCount" name="Previous Quarter" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{calculateTimeToFill()}</p>
            <p className="text-xs text-muted-foreground">Avg Time-to-Fill (days)</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{calculateOverallConversion()}%</p>
            <p className="text-xs text-muted-foreground">Overall Conversion</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <p className="text-2xl font-bold text-green-600">+8%</p>
            </div>
            <p className="text-xs text-muted-foreground">vs Last Quarter</p>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Performance:</strong> Interview-to-Offer conversion improved from 34% to 33%. 
            Focus on screening stage to reduce time-to-fill by 15%.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
