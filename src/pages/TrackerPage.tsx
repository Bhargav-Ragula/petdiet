
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, Plus, Clock, MapPin, FileText, ChevronLeft, Edit, Trash, Upload, Image } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import AnalyticsWidget from "@/components/widgets/AnalyticsWidget";

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

const ActivityCard = ({ activity, onEdit, onDelete }) => (
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
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-primary/80" onClick={() => onEdit(activity)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive/80" onClick={() => onDelete(activity.id)}>
            <Trash size={16} />
          </Button>
        </div>
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

const GoalCard = ({ goal, onEdit, onDelete }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
      {goal.icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between">
        <h4 className="text-sm font-medium">{goal.name}</h4>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(goal)}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive/80" onClick={() => onDelete(goal.id)}>
            <Trash size={14} />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <Progress value={goal.progress} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground ml-2">{goal.progress}%</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">Target: {goal.target}</div>
    </div>
  </div>
);

const EmptyState = ({ title, description, icon, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center h-60">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
    <Button onClick={onAction}>
      <Plus size={16} className="mr-2" />
      {actionText}
    </Button>
  </div>
);

const Note = ({ note, onEdit, onDelete }) => {
  return (
    <div className="p-3 border rounded-md bg-card/50">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium">{note.title}</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(note)}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive/80" onClick={() => onDelete(note.id)}>
            <Trash size={14} />
          </Button>
        </div>
      </div>
      <p className="text-xs mt-1 text-muted-foreground">{note.content}</p>
      {note.image && (
        <div className="mt-2">
          <img src={note.image} alt={note.title} className="w-full h-32 object-cover rounded-md" />
        </div>
      )}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-muted-foreground">{note.date}</span>
        <div className="flex gap-1">
          {note.tags && note.tags.map(tag => (
            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrackerPage = () => {
  const [activeTab, setActiveTab] = useState("activities");
  const [isNewActivityDialogOpen, setIsNewActivityDialogOpen] = useState(false);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  
  const [newActivity, setNewActivity] = useState({
    type: "Walk",
    petName: "Buddy",
    duration: "30",
    location: "Local Park",
  });
  
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    progress: 0,
    icon: "🎯"
  });
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [],
    image: null
  });
  
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [hasInsights, setHasInsights] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleAddActivity = () => {
    // Create a new activity object
    const activity = {
      id: isEditMode ? currentEditId : Date.now(),
      type: newActivity.type,
      petName: newActivity.petName,
      duration: `${newActivity.duration} min`,
      distance: newActivity.type === "Walk" ? "2.1 km" : undefined,
      date: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: newActivity.location,
      icon: newActivity.type === "Walk" ? "🦮" : 
            newActivity.type === "Play" ? "🎾" : 
            newActivity.type === "Training" ? "🏆" : 
            newActivity.type === "Grooming" ? "🧼" : 
            newActivity.type === "Vet Visit" ? "🩺" : "🐾"
    };

    if (isEditMode) {
      setActivities(prev => prev.map(a => a.id === currentEditId ? activity : a));
      toast.success(`Activity updated successfully`);
    } else {
      // Update activities state
      setActivities(prev => [activity, ...prev]);
      toast.success(`New ${newActivity.type} activity added`);
    }
    
    // Set insights flag to true once at least one activity is added
    if (!hasInsights) {
      setHasInsights(true);
    }
    
    // Reset form and close dialog
    setIsNewActivityDialogOpen(false);
    setIsEditMode(false);
    setCurrentEditId(null);
    setNewActivity({
      type: "Walk",
      petName: "Buddy",
      duration: "30",
      location: "Local Park",
    });
  };

  const handleAddGoal = () => {
    const goal = {
      id: isEditMode ? currentEditId : Date.now(),
      name: newGoal.name,
      target: newGoal.target,
      progress: newGoal.progress,
      icon: newGoal.icon
    };

    if (isEditMode) {
      setGoals(prev => prev.map(g => g.id === currentEditId ? goal : g));
      toast.success(`Goal updated successfully`);
    } else {
      setGoals(prev => [...prev, goal]);
      toast.success(`New goal added`);
    }

    // Reset form and close dialog
    setIsNewGoalDialogOpen(false);
    setIsEditMode(false);
    setCurrentEditId(null);
    setNewGoal({
      name: "",
      target: "",
      progress: 0,
      icon: "🎯"
    });
  };

  const handleAddNote = () => {
    const note = {
      id: isEditMode ? currentEditId : Date.now(),
      title: newNote.title,
      content: newNote.content,
      date: new Date().toLocaleDateString(),
      tags: newNote.content.match(/#\w+/g) 
        ? newNote.content.match(/#\w+/g).map(tag => tag.substring(1)) 
        : [],
      image: newNote.image
    };

    if (isEditMode) {
      setNotes(prev => prev.map(n => n.id === currentEditId ? note : n));
      toast.success(`Note updated successfully`);
    } else {
      setNotes(prev => [...prev, note]);
      toast.success(`New note added`);
    }

    // Reset form and close dialog
    setIsNewNoteDialogOpen(false);
    setIsEditMode(false);
    setCurrentEditId(null);
    setNewNote({
      title: "",
      content: "",
      tags: [],
      image: null
    });
  };

  const handleEditActivity = (activity) => {
    setIsEditMode(true);
    setCurrentEditId(activity.id);
    setNewActivity({
      type: activity.type,
      petName: activity.petName,
      duration: activity.duration.replace(' min', ''),
      location: activity.location
    });
    setIsNewActivityDialogOpen(true);
  };

  const handleDeleteActivity = (id) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
    toast.info("Activity removed");
    
    // Update insights flag if no activities are left
    if (activities.length <= 1) {
      setHasInsights(false);
    }
  };

  const handleEditGoal = (goal) => {
    setIsEditMode(true);
    setCurrentEditId(goal.id);
    setNewGoal({
      name: goal.name,
      target: goal.target,
      progress: goal.progress,
      icon: goal.icon
    });
    setIsNewGoalDialogOpen(true);
  };

  const handleDeleteGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast.info("Goal removed");
  };

  const handleEditNote = (note) => {
    setIsEditMode(true);
    setCurrentEditId(note.id);
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags,
      image: note.image
    });
    setIsNewNoteDialogOpen(true);
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast.info("Note removed");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Tracker</h1>
        <p className="text-muted-foreground">Track your pet's activities & goals</p>
      </div>
      
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90" onClick={() => {
          setIsEditMode(false);
          setCurrentEditId(null);
          setIsNewActivityDialogOpen(true);
        }}>
          <Plus size={18} className="mr-1" /> New Activity
        </Button>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="activities" onClick={() => setActiveTab("activities")}>Activities</TabsTrigger>
          <TabsTrigger value="goals" onClick={() => setActiveTab("goals")}>Goals</TabsTrigger>
          <TabsTrigger value="notes" onClick={() => setActiveTab("notes")}>Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="space-y-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState 
                  title="No activities yet"
                  description="Start tracking your pet's activities by adding your first activity."
                  icon={<Activity size={24} />}
                  actionText="Add First Activity"
                  onAction={() => {
                    setIsEditMode(false);
                    setCurrentEditId(null);
                    setIsNewActivityDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <>
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
                {activities.map(activity => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Current Goals</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsEditMode(false);
                setCurrentEditId(null);
                setNewGoal({
                  name: "",
                  target: "",
                  progress: 0,
                  icon: "🎯"
                });
                setIsNewGoalDialogOpen(true);
              }}
            >
              <Plus size={16} className="mr-1" /> Add Goal
            </Button>
          </div>
          
          {goals.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState 
                  title="No goals set"
                  description="Create goals to track your pet's progress."
                  icon={<Calendar size={24} />}
                  actionText="Create First Goal"
                  onAction={() => {
                    setIsEditMode(false);
                    setCurrentEditId(null);
                    setIsNewGoalDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Pet Notes</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsEditMode(false);
                setCurrentEditId(null);
                setNewNote({
                  title: "",
                  content: "",
                  tags: [],
                  image: null
                });
                setIsNewNoteDialogOpen(true);
              }}
            >
              <Plus size={16} className="mr-1" /> Add Note
            </Button>
          </div>
          
          {notes.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState 
                  title="No notes yet"
                  description="Keep track of important information about your pet."
                  icon={<FileText size={24} />}
                  actionText="Add First Note"
                  onAction={() => {
                    setIsEditMode(false);
                    setCurrentEditId(null);
                    setIsNewNoteDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <Note 
                  key={note.id} 
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* New Activity Dialog */}
      <Dialog open={isNewActivityDialogOpen} onOpenChange={setIsNewActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Activity" : "Add New Activity"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update activity details" : "Record a new activity for your pet"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activity-type">Activity Type</Label>
              <Select 
                value={newActivity.type}
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
                value={newActivity.petName}
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
            <Button variant="outline" onClick={() => {
              setIsNewActivityDialogOpen(false);
              setIsEditMode(false);
              setCurrentEditId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity}>
              {isEditMode ? "Update" : "Add"} Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Goal Dialog */}
      <Dialog open={isNewGoalDialogOpen} onOpenChange={setIsNewGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Goal" : "Add New Goal"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update goal details" : "Set a new goal for your pet"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input 
                id="goal-name" 
                value={newGoal.name} 
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                placeholder="Daily walk"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="target">Target</Label>
              <Input 
                id="target" 
                value={newGoal.target} 
                onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                placeholder="30 minutes"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="progress">Current Progress (%)</Label>
              <Input 
                id="progress" 
                type="number"
                min="0"
                max="100"
                value={newGoal.progress} 
                onChange={(e) => setNewGoal({...newGoal, progress: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select 
                value={newGoal.icon}
                onValueChange={(value) => setNewGoal({...newGoal, icon: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="🎯">🎯 Target</SelectItem>
                  <SelectItem value="🦮">🦮 Walk</SelectItem>
                  <SelectItem value="🎾">🎾 Play</SelectItem>
                  <SelectItem value="🏆">🏆 Training</SelectItem>
                  <SelectItem value="🧼">🧼 Grooming</SelectItem>
                  <SelectItem value="🩺">🩺 Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewGoalDialogOpen(false);
              setIsEditMode(false);
              setCurrentEditId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              {isEditMode ? "Update" : "Add"} Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Note Dialog */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Note" : "Add New Note"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update note details" : "Create a new note about your pet"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note-title">Title</Label>
              <Input 
                id="note-title" 
                value={newNote.title} 
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Vaccination Reminder"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea 
                id="note-content" 
                value={newNote.content} 
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Add note content here. Use #tags to categorize."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Use hashtags like #health to add tags to your note.</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="image">Image (Optional)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={openFileDialog}>
                  <Upload size={16} className="mr-2" /> 
                  {newNote.image ? "Change Image" : "Upload Image"}
                </Button>
                {newNote.image && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-destructive/80"
                    onClick={() => setNewNote({...newNote, image: null})}
                  >
                    Remove
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {newNote.image && (
                <div className="mt-2 relative">
                  <img 
                    src={newNote.image} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md border" 
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewNoteDialogOpen(false);
              setIsEditMode(false);
              setCurrentEditId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              {isEditMode ? "Update" : "Add"} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackerPage;
