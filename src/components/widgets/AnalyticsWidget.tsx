
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";

// Analytics data type
interface AnalyticsDataItem {
  day: string;
  minutes: number;
}

interface AnalyticsWidgetProps {
  data: AnalyticsDataItem[];
  title?: string;
  description?: string;
  compact?: boolean;
  showViewDetails?: boolean;
  showBack?: boolean;
  backPath?: string;
  showMoreDetail?: boolean;
}

const AnalyticsWidget = ({ 
  data, 
  title = "Weekly Activity", 
  description = "Daily activity minutes", 
  compact = false,
  showViewDetails = true,
  showBack = false,
  backPath = "/",
  showMoreDetail = false
}: AnalyticsWidgetProps) => {
  const navigate = useNavigate();

  // Chart configuration
  const chartConfig = {
    activity: {
      label: "Activity",
      theme: {
        light: "#0ea5e9",
        dark: "#0ea5e9",
      },
    },
    trend: {
      label: "Trend",
      theme: {
        light: "#38bdf8",
        dark: "#38bdf8",
      }
    }
  };

  // Calculate max value for better chart scaling
  const maxMinutes = Math.max(...data.map(item => item.minutes));
  const chartHeight = compact ? 120 : showMoreDetail ? 300 : 200;

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : ""}>
        <CardTitle className={compact ? "text-base" : "text-lg flex items-center"}>
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(backPath)} className="mr-2">
              <ChevronLeft size={18} />
            </Button>
          )}
          {!compact && <BarChart3 className="mr-2" size={18} />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: chartHeight }}>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              {!showMoreDetail ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis 
                    fontSize={12} 
                    domain={[0, maxMinutes + 10]} 
                    tickCount={5} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="minutes" 
                    name="activity" 
                    fill="var(--color-activity)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              ) : (
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis 
                    fontSize={12} 
                    domain={[0, maxMinutes + 10]} 
                    tickCount={5} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone"
                    dataKey="minutes" 
                    name="activity" 
                    stroke="var(--color-activity)"
                    strokeWidth={2}
                    dot={{ r: 4 }} 
                  />
                  <Line 
                    type="monotone"
                    dataKey="minutes" 
                    name="trend" 
                    stroke="var(--color-trend)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      {showViewDetails && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/insights")}>
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AnalyticsWidget;
