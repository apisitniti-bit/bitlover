import { Line, LineChart, ResponsiveContainer } from "recharts";

type SparklineProps = {
  change: number;
};

export const Sparkline = ({ change }: SparklineProps) => {
  // Generate mock sparkline data based on change
  const generateData = () => {
    const points = 20;
    const data = [];
    const trend = change > 0 ? 1 : -1;
    
    for (let i = 0; i < points; i++) {
      const randomVariation = Math.random() * 10 - 5;
      const trendValue = (i / points) * Math.abs(change) * trend;
      data.push({
        value: 100 + trendValue + randomVariation
      });
    }
    return data;
  };

  const data = generateData();
  const color = change >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
