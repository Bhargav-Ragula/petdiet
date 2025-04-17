
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings, ChevronRight, User, Heart, Dog, Cat, Shield, LogOut, X, Check, Pencil } from "lucide-react";
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
import { toast } from "sonner";

// Mock user data
const userData = {
  name: "Alex Johnson",
  email: "alex@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374",
  joinedDate: "January 2023"
};

// Mock pet data
const petProfiles = [
  {
    id: 1,
    name: "Buddy",
    type: "Golden Retriever",
    age: "3 years",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=612"
  },
  {
    id: 2,
    name: "Luna",
    type: "Siamese Cat",
    age: "2 years",
    image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1470"
  }
];

// Mock preferences
const preferences = [
  { name: "Email Notifications", enabled: true },
  { name: "App Notifications", enabled: true },
  { name: "Weekly Reports", enabled: false },
  { name: "Activity Reminders", enabled: true }
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("pets");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState({ ...userData });

  const handleSaveProfile = () => {
    // In a real app, this would send the data to an API
    // For now, we'll just show a success message
    toast.success("Profile updated successfully!");
    setIsEditDialogOpen(false);
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account & preferences</p>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={userData.avatarUrl} alt={userData.name} />
          <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{userData.name}</h2>
          <p className="text-sm text-muted-foreground">Member since {userData.joinedDate}</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditDialogOpen(true)}>
          <Pencil size={14} className="mr-1" /> Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="pets" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pets">My Pets</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Pet Profiles</h3>
            <Button variant="outline" size="sm">Add Pet</Button>
          </div>
          
          {petProfiles.map(pet => (
            <Card key={pet.id} className="overflow-hidden">
              <div className="flex">
                <div className="w-24 h-24">
                  <img 
                    src={pet.image} 
                    alt={pet.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-1 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{pet.name}</h4>
                      <p className="text-sm text-muted-foreground">{pet.type}, {pet.age}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
          
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Heart size={24} className="text-primary" />
              </div>
              <h4 className="font-medium mb-1">Find Your Perfect Match</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Take our pet matching quiz to find the perfect pet for your lifestyle.
              </p>
              <Button variant="outline" size="sm">Start Quiz</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {preferences.map((pref, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span>{pref.name}</span>
                  <div className={`w-9 h-5 rounded-full relative ${pref.enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all ${pref.enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" /> Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Share Activity Data</span>
                  <div className="w-9 h-5 rounded-full relative bg-muted">
                    <div className="absolute w-4 h-4 rounded-full bg-white top-0.5 left-0.5"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Privacy settings control how your information is used within the app.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" /> Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Email</span>
                <span>{userData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Name</span>
                <span>{userData.name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Password</span>
                <span>••••••••</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsEditDialogOpen(true)}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <div className="pt-4">
            <Button variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={editedUserData.avatarUrl} alt={editedUserData.name} />
                <AvatarFallback>{editedUserData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline">Change Avatar</Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editedUserData.name} 
                onChange={(e) => setEditedUserData({...editedUserData, name: e.target.value})} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={editedUserData.email} 
                onChange={(e) => setEditedUserData({...editedUserData, email: e.target.value})} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              <Check size={14} className="mr-1" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
