
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, ArrowRight, Lightbulb, Wand2, Utensils, Activity, FileText, Calendar, Plus, X, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const aiPlanTypes = [
  { id: "nutrition", name: "Nutrition", icon: "🍖", description: "Dietary plans & feeding schedules" },
  { id: "training", name: "Training", icon: "🎾", description: "Behavior & tricks training"  },
  { id: "health", name: "Health", icon: "⚕️", description: "Wellness & care routines" },
  { id: "activities", name: "Activities", icon: "🏞️", description: "Exercises & playtime ideas" },
  { id: "grooming", name: "Grooming", icon: "🛁", description: "Cleaning & maintenance tips" },
  { id: "social", name: "Socialization", icon: "🐩", description: "Interaction with other pets" },
];

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

// Widget types
type WidgetType = "tracker" | "analytics" | "notes" | "goals";

// Widget definition
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: JSX.Element;
}

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

const AnalyticsWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Weekly Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-36 flex items-end space-x-2">
        {analyticsData.map((data, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="w-full bg-primary/80 rounded-t-sm" style={{ height: `${(data.minutes / 75) * 100}%` }} />
            <span className="text-xs mt-1">{data.day}</span>
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/insights"}>
        View Details
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

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([
    { 
      id: "tracker-1", 
      type: "tracker", 
      title: "Recent Activities", 
      icon: <Activity size={16} />
    }
  ]);
  
  const handleCreateAiPlan = () => {
    navigate("/diet-plan");
  };

  const handlePlanTypeClick = (planType: string) => {
    navigate(`/pet-care-plan?type=${planType}`);
    toast.info(`${planType.charAt(0).toUpperCase() + planType.slice(1)} plan selected.`);
  };

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
            <AnalyticsWidget />
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
          <span className="text-primary mr-2">🐾</span> PetPals AI Hub
        </h1>
        <p className="text-muted-foreground">Get AI-powered care plans for your pet</p>
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
        
        <Button onClick={() => navigate("/tracker")}>
          View All Trackers
        </Button>
      </div>

      <div className="space-y-8">
        {widgets.map(renderWidget)}
      </div>

      <div className="bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">Generate an AI Pet Diet Plan</h2>
        <p className="text-sm mb-3">Enter your pet's details and get a personalized diet plan tailored to their needs.</p>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center"
          onClick={handleCreateAiPlan}
        >
          <Utensils size={16} className="mr-2" /> Create Pet Diet Plan
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl flex items-center">
            <Wand2 className="mr-2 text-primary" size={20} /> AI Pet Care Plans
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">Select a plan type to generate personalized care guidance for your pet</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {aiPlanTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handlePlanTypeClick(type.id)}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span className="text-2xl mb-2">{type.icon}</span>
              <span className="font-medium text-sm">{type.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
