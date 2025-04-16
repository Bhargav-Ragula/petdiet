
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Activity, TrendingUp, Award } from "lucide-react";

// Import recharts components for data visualization
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
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

const COLORS = ['#9b87f5', '#7dd3fc', '#86efac'];

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

const InsightsPage = () => {
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Activity className="mr-2 text-primary" size={18} />
                Weekly Activity
              </CardTitle>
              <CardDescription>Minutes spent on different activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="walk" name="Walking" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="play" name="Playing" fill="#7dd3fc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
        </TabsContent>
        
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 text-primary" size={18} />
                Weight Tracking
              </CardTitle>
              <CardDescription>Monthly weight progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} fontSize={12} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#9b87f5" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsPage;
