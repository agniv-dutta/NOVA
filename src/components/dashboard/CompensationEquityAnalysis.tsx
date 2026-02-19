import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCompensationData } from "@/utils/mockAnalyticsData";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Scatter, ReferenceLine } from "recharts";

export default function CompensationEquityAnalysis() {
  const data = generateCompensationData();
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "compensation-equity.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Transform data for box plot visualization
  const transformedData = data.map((d, i) => ({
    category: `${d.department}\n${d.role}`,
    index: i,
    min: d.min,
    q1: d.q1,
    median: d.median,
    q3: d.q3,
    max: d.max,
    salaries: d.salaries,
    outliers: d.salaries.filter(s => 
      s < d.q1 - 1.5 * (d.q3 - d.q1) || s > d.q3 + 1.5 * (d.q3 - d.q1)
    ),
  })).slice(0, 8); // Show subset for readability

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-xs mb-2">{item.category.replace('\n', ' - ')}</p>
          <div className="space-y-1 text-xs">
            <p>Max: ${(item.max / 1000).toFixed(0)}k</p>
            <p>Q3 (75%): ${(item.q3 / 1000).toFixed(0)}k</p>
            <p className="font-semibold">Median: ${(item.median / 1000).toFixed(0)}k</p>
            <p>Q1 (25%): ${(item.q1 / 1000).toFixed(0)}k</p>
            <p>Min: ${(item.min / 1000).toFixed(0)}k</p>
            {item.outliers.length > 0 && (
              <p className="text-orange-600 font-semibold mt-2">
                {item.outliers.length} outlier(s)
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate gender pay gap (mock data)
  const genderPayGap = 8.5; // percentage

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compensation Equity Analysis</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                label={{ value: 'Salary ($k)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Box plot components using custom shapes */}
              {transformedData.map((item, index) => (
                <g key={index}>
                  {/* Vertical line from min to max */}
                  <line
                    x1={index * 100 + 50}
                    y1={item.min}
                    x2={index * 100 + 50}
                    y2={item.max}
                    stroke="#64748b"
                    strokeWidth={1}
                  />
                  
                  {/* Box from Q1 to Q3 */}
                  <rect
                    x={index * 100 + 30}
                    y={Math.min(item.q1, item.q3)}
                    width={40}
                    height={Math.abs(item.q1 - item.q3)}
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    stroke="#1e40af"
                    strokeWidth={1}
                  />
                  
                  {/* Median line */}
                  <line
                    x1={index * 100 + 30}
                    y1={item.median}
                    x2={index * 100 + 70}
                    y2={item.median}
                    stroke="#1e40af"
                    strokeWidth={2}
                  />
                </g>
              ))}

              {/* Outliers as scatter points */}
              <Scatter 
                data={transformedData.flatMap((d, i) => 
                  d.outliers.map(salary => ({ x: i, y: salary }))
                )}
                fill="#f97316"
                shape="circle"
              />

              {/* Gender pay gap reference line (if applicable) */}
              {genderPayGap > 0 && (
                <ReferenceLine 
                  y={100000} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Gender Pay Gap Indicator', position: 'right', fill: '#ef4444', fontSize: 10 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              ${(data.reduce((sum, d) => sum + d.median, 0) / data.length / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-muted-foreground">Avg Median Salary</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {transformedData.reduce((sum, d) => sum + d.outliers.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Outliers Detected</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{genderPayGap}%</p>
            <p className="text-xs text-muted-foreground">Gender Pay Gap</p>
          </div>
        </div>

        {/* Alert for equity issues */}
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-orange-800">
              <strong>Equity Review Needed:</strong> {transformedData.reduce((sum, d) => sum + d.outliers.length, 0)} employees 
              flagged as compensation outliers (&gt;1.5x IQR). Gender pay gap of {genderPayGap}% exceeds policy threshold.
            </p>
            <Button variant="link" className="p-0 h-auto text-orange-700 text-sm mt-1">
              View detailed equity report →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
