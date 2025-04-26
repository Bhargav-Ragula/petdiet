import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dog, Shield, LogOut, X, Check, Pencil, Plus, Image as ImageIcon } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("pets");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    email: user?.email || ''
  });
  const [petProfiles, setPetProfiles] = useState([]);
  const [newPet, setNewPet] = useState({
    name: "",
    type: "",
    age: "",
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would update user metadata
    toast.success("Profile updated successfully!");
    setIsEditDialogOpen(false);
  };

  const handleAddPet = () => {
    const pet = {
      id: Date.now(),
      name: newPet.name,
      type: newPet.type,
      age: newPet.age,
    };

    setPetProfiles([...petProfiles, pet]);
    setIsAddPetDialogOpen(false);
    setNewPet({
      name: "",
      type: "",
      age: "",
    });
    toast.success("Pet added successfully!");
  };

  const handleDeletePet = (id) => {
    setPetProfiles(petProfiles.filter(pet => pet.id !== id));
    toast.info("Pet removed");
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your account & preferences</p>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarFallback>{editedUserData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{editedUserData.name}</h2>
          <p className="text-sm text-muted-foreground">Member since {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditDialogOpen(true)}>
          <Pencil size={14} className="mr-1" /> Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="pets" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="pets">My Pets</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Pet Profiles</h3>
            <Button variant="outline" size="sm" onClick={() => setIsAddPetDialogOpen(true)}>
              <Plus size={14} className="mr-1" />
              Add Pet
            </Button>
          </div>
          
          {petProfiles.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Dog size={24} className="text-primary" />
                </div>
                <h4 className="font-medium mb-1">No Pets Added Yet</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add your pets to keep track of their activities and care needs.
                </p>
                <Button onClick={() => setIsAddPetDialogOpen(true)}>
                  <Plus size={14} className="mr-2" />
                  Add First Pet
                </Button>
              </CardContent>
            </Card>
          ) : (
            petProfiles.map(pet => (
              <Card key={pet.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl mr-3">
                        {pet.type.includes("Cat") ? "🐱" : "🐶"}
                      </div>
                      <div>
                        <h4 className="font-medium">{pet.name}</h4>
                        <p className="text-sm text-muted-foreground">{pet.type}, {pet.age}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePet(pet.id)}>
                      <X size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Heart size={24} className="text-primary" />
              </div>
              <h4 className="font-medium mb-1">Find Your Perfect Match</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Take our pet matching quiz to find the perfect pet for your lifestyle.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/quiz")}>Start Quiz</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Name</span>
                <span>{editedUserData.name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsEditDialogOpen(true)}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <div className="pt-4">
            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
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

      {/* Add Pet Dialog */}
      <Dialog open={isAddPetDialogOpen} onOpenChange={setIsAddPetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Pet</DialogTitle>
            <DialogDescription>
              Add information about your pet here.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pet-name">Pet Name</Label>
              <Input 
                id="pet-name" 
                value={newPet.name} 
                onChange={(e) => setNewPet({...newPet, name: e.target.value})} 
                placeholder="Buddy"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="pet-type">Pet Type/Breed</Label>
              <Input 
                id="pet-type" 
                value={newPet.type} 
                onChange={(e) => setNewPet({...newPet, type: e.target.value})} 
                placeholder="Golden Retriever"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="pet-age">Pet Age</Label>
              <Input 
                id="pet-age" 
                value={newPet.age} 
                onChange={(e) => setNewPet({...newPet, age: e.target.value})} 
                placeholder="2 years"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPet} disabled={!newPet.name || !newPet.type || !newPet.age}>
              Add Pet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
