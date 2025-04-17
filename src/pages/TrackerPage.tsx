
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, Plus, Clock, MapPin, FileText, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnalyticsWidget from "@/components/widgets/AnalyticsWidget";

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

// Mock data for analytics
const analyticsData = [
  { day: 'Mon', minutes: 35 },
  { day: 'Tue', minutes: 20 },
  { day: 'Wed', minutes: 45 },
  { day: 'Thu', minutes: 30 },
  { day: 'Fri', minutes: 60 },
  { day: 'Sat', minutes: 75 },
  { day: 'Sun', minutes: 45 },
];

// Mock data for notes
const notesData = [
  {
    id: 1,
    title: "Vaccination Reminder",
    content: "Buddy's annual vaccines are due next month. Call vet to schedule appointment.",
    date: "2025-04-10",
    tags: ["health", "reminder"]
  },
  {
    id: 2,
    title: "New Food Transition",
    content: "Started transition to grain-free kibble. Monitor for any digestive issues or allergies.",
    date: "2025-04-15",
    tags: ["nutrition", "health"]
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

const NotesWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center">
        <FileText className="mr-2" size={18} />
        Pet Notes
      </CardTitle>
      <CardDescription>Important reminders</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {notesData.map(note => (
        <div key={note.id} className="p-3 border rounded-md bg-card/50">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium">{note.title}</h3>
            <span className="text-xs text-muted-foreground">{note.date}</span>
          </div>
          <p className="text-xs mt-1 text-muted-foreground">{note.content}</p>
          <div className="flex gap-1 mt-2">
            {note.tags.map(tag => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full">
        <Plus size={14} className="mr-1" /> Add Note
      </Button>
    </CardFooter>
  </Card>
);

const TrackerPage = () => {
  const [activeTab, setActiveTab] = useState("activities");
  const [isNewActivityDialogOpen, setIsNewActivityDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "Walk",
    petName: "Buddy",
    duration: "30",
    location: "Local Park",
  });

  const handleAddActivity = () => {
    // In a real app, this would add the activity to a database
    // For now, we'll just show a success message
    toast.success(`New ${newActivity.type} activity added`);
    setIsNewActivityDialogOpen(false);
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Tracker</h1>
        <p className="text-muted-foreground">Track your pet's activities & goals</p>
      </div>
      
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsNewActivityDialogOpen(true)}>
          <Plus size={18} className="mr-1" /> New Activity
        </Button>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="space-y-4">
          <div className="mb-4">
            <AnalyticsWidget 
              data={analyticsData} 
              title="Activity Overview" 
              description="Daily activity minutes"
              showViewDetails={false}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Activities</h3>
            {recentActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Current Goals</h3>
            <Button variant="outline" size="sm">
              <Plus size={16} className="mr-1" /> Add Goal
            </Button>
          </div>
          
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <NotesWidget />
        </TabsContent>
      </Tabs>
      
      {/* New Activity Dialog */}
      <Dialog open={isNewActivityDialogOpen} onOpenChange={setIsNewActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
            <DialogDescription>
              Record a new activity for your pet
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activity-type">Activity Type</Label>
              <Select 
                defaultValue={newActivity.type}
                onValueChange={(value) => setNewActivity({...newActivity, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Walk">Walk</SelectItem>
                  <SelectItem value="Play">Play</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Grooming">Grooming</SelectItem>
                  <SelectItem value="Vet Visit">Vet Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="pet-name">Pet</Label>
              <Select 
                defaultValue={newActivity.petName}
                onValueChange={(value) => setNewActivity({...newActivity, petName: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buddy">Buddy</SelectItem>
                  <SelectItem value="Luna">Luna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input 
                id="duration" 
                type="number"
                value={newActivity.duration} 
                onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={newActivity.location} 
                onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewActivityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackerPage;
