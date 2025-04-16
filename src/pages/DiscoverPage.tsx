import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, ArrowRight, Lightbulb, Wand2, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const aiPlanTypes = [
  { id: "nutrition", name: "Nutrition", icon: "🍖", description: "Dietary plans & feeding schedules" },
  { id: "training", name: "Training", icon: "🎾", description: "Behavior & tricks training"  },
  { id: "health", name: "Health", icon: "⚕️", description: "Wellness & care routines" },
  { id: "activities", name: "Activities", icon: "🏞️", description: "Exercises & playtime ideas" },
  { id: "grooming", name: "Grooming", icon: "🛁", description: "Cleaning & maintenance tips" },
  { id: "social", name: "Socialization", icon: "🐩", description: "Interaction with other pets" },
];

const PetCard = ({ name, type, match, image, tags }: { 
  name: string; 
  type: string; 
  match: number;
  image: string;
  tags: string[];
}) => (
  <Card className="overflow-hidden transition-all hover:shadow-md">
    <div className="relative h-48 overflow-hidden bg-muted">
      <img src={image} alt={name} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground py-1 px-3 rounded-full text-xs font-semibold flex items-center">
        <Sparkles size={14} className="mr-1" /> {match}% Match
      </div>
    </div>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">{name}</CardTitle>
        <Button variant="ghost" size="icon" className="text-primary hover:text-primary">
          <Heart size={20} />
        </Button>
      </div>
      <CardDescription>{type}</CardDescription>
    </CardHeader>
    <CardContent className="pb-4">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommended");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const recommendedPets = [
    { 
      name: "Buddy", 
      type: "Golden Retriever", 
      match: 98, 
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=612",
      tags: ["Friendly", "Active", "Family pet"]
    },
    { 
      name: "Luna", 
      type: "Siamese Cat", 
      match: 92, 
      image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1470",
      tags: ["Independent", "Quiet", "Low maintenance"]
    },
    { 
      name: "Charlie", 
      type: "Cockatiel", 
      match: 87, 
      image: "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?q=80&w=1470",
      tags: ["Social", "Vocal", "Intelligent"]
    },
  ];

  const handleCreateAiPlan = () => {
    navigate("/diet-plan");
  };

  const handlePlanTypeClick = (planType: string) => {
    toast.info(`${planType} plan selected. Continue to create your custom plan.`);
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <span className="text-primary mr-2">🐾</span> PetPals AI Hub
        </h1>
        <p className="text-muted-foreground">Find your perfect pet companion</p>
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
              onClick={() => handlePlanTypeClick(type.name)}
              className="flex flex-col items-center p-4 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span className="text-2xl mb-2">{type.icon}</span>
              <span className="font-medium text-sm">{type.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          <TabsContent value="recommended" className="mt-4 space-y-4">
            {recommendedPets.map((pet, index) => (
              <PetCard key={index} {...pet} />
            ))}
          </TabsContent>
          <TabsContent value="trending" className="mt-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Complete your profile to see trending pets in your area.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DiscoverPage;
