
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Activity, TrendingUp, Award, ArrowUp, ArrowDown, Zap, ChevronLeft } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import AnalyticsWidget from "@/components/widgets/AnalyticsWidget";

// Import recharts components for data visualization
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

// Mock data for charts
const activityData = [
  { name: 'Mon', walk: 30, play: 15 },
  { name: 'Tue', walk: 20, play: 25 },
  { name: 'Wed', walk: 35, play: 20 },
  { name: 'Thu', walk: 25, play: 15 },
  { name: 'Fri', walk: 40, play: 30 },
  { name: 'Sat', walk: 60, play: 45 },
  { name: 'Sun', walk: 45, play: 30 },
];

const monthlyActivityData = [
  { week: 'Week 1', minutes: 120, target: 150 },
  { week: 'Week 2', minutes: 180, target: 150 },
  { week: 'Week 3', minutes: 140, target: 150 },
  { week: 'Week 4', minutes: 210, target: 150 },
];

const healthData = [
  { name: 'Week 1', weight: 15.2 },
  { name: 'Week 2', weight: 15.5 },
  { name: 'Week 3', weight: 15.3 },
  { name: 'Week 4', weight: 15.4 },
];

const nutritionData = [
  { name: 'Protein', value: 55 },
  { name: 'Carbs', value: 30 },
  { name: 'Fats', value: 15 },
];

const activityTypeData = [
  { name: 'Walking', value: 45 },
  { name: 'Playing', value: 25 },
  { name: 'Training', value: 15 },
  { name: 'Other', value: 15 },
];

const COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

// Detailed weekly data
const weeklyAnalyticsData = [
  { day: 'Mon', minutes: 35 },
  { day: 'Tue', minutes: 20 },
  { day: 'Wed', minutes: 45 },
  { day: 'Thu', minutes: 30 },
  { day: 'Fri', minutes: 60 },
  { day: 'Sat', minutes: 75 },
  { day: 'Sun', minutes: 45 },
];

// User streaks and statistics
const stats = [
  { label: "Current Streak", value: "7 days" },
  { label: "Longest Streak", value: "14 days" },
  { label: "This Week", value: "5 activities" },
  { label: "This Month", value: "23 activities" },
];

// Achievement badges
const achievements = [
  { 
    name: "Pet Parent", 
    description: "Recorded 10+ activities",
    icon: "🏆",
    completed: true 
  },
  { 
    name: "Walk Master", 
    description: "Completed 20+ walks",
    icon: "🥇",
    completed: true 
  },
  { 
    name: "Play Buddy", 
    description: "30+ minutes of play time",
    icon: "🎮",
    completed: true 
  },
  { 
    name: "Health Guardian", 
    description: "Track weight for 4 weeks",
    icon: "🩺",
    completed: false 
  },
];

// Activity trends
const trends = [
  {
    metric: "Weekly Activity",
    value: "310 minutes",
    change: "+12%",
    direction: "up"
  },
  {
    metric: "Walking Distance",
    value: "12.4 km",
    change: "+8%",
    direction: "up"
  },
  {
    metric: "Play Sessions",
    value: "6 sessions",
    change: "-10%",
    direction: "down"
  },
  {
    metric: "Rest Time",
    value: "46 hours",
    change: "+5%",
    direction: "up"
  }
];

const InsightsPage = () => {
  const navigate = useNavigate();
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [detailedMetric, setDetailedMetric] = useState("");
  
  // Chart configurations
  const activityChartConfig = {
    walk: {
      label: "Walking",
      theme: {
        light: "#0ea5e9",
        dark: "#0ea5e9",
      },
    },
    play: {
      label: "Playing",
      theme: {
        light: "#38bdf8",
        dark: "#38bdf8",
      },
    },
  };

  const weightChartConfig = {
    weight: {
      label: "Weight (kg)",
      theme: {
        light: "#0ea5e9",
        dark: "#0ea5e9",
      },
    },
  };

  const monthlyChartConfig = {
    minutes: {
      label: "Activity Minutes",
      theme: {
        light: "#0ea5e9",
        dark: "#0ea5e9",
      },
    },
    target: {
      label: "Target",
      theme: {
        light: "#38bdf8",
        dark: "#38bdf8",
      },
    },
  };

  const handleShowDetailedView = (metric) => {
    setDetailedMetric(metric);
    setShowDetailedView(true);
  };

  const renderDetailedView = () => {
    switch(detailedMetric) {
      case "activity":
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDetailedView(false)}
                className="mr-2"
              >
                <ChevronLeft size={18} />
              </Button>
              <h2 className="text-xl font-bold">Detailed Activity Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity Breakdown</CardTitle>
                  <CardDescription>Minutes per activity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer config={activityChartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Legend verticalAlign="top" height={36} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="walk" name="walk" fill="var(--color-walk)" radius={[4, 4, 0, 0]} stackId="a" />
                          <Bar dataKey="play" name="play" fill="var(--color-play)" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Progress</CardTitle>
                  <CardDescription>Activity vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer config={monthlyChartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyActivityData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="week" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Legend verticalAlign="top" height={36} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area 
                            type="monotone" 
                            dataKey="minutes" 
                            name="minutes" 
                            stroke="var(--color-minutes)" 
                            fill="var(--color-minutes)" 
                            fillOpacity={0.3} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="target" 
                            name="target" 
                            stroke="var(--color-target)" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trends.map((trend, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-sm text-muted-foreground">{trend.metric}</p>
                      <p className="text-2xl font-bold mt-2">{trend.value}</p>
                      <div className={`flex items-center mt-1 ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {trend.direction === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        <span className="text-sm font-medium ml-1">{trend.change}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Distribution</CardTitle>
                <CardDescription>Percentage by activity type</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {activityTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "health":
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDetailedView(false)}
                className="mr-2"
              >
                <ChevronLeft size={18} />
              </Button>
              <h2 className="text-xl font-bold">Detailed Health Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weight Tracking</CardTitle>
                  <CardDescription>Monthly progression</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer config={weightChartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} fontSize={12} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="weight"
                            name="Weight (kg)" 
                            stroke="#0ea5e9" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nutrition Breakdown</CardTitle>
                  <CardDescription>Current diet composition</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nutritionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {nutritionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">15.4</div>
                    <div className="text-sm text-muted-foreground mt-1">Weight (kg)</div>
                    <Badge variant="outline" className="mt-2">Healthy</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">98.7</div>
                    <div className="text-sm text-muted-foreground mt-1">Temperature (°F)</div>
                    <Badge variant="outline" className="mt-2">Normal</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground mt-1">Years</div>
                    <Badge variant="outline" className="mt-2">Young Adult</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">Good</div>
                    <div className="text-sm text-muted-foreground mt-1">Coat Condition</div>
                    <Badge variant="outline" className="mt-2">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (showDetailedView) {
    return renderDetailedView();
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pet Insights</h1>
        <p className="text-muted-foreground">Track your pet's progress over time</p>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="achievements">Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="mr-2 text-primary" size={18} />
                    Weekly Activity
                  </CardTitle>
                  <CardDescription>Minutes spent on different activities</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShowDetailedView("activity")}
                >
                  Detailed View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer config={activityChartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Legend />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="walk" name="walk" fill="var(--color-walk)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="play" name="play" fill="var(--color-play)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Performance Trends</CardTitle>
              <CardDescription>Week-over-week change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{trend.metric}</p>
                      <p className="text-sm text-muted-foreground">{trend.value}</p>
                    </div>
                    <div className={`flex items-center ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {trend.direction === 'up' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                      <span className="ml-1 font-medium">{trend.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div>
            <AnalyticsWidget 
              data={weeklyAnalyticsData} 
              showMoreDetail={true}
              title="Weekly Activity Trend Analysis" 
              description="Linear progression with trend line"
              showViewDetails={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="health" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="mr-2 text-primary" size={18} />
                    Weight Tracking
                  </CardTitle>
                  <CardDescription>Monthly weight progression</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShowDetailedView("health")}
                >
                  Detailed View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer config={weightChartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="weight"
                        name="weight" 
                        stroke="var(--color-weight)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 text-primary" size={18} />
                Nutrition Breakdown
              </CardTitle>
              <CardDescription>Current diet composition</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="h-48 w-48 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nutritionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {nutritionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Health Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Overall Health</span>
                  <Badge className="bg-green-500">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Last Vet Visit</span>
                  <span className="text-muted-foreground">30 days ago</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Upcoming Vaccinations</span>
                  <Badge variant="outline" className="text-amber-500">In 45 days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Award className="mr-2 text-primary" size={18} />
                Achievements
              </CardTitle>
              <CardDescription>Unlock badges by caring for your pet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`rounded-lg border p-3 flex items-center space-x-3 ${
                      achievement.completed ? 'bg-accent/50' : 'bg-muted/50 opacity-70'
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h4 className="text-sm font-medium">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Challenge</CardTitle>
              <CardDescription>Complete to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="font-medium mb-2">Active Week Challenge</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete at least 5 activities this week to earn the "Active Pet Parent" badge
                </p>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs mt-2">3/5 activities completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Zap className="mr-2 text-primary" size={18} />
                Pet Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Activities</p>
                    <p className="text-xl font-bold">84</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="text-xl font-bold">38.5 km</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Play Sessions</p>
                    <p className="text-xl font-bold">42</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Training Hours</p>
                    <p className="text-xl font-bold">18</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsPage;
