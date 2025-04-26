import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, FileText, Plus, X, Utensils, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Widget types
type WidgetType = "tracker" | "notes" | "goals";

// Widget definition
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: JSX.Element;
}

const ActivityWidget = ({ activities = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Recent Activities</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No activities yet. Add your first activity in the tracker.
        </div>
      ) : (
        activities.map(activity => (
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
        ))
      )}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/tracker"}>
        View All
      </Button>
    </CardFooter>
  </Card>
);

const NotesWidget = ({ notes = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Pet Notes</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {notes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No notes yet. Add your first note to keep track of important information.
        </div>
      ) : (
        notes.map(note => (
          <div key={note.id} className="p-2 border rounded-md">
            <p className="text-sm font-medium">{note.title}</p>
            <p className="text-xs text-muted-foreground">{note.content}</p>
            <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
          </div>
        ))
      )}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/tracker?tab=notes"}>
        <Plus size={14} className="mr-1" /> Add Note
      </Button>
    </CardFooter>
  </Card>
);

const GoalsWidget = ({ goals = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Pet Goals</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {goals.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No goals yet. Set your first goal in the tracker.
        </div>
      ) : (
        goals.map(goal => (
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
        ))
      )}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/tracker?tab=goals"}>
        View All Goals
      </Button>
    </CardFooter>
  </Card>
);

const Index = () => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);

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
    setIsWidgetDialogOpen(false);
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
            <ActivityWidget activities={[]} />
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
            <NotesWidget notes={[]} />
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
            <GoalsWidget goals={[]} />
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
          <span className="text-primary mr-2">🐾</span> PetCaring AI Dashboard
        </h1>
        <p className="text-muted-foreground">Customize your home screen</p>
      </div>
      
      {/* AI Pet Care Plans Section */}
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
      
      <div className="flex justify-center">
        <Button onClick={() => setIsWidgetDialogOpen(true)}>
          <Plus className="mr-2" size={16} />
          Add Widget
        </Button>
      </div>

      <div className="space-y-8">
        {widgets.map(renderWidget)}
      </div>
      
      {/* Widget Selection Dialog */}
      <Dialog open={isWidgetDialogOpen} onOpenChange={setIsWidgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>Select the widget type you want to add to your dashboard</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center" onClick={() => addWidget("tracker")}>
              <Activity size={24} className="mb-2" />
              <span className="font-medium">Activity Widget</span>
              <span className="text-xs text-muted-foreground mt-1">Track recent pet activities</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center" onClick={() => addWidget("notes")}>
              <FileText size={24} className="mb-2" />
              <span className="font-medium">Notes Widget</span>
              <span className="text-xs text-muted-foreground mt-1">Keep important pet notes</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center" onClick={() => addWidget("goals")}>
              <Calendar size={24} className="mb-2" />
              <span className="font-medium">Goals Widget</span>
              <span className="text-xs text-muted-foreground mt-1">Track pet care goals</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
