
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, Plus, Clock, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "Walk",
    petName: "Buddy",
    duration: "30 min",
    distance: "2.1 km",
    date: "Today, 10:30 AM",
    location: "Local Park",
    icon: "🦮"
  },
  {
    id: 2,
    type: "Play",
    petName: "Buddy",
    duration: "15 min",
    date: "Yesterday, 4:45 PM",
    location: "Home",
    icon: "🎾"
  },
  {
    id: 3,
    type: "Grooming",
    petName: "Luna",
    duration: "20 min",
    date: "Yesterday, 6:30 PM",
    location: "Home",
    icon: "🧼"
  }
];

// Mock data for goals
const goals = [
  {
    id: 1,
    name: "Daily walk",
    target: "30 minutes",
    progress: 100,
    icon: "🦮"
  },
  {
    id: 2,
    name: "Weekly playtime",
    target: "3 hours",
    progress: 65,
    icon: "🎾"
  },
  {
    id: 3,
    name: "Monthly vet checkup",
    target: "1 visit",
    progress: 0,
    icon: "🩺"
  }
];

const ActivityCard = ({ activity }: { activity: typeof recentActivities[0] }) => (
  <Card className="mb-3">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl mr-3">
            {activity.icon}
          </div>
          <div>
            <CardTitle className="text-base font-medium">{activity.type}</CardTitle>
            <CardDescription className="text-xs">{activity.petName}</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary/80">View</Button>
      </div>
    </CardHeader>
    <CardContent className="pb-3 text-sm grid grid-cols-2 gap-y-1">
      <div className="flex items-center text-muted-foreground">
        <Clock size={14} className="mr-1" />
        {activity.duration}
      </div>
      {activity.distance && (
        <div className="flex items-center text-muted-foreground">
          <Activity size={14} className="mr-1" />
          {activity.distance}
        </div>
      )}
      <div className="flex items-center text-muted-foreground">
        <Calendar size={14} className="mr-1" />
        {activity.date}
      </div>
      <div className="flex items-center text-muted-foreground">
        <MapPin size={14} className="mr-1" />
        {activity.location}
      </div>
    </CardContent>
  </Card>
);

const GoalCard = ({ goal }: { goal: typeof goals[0] }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
      {goal.icon}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-medium">{goal.name}</h4>
      <div className="flex items-center justify-between mt-1">
        <Progress value={goal.progress} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground ml-2">{goal.progress}%</span>
      </div>
    </div>
  </div>
);

const TrackerPage = () => {
  const [activeTab, setActiveTab] = useState("activities");

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Tracker</h1>
        <p className="text-muted-foreground">Track your pet's activities & goals</p>
      </div>
      
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-1" /> New Activity
        </Button>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Recent Activities</h3>
            <p className="text-sm text-muted-foreground">Your latest pet activities</p>
          </div>
          
          {recentActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
          
          <div className="text-center py-3">
            <Button variant="outline" className="w-full" size="sm">
              View All Activities
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Pet Care Goals</h3>
                <p className="text-sm text-muted-foreground">Track your pet care routines</p>
              </div>
              <Button variant="outline" size="sm">
                <Plus size={14} className="mr-1" /> Goal
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackerPage;
