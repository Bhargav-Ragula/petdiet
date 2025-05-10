import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, ArrowRight, ChevronLeft, Lightbulb, Wand2, Utensils, Activity, FileText, Calendar, Plus, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const aiPlanTypes = [
  { id: "training", name: "Training", icon: "🎾", description: "Behavior & tricks training"  },
  { id: "activities", name: "Activities", icon: "🏞️", description: "Exercises & playtime ideas" },
  { id: "grooming", name: "Grooming", icon: "🛁", description: "Cleaning & maintenance tips" },
  { id: "social", name: "Socialization", icon: "🐩", description: "Find nearby pet events" },
];

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

type WidgetType = "tracker" | "notes" | "goals";

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
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([
    { 
      id: "tracker-1", 
      type: "tracker", 
      title: "Recent Activities", 
      icon: <Activity size={16} />
    }
  ]);
  
  const handleCreatePlan = (planType: string) => {
    switch(planType) {
      case "diet":
        navigate("/diet-plan");
        break;
      case "training":
        navigate("/training-plan");
        break;
      case "activities":
        navigate("/activities-plan");
        break;
      case "grooming":
        navigate("/grooming-plan");
        break;
      default:
        navigate(`/pet-care-plan?type=${planType}`);
    }
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
        : type === "notes" 
          ? "Pet Notes" 
          : "Pet Goals",
      icon: type === "tracker" 
        ? <Activity size={16} />
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
          <span className="text-primary mr-2">🐾</span> AI Pet Planner
        </h1>
        <p className="text-muted-foreground">Get AI-powered care plans for your pet</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl flex items-center">
              <Wand2 className="mr-2 text-primary" size={20} /> AI Pet Care Plans
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Generate personalized care plans tailored to your pet's unique needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 hover:border-primary/50 hover:shadow-md transition-all overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 pb-8">
                <CardTitle className="flex items-center">
                  <Utensils size={18} className="mr-2 text-primary" />
                  Pet Diet Plan
                </CardTitle>
                <CardDescription>Nutrition recommendations based on your pet's needs</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Personalized meal portions
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Food recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Feeding schedule
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleCreatePlan("diet")}
                >
                  Generate Diet Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-md transition-all overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 pb-8">
                <CardTitle className="flex items-center">
                  <Activity size={18} className="mr-2 text-primary" />
                  Pet Training Plan
                </CardTitle>
                <CardDescription>Behavior training customized to your pet</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Custom commands training
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Behavior correction tips
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Weekly training routine
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleCreatePlan("training")}
                >
                  Generate Training Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-md transition-all overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 pb-8">
                <CardTitle className="flex items-center">
                  <Calendar size={18} className="mr-2 text-primary" />
                  Pet Activities Plan
                </CardTitle>
                <CardDescription>Fun and engaging activities for your pet</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Age-appropriate activities
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Indoor/outdoor games
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Mental stimulation ideas
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleCreatePlan("activities")}
                >
                  Generate Activities Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-md transition-all overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 pb-8">
                <CardTitle className="flex items-center">
                  <FileText size={18} className="mr-2 text-primary" />
                  Pet Grooming Plan
                </CardTitle>
                <CardDescription>Grooming routines for your pet's coat and needs</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Coat-specific grooming routine
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Product recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="bg-primary/10 p-1 rounded-full mr-2">✓</span>
                    Seasonal grooming tips
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleCreatePlan("grooming")}
                >
                  Generate Grooming Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="pt-6 mt-8 border-t">
          <h2 className="font-semibold text-xl flex items-center mb-4">
            <Plus className="mr-2 text-primary" size={20} /> Add Widgets to Dashboard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => addWidget("tracker")}>
              <Activity size={22} className="mb-2" />
              <span className="font-medium">Activity Widget</span>
              <span className="text-xs text-muted-foreground mt-1">Track recent pet activities</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => addWidget("notes")}>
              <FileText size={22} className="mb-2" />
              <span className="font-medium">Notes Widget</span>
              <span className="text-xs text-muted-foreground mt-1">Keep important pet notes</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center" onClick={() => addWidget("goals")}>
              <Calendar size={22} className="mb-2" />
              <span className="font-medium">Goals Widget</span>
              <span className="text-xs text-muted-foreground mt-1">Track pet care goals</span>
            </Button>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate("/tracker")}>
              View All Trackers
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {widgets.map(renderWidget)}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
