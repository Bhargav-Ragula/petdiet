
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, ChevronRight, BookmarkCheck } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Define types for our saved plans
type PlanType = 'diet' | 'training' | 'activities' | 'grooming' | 'social';

interface SavedPlan {
  id: string;
  type: PlanType;
  title: string;
  description: string;
  timestamp: number;
  petName?: string;
}

const SavedPlansPage = () => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterPet, setFilterPet] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved plans from localStorage
    const loadSavedPlans = () => {
      const storedPlans = localStorage.getItem('savedPetPlans');
      if (storedPlans) {
        setSavedPlans(JSON.parse(storedPlans));
      }
    };

    loadSavedPlans();
  }, []);

  // Get unique pet names for filtering
  const petNames = Array.from(
    new Set(savedPlans.filter(plan => plan.petName).map(plan => plan.petName))
  );

  // Filter plans based on active tab and pet filter
  const filteredPlans = savedPlans.filter(plan => {
    const matchesType = activeTab === 'all' || plan.type === activeTab;
    const matchesPet = filterPet === 'all' || plan.petName === filterPet;
    return matchesType && matchesPet;
  });

  const handleViewPlan = (planType: PlanType, planId: string) => {
    // Navigate to appropriate plan page with ID
    navigate(`/${planType}-plan?id=${planId}`);
  };

  const handleDeletePlan = (planId: string) => {
    const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
    setSavedPlans(updatedPlans);
    localStorage.setItem('savedPetPlans', JSON.stringify(updatedPlans));
  };

  // Helper to format timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to get icon based on plan type
  const getPlanIcon = (type: PlanType) => {
    switch (type) {
      case 'diet':
        return '🍽️';
      case 'training':
        return '🏋️';
      case 'activities':
        return '🎾';
      case 'grooming':
        return '✂️';
      case 'social':
        return '🐾';
      default:
        return '📋';
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Saved Plans</h1>
        <p className="text-muted-foreground">Access your saved pet care plans</p>
      </div>

      <div className="flex items-center justify-between">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="grooming">Grooming</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {petNames.length > 0 && (
        <div>
          <Select value={filterPet} onValueChange={setFilterPet}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pets</SelectItem>
              {petNames.map((name) => (
                <SelectItem key={name} value={name || ''}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="text-2xl mr-3">{getPlanIcon(plan.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{plan.title}</h3>
                    <div className="flex text-xs text-muted-foreground">
                      <span className="capitalize">{plan.type} Plan</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(plan.timestamp)}</span>
                      {plan.petName && (
                        <>
                          <span className="mx-1">•</span>
                          <span>For: {plan.petName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-destructive"
                    >
                      <Trash2 size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewPlan(plan.type, plan.id)}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <BookmarkCheck size={24} className="text-primary" />
              </div>
              <h4 className="font-medium mb-1">No Saved Plans</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Create and save plans from the diet, training, and other plan creators
              </p>
              <Button onClick={() => navigate('/')}>
                Explore Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SavedPlansPage;
