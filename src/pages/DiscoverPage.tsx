
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

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleCreateAiPlan = () => {
    navigate("/diet-plan");
  };

  const handlePlanTypeClick = (planType: string) => {
    navigate(`/pet-care-plan?type=${planType}`);
    toast.info(`${planType.charAt(0).toUpperCase() + planType.slice(1)} plan selected.`);
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <span className="text-primary mr-2">🐾</span> PetPals AI Hub
        </h1>
        <p className="text-muted-foreground">Get AI-powered care plans for your pet</p>
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

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Lightbulb className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Discover More Pet Care Resources</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Track activities, set care goals, analyze patterns, and manage your pet's health all in one place.
            </p>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => navigate('/tracker')}
              >
                Activity Tracker <ArrowRight size={14} className="ml-1" />
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => navigate('/insights')} 
              >
                Pet Insights <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
