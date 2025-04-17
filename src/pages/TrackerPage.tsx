
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, Plus, Clock, MapPin, BarChart3, FileText, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Widget types
type WidgetType = "tracker" | "analytics" | "notes" | "goals";

// Widget definition
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: JSX.Element;
}

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
  const [widgets, setWidgets] = useState<Widget[]>([
    { 
      id: "tracker-1", 
      type: "tracker", 
      title: "Recent Activities", 
      icon: <Activity size={16} />
    }
  ]);

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === "tracker" 
        ? "Recent Activities" 
        : type === "analytics" 
          ? "Activity Analytics" 
          : type === "notes" 
            ? "Pet Notes" 
            : "Pet Goals",
      icon: type === "tracker" 
        ? <Activity size={16} />
        : type === "analytics" 
          ? <BarChart3 size={16} />
          : type === "notes" 
            ? <FileText size={16} />
            : <Calendar size={16} />
    };
    setWidgets([...widgets, newWidget]);
    toast.success(`Added ${newWidget.title} widget`);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
    toast.info("Widget removed");
  };

  const renderWidget = (widget: Widget) => {
    switch(widget.type) {
      case "tracker":
        return (
          <div className="space-y-4" key={widget.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{widget.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            {recentActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
            <div className="text-center py-3">
              <Button variant="outline" className="w-full" size="sm">
                View All Activities
              </Button>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-4" key={widget.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{widget.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            <AnalyticsWidget data={analyticsData} title="Activity Analytics" description="Daily activity minutes" />
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4" key={widget.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{widget.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            <NotesWidget />
          </div>
        );
      case "goals":
        return (
          <div className="space-y-4" key={widget.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{widget.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Tracker</h1>
        <p className="text-muted-foreground">Track your pet's activities & goals</p>
      </div>
      
      <div className="flex justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <Plus size={18} className="mr-1" /> Add Widget
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <h3 className="font-medium">Add Widget</h3>
              <p className="text-sm text-muted-foreground">Choose a widget type to add to your dashboard</p>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => addWidget("tracker")}
                >
                  <Activity className="mr-2" size={16} />
                  Activity Tracker
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => addWidget("analytics")}
                >
                  <BarChart3 className="mr-2" size={16} />
                  Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => addWidget("notes")}
                >
                  <FileText className="mr-2" size={16} />
                  Notes
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => addWidget("goals")}
                >
                  <Calendar className="mr-2" size={16} />
                  Goals
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-1" /> New Activity
        </Button>
      </div>

      <div className="space-y-8">
        {widgets.map(renderWidget)}
      </div>
    </div>
  );
};

export default TrackerPage;
