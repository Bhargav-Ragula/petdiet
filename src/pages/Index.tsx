
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, FileText, Utensils, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const navigate = useNavigate();

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

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-primary mr-2">🐾</span> AI Pet Planner
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
    </div>
  );
};

export default Index;
