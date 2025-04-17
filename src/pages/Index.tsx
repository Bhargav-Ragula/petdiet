import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Calendar, FileText, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import AnalyticsWidget from "@/components/widgets/AnalyticsWidget";

// Widget types
type WidgetType = "tracker" | "analytics" | "notes" | "goals";

// Widget definition
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: JSX.Element;
}

// Mock activity data
const recentActivities = [
  {
    id: 1,
    type: "Walk",
    petName: "Buddy",
    duration: "30 min",
    date: "Today, 10:30 AM",
    icon: "🦮"
  },
  {
    id: 2,
    type: "Play",
    petName: "Luna",
    duration: "15 min",
    date: "Yesterday, 4:45 PM",
    icon: "🎾"
  }
];

// Mock analytics data
const analyticsData = [
  { day: 'Mon', minutes: 35 },
  { day: 'Tue', minutes: 20 },
  { day: 'Wed', minutes: 45 },
  { day: 'Thu', minutes: 30 },
  { day: 'Fri', minutes: 60 },
  { day: 'Sat', minutes: 75 },
  { day: 'Sun', minutes: 45 },
];

// Mock notes
const notesData = [
  {
    id: 1,
    title: "Vaccination Reminder",
    content: "Buddy's annual vaccines are due next month.",
    date: "2025-04-10"
  },
  {
    id: 2,
    title: "New Food Trial",
    content: "Started grain-free kibble today.",
    date: "2025-04-15"
  }
];

// Mock goals
const goals = [
  {
    id: 1,
    name: "Daily walk",
    target: "30 minutes",
    progress: 75,
    icon: "🦮"
  },
  {
    id: 2,
    name: "Weekly playtime",
    target: "3 hours",
    progress: 60,
    icon: "🎾"
  }
];

const ActivityWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Recent Activities</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {recentActivities.map(activity => (
        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {activity.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.type}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{activity.petName}</p>
              <p className="text-xs text-muted-foreground">{activity.date}</p>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/tracker"}>
        View All
      </Button>
    </CardFooter>
  </Card>
);

const NotesWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Pet Notes</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {notesData.map(note => (
        <div key={note.id} className="p-2 border rounded-md">
          <p className="text-sm font-medium">{note.title}</p>
          <p className="text-xs text-muted-foreground">{note.content}</p>
          <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
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

const GoalsWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Pet Goals</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {goals.map(goal => (
        <div key={goal.id} className="flex items-center space-x-3 p-2 rounded-lg border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {goal.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{goal.name}</p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/tracker"}>
        View All Goals
      </Button>
    </CardFooter>
  </Card>
);

const Index = () => {
  const navigate = useNavigate();
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
              <h3 className="text-base font-medium flex items-center">
                {widget.icon}
                <span className="ml-2">{widget.title}</span>
              </h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            <ActivityWidget />
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-4" key={widget.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium flex items-center">
                {widget.icon}
                <span className="ml-2">{widget.title}</span>
              </h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            <AnalyticsWidget data={analyticsData} compact={true} />
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4" key={widget.id}>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium flex items-center">
                {widget.icon}
                <span className="ml-2">{widget.title}</span>
              </h3>
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
              <h3 className="text-base font-medium flex items-center">
                {widget.icon}
                <span className="ml-2">{widget.title}</span>
              </h3>
              <Button variant="ghost" size="icon" onClick={() => removeWidget(widget.id)}>
                <X size={16} />
              </Button>
            </div>
            <GoalsWidget />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-primary mr-2">🐾</span> PetPals Dashboard
        </h1>
        <p className="text-muted-foreground">Customize your home screen</p>
      </div>
      
      <div className="flex justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
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
        
        <Button onClick={() => navigate("/discover")}>
          View AI Plans
        </Button>
      </div>

      <div className="space-y-8">
        {widgets.map(renderWidget)}
      </div>
    </div>
  );
};

export default Index;
