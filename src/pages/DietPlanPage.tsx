import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { ChevronLeft, Loader2, AlertTriangle, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

// Define food types for each pet type
interface FoodOptions {
  [key: string]: any;
  dog: {
    proteins: string[];
    vegetables: string[];
    fruits: string[];
    grains: string[];
    treats: string[];
  };
  cat: {
    proteins: string[];
    vegetables: string[];
    supplements: string[];
    treats: string[];
  };
  rabbit: {
    hays: string[];
    vegetables: string[];
    fruits: string[];
    pellets: string[];
  };
  bird: {
    seeds: string[];
    vegetables: string[];
    fruits: string[];
    protein: string[];
    commercial: string[];
  };
  fish: {
    safe_foods: string[];
    supplements: string[];
    treats: string[];
  }
}

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('id');
  
  const [step, setStep] = useState(planId ? 2 : 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [petAge, setPetAge] = useState('adult');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [allergies, setAllergies] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved plan if planId is provided
  useEffect(() => {
    if (planId) {
      const savedPlans = JSON.parse(localStorage.getItem('savedPetPlans') || '[]');
      const savedPlan = savedPlans.find((plan: any) => plan.id === planId);
      
      if (savedPlan && savedPlan.planData) {
        setDietPlan(savedPlan.planData);
        setPetName(savedPlan.petName || '');
        setPetType(savedPlan.petType || 'dog');
        setPetAge(savedPlan.petAge || 'adult');
        setAllergies(savedPlan.allergies || '');
        setHealthConditions(savedPlan.healthConditions || '');
        setIsSaved(true);
      }
    }
  }, [planId]);

  const generateDietPlan = () => {
    setIsGenerating(true);
    
    // Simulate generating a plan
    setTimeout(() => {
      const foodOptions: FoodOptions = {
        dog: {
          proteins: ['Chicken', 'Beef', 'Turkey', 'Salmon', 'Lamb', 'Eggs'],
          vegetables: ['Carrots', 'Green beans', 'Pumpkin', 'Sweet potatoes', 'Broccoli'],
          fruits: ['Apple slices', 'Blueberries', 'Watermelon', 'Strawberries'],
          grains: ['Brown rice', 'Oatmeal', 'Quinoa', 'Barley'],
          treats: ['Plain, non-fat yogurt', 'Dehydrated sweet potato', 'Frozen berries']
        },
        cat: {
          proteins: ['Chicken', 'Turkey', 'Beef', 'Fish (salmon, tuna)', 'Duck', 'Rabbit'],
          vegetables: ['Steamed carrots', 'Pumpkin', 'Peas', 'Spinach (small amounts)'],
          supplements: ['Omega-3 fatty acids', 'Taurine', 'Cat grass'],
          treats: ['Freeze-dried chicken', 'Small fish treats', 'Dental treats']
        },
        rabbit: {
          hays: ['Timothy hay', 'Oat hay', 'Meadow hay', 'Orchard grass'],
          vegetables: ['Romaine lettuce', 'Kale', 'Bell peppers', 'Cilantro', 'Parsley'],
          fruits: ['Apple (no seeds)', 'Berries', 'Banana (small amount)', 'Pear'],
          pellets: ['Timothy-based pellets', 'Alfalfa-based pellets (only for young/nursing rabbits)']
        },
        bird: {
          seeds: ['Sunflower seeds', 'Millet', 'Flax seeds', 'Canary seeds'],
          vegetables: ['Carrots', 'Kale', 'Broccoli', 'Sweet potato'],
          fruits: ['Apple slices', 'Berries', 'Banana', 'Melons'],
          protein: ['Hard-boiled eggs', 'Legumes', 'Cooked chicken (small amount)'],
          commercial: ['High-quality pellets', 'Nutrient-rich food sticks']
        },
        fish: {
          safe_foods: ['Quality fish flakes', 'Frozen brine shrimp', 'Bloodworms', 'Daphnia'],
          supplements: ['Spirulina', 'Algae wafers', 'Freeze-dried tubifex'],
          treats: ['Freeze-dried krill', 'Vegetable pellets', 'Daphnia']
        }
      };

      // Generate plan based on pet type
      const plan: any = {
        title: `Custom ${petType.charAt(0).toUpperCase() + petType.slice(1)} Diet Plan`,
        petName: petName,
        petType: petType,
        petAge: petAge,
        activityLevel: activityLevel,
        allergies: allergies,
        healthConditions: healthConditions,
        recommendations: []
      };

      if (petType === 'dog') {
        plan.recommendations = [
          {
            title: "Daily Meal Plan",
            content: `
              Based on your ${petAge} ${activityLevel} activity level dog, we recommend:
              
              • Morning: High-quality ${foodOptions.dog.proteins[Math.floor(Math.random() * foodOptions.dog.proteins.length)]} protein with ${foodOptions.dog.grains[Math.floor(Math.random() * foodOptions.dog.grains.length)]} (1/4 cup per 20 lbs of body weight)
              • Evening: Mix of ${foodOptions.dog.proteins[Math.floor(Math.random() * foodOptions.dog.proteins.length)]} with ${foodOptions.dog.vegetables[Math.floor(Math.random() * foodOptions.dog.vegetables.length)]} and ${foodOptions.dog.vegetables[Math.floor(Math.random() * foodOptions.dog.vegetables.length)]} (1/4 cup per 20 lbs of body weight)
              • Treats: ${foodOptions.dog.treats[Math.floor(Math.random() * foodOptions.dog.treats.length)]} (limit to 10% of daily caloric intake)
              
              Include daily supplements: Omega-3 fatty acids for coat health, and glucosamine for joint support.
            `
          },
          {
            title: "Hydration",
            content: "Ensure fresh water is always available. For enhanced hydration, consider adding a splash of water to dry kibble."
          },
          {
            title: "Foods to Avoid",
            content: "Chocolate, grapes, raisins, onions, garlic, xylitol, alcohol, caffeine, macadamia nuts, and raw bread dough."
          },
          {
            title: "Special Considerations",
            content: allergies || healthConditions ? 
              `Based on the ${allergies ? "allergies" : ""}${allergies && healthConditions ? " and " : ""}${healthConditions ? "health conditions" : ""} you've mentioned, consider consulting with a veterinary nutritionist for a fully customized diet plan.` : 
              "Monitor your dog's weight and adjust portion sizes accordingly. If you notice changes in appetite, digestion, or energy, consult your veterinarian."
          }
        ];
      } else if (petType === 'cat') {
        plan.recommendations = [
          {
            title: "Daily Meal Plan",
            content: `
              Based on your ${petAge} ${activityLevel} activity level cat, we recommend:
              
              • Morning: High-quality ${foodOptions.cat.proteins[Math.floor(Math.random() * foodOptions.cat.proteins.length)]} wet food (2-3% of body weight)
              • Evening: Premium ${foodOptions.cat.proteins[Math.floor(Math.random() * foodOptions.cat.proteins.length)]} with small amounts of ${foodOptions.cat.vegetables[Math.floor(Math.random() * foodOptions.cat.vegetables.length)]} (2-3% of body weight)
              • Treats: ${foodOptions.cat.treats[Math.floor(Math.random() * foodOptions.cat.treats.length)]} (limit to 10% of daily caloric intake)
              
              Consider adding ${foodOptions.cat.supplements[Math.floor(Math.random() * foodOptions.cat.supplements.length)]} supplement for optimal health.
            `
          },
          {
            title: "Hydration",
            content: "Cats often don't drink enough water. Consider a pet fountain to encourage drinking. Wet food also helps with hydration."
          },
          {
            title: "Foods to Avoid",
            content: "Onions, garlic, chocolate, caffeinated beverages, alcohol, raw eggs, raw meat, dairy products, and dog food."
          },
          {
            title: "Special Considerations",
            content: allergies || healthConditions ? 
              `Based on the ${allergies ? "allergies" : ""}${allergies && healthConditions ? " and " : ""}${healthConditions ? "health conditions" : ""} you've mentioned, your cat may benefit from a specialized diet. Consult with your veterinarian.` : 
              "Cats are obligate carnivores and require high-protein diets. Overweight cats should be transitioned to a lower-calorie diet gradually."
          }
        ];
      } else if (petType === 'rabbit') {
        plan.recommendations = [
          {
            title: "Daily Meal Plan",
            content: `
              Based on your ${petAge} ${activityLevel} activity level rabbit, we recommend:
              
              • Unlimited ${foodOptions.rabbit.hays[Math.floor(Math.random() * foodOptions.rabbit.hays.length)]} (should make up 80-90% of diet)
              • 1 cup of leafy greens per 2 lbs of body weight: Mix of ${foodOptions.rabbit.vegetables[Math.floor(Math.random() * foodOptions.rabbit.vegetables.length)]}, ${foodOptions.rabbit.vegetables[Math.floor(Math.random() * foodOptions.rabbit.vegetables.length)]}, and ${foodOptions.rabbit.vegetables[Math.floor(Math.random() * foodOptions.rabbit.vegetables.length)]}
              • Limited pellets: 1/4 cup per 6 lbs of body weight of ${foodOptions.rabbit.pellets[Math.floor(Math.random() * foodOptions.rabbit.pellets.length)]}
              • Occasional treats: Small pieces of ${foodOptions.rabbit.fruits[Math.floor(Math.random() * foodOptions.rabbit.fruits.length)]} (no more than 1-2 tablespoons per day)
            `
          },
          {
            title: "Hydration",
            content: "Fresh water should always be available, preferably in a bowl rather than a bottle for more natural drinking position."
          },
          {
            title: "Foods to Avoid",
            content: "Iceberg lettuce, potatoes, corn, beans, seeds, nuts, chocolate, candy, bread, pasta, yogurt drops, and any human treats."
          },
          {
            title: "Special Considerations",
            content: allergies || healthConditions ? 
              `Based on the ${allergies ? "allergies" : ""}${allergies && healthConditions ? " and " : ""}${healthConditions ? "health conditions" : ""} you've mentioned, monitor your rabbit closely when introducing new foods.` : 
              "Rabbits need constant access to hay to maintain dental and digestive health. Changes to diet should be made gradually to avoid digestive upsets."
          }
        ];
      } else if (petType === 'bird') {
        plan.recommendations = [
          {
            title: "Daily Meal Plan",
            content: `
              Based on your ${petAge} ${activityLevel} activity level bird, we recommend:
              
              • Morning: Mix of ${foodOptions.bird.seeds[Math.floor(Math.random() * foodOptions.bird.seeds.length)]} and ${foodOptions.bird.commercial[Math.floor(Math.random() * foodOptions.bird.commercial.length)]} (70% of diet)
              • Afternoon: Fresh ${foodOptions.bird.vegetables[Math.floor(Math.random() * foodOptions.bird.vegetables.length)]} and ${foodOptions.bird.fruits[Math.floor(Math.random() * foodOptions.bird.fruits.length)]} (20% of diet)
              • Weekly protein: Small amounts of ${foodOptions.bird.protein[Math.floor(Math.random() * foodOptions.bird.protein.length)]} (10% of diet)
            `
          },
          {
            title: "Hydration",
            content: "Fresh water daily in a clean dish. Some birds enjoy misting or bathing opportunities."
          },
          {
            title: "Foods to Avoid",
            content: "Avocado, chocolate, caffeine, alcohol, salty foods, onions, garlic, and fruit seeds/pits."
          },
          {
            title: "Special Considerations",
            content: allergies || healthConditions ? 
              `Based on the ${allergies ? "allergies" : ""}${allergies && healthConditions ? " and " : ""}${healthConditions ? "health conditions" : ""} you've mentioned, consult an avian veterinarian for specific nutritional guidance.` : 
              "Different bird species have different dietary needs. This is a general plan that should be adjusted based on your specific bird type."
          }
        ];
      } else if (petType === 'fish') {
        plan.recommendations = [
          {
            title: "Daily Feeding Plan",
            content: `
              Based on your ${petAge} ${activityLevel} activity level fish, we recommend:
              
              • Morning: Small pinch of ${foodOptions.fish.safe_foods[Math.floor(Math.random() * foodOptions.fish.safe_foods.length)]} (enough to be consumed in 2-3 minutes)
              • Evening: Rotation of ${foodOptions.fish.safe_foods[Math.floor(Math.random() * foodOptions.fish.safe_foods.length)]} or ${foodOptions.fish.treats[Math.floor(Math.random() * foodOptions.fish.treats.length)]}
              • Weekly: ${foodOptions.fish.supplements[Math.floor(Math.random() * foodOptions.fish.supplements.length)]} for additional nutrients
            `
          },
          {
            title: "Water Quality",
            content: "Regular water changes (25% weekly) and water testing are essential for fish health. Maintain appropriate pH, ammonia, nitrite, and nitrate levels for your specific fish species."
          },
          {
            title: "Feeding Guidelines",
            content: "Only feed what can be consumed in 2-3 minutes. Overfeeding leads to poor water quality and fish health problems."
          },
          {
            title: "Special Considerations",
            content: healthConditions ? 
              `Based on the health conditions you've mentioned, monitor water parameters more frequently and consider specialized foods for specific health support.` : 
              "Different fish species have different dietary needs. This is a general plan that should be adjusted based on your specific fish species."
          }
        ];
      }

      setDietPlan(plan);
      setIsGenerating(false);
      setStep(2);
    }, 2000);
  };

  const handleSavePlan = () => {
    if (!dietPlan) return;
    
    // Get existing plans
    const savedPlans = JSON.parse(localStorage.getItem('savedPetPlans') || '[]');
    
    // Create a new plan object
    const newPlan = {
      id: planId || `diet-${Date.now()}`,
      type: 'diet',
      title: `Diet Plan for ${petName || 'Pet'}`,
      description: `Custom diet plan for ${petType} with ${activityLevel} activity`,
      timestamp: Date.now(),
      petName: petName || undefined,
      petType: petType,
      petAge: petAge,
      activityLevel: activityLevel,
      allergies: allergies,
      healthConditions: healthConditions,
      planData: dietPlan
    };
    
    // Check if we're updating an existing plan
    if (planId) {
      const planIndex = savedPlans.findIndex((plan: any) => plan.id === planId);
      if (planIndex >= 0) {
        savedPlans[planIndex] = newPlan;
        localStorage.setItem('savedPetPlans', JSON.stringify(savedPlans));
        toast.success('Plan updated successfully');
        return;
      }
    }
    
    // Otherwise add as a new plan
    savedPlans.push(newPlan);
    localStorage.setItem('savedPetPlans', JSON.stringify(savedPlans));
    setIsSaved(true);
    
    toast.success('Plan saved successfully');
    
    // Navigate to saved plans to see it
    setTimeout(() => {
      navigate('/saved-plans');
    }, 1000);
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Pet Diet Plan</h1>
      </div>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create a Custom Diet Plan</CardTitle>
            <CardDescription>
              Enter your pet's information to generate a personalized diet plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pet-name">Pet's Name (Optional)</Label>
              <Input
                id="pet-name"
                placeholder="Buddy"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pet-type">Pet Type</Label>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger id="pet-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                  <SelectItem value="fish">Fish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pet-age">Pet Age</Label>
              <Select value={petAge} onValueChange={setPetAge}>
                <SelectTrigger id="pet-age">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Baby/Puppy/Kitten</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activity-level">Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger id="activity-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Sedentary, indoor only)</SelectItem>
                  <SelectItem value="moderate">Moderate (Regular walks/play)</SelectItem>
                  <SelectItem value="high">High (Athletic, very active)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies (Optional)</Label>
              <Textarea
                id="allergies"
                placeholder="List any food allergies or sensitivities"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="health-conditions">Health Conditions (Optional)</Label>
              <Textarea
                id="health-conditions"
                placeholder="List any health conditions that may affect diet"
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={generateDietPlan} disabled={!petType || isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                "Generate Diet Plan"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 2 && dietPlan && (
        <>
          <Alert variant="brief" className="border border-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              AI-generated plan. Consult a professional before implementation.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>{dietPlan.title}</CardTitle>
              <CardDescription>
                Personalized diet plan for {dietPlan.petName || "your pet"} ({dietPlan.petAge} {dietPlan.petType} with {dietPlan.activityLevel} activity level)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dietPlan.recommendations.map((rec: any, index: number) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-lg font-medium">{rec.title}</h3>
                  <p className="whitespace-pre-line">{rec.content}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <div className="flex items-center space-x-2 w-full">
                <Label htmlFor="save-pet-name" className="min-w-24">Save for pet:</Label>
                <Input 
                  id="save-pet-name" 
                  placeholder="Pet name (optional)" 
                  value={petName} 
                  onChange={(e) => setPetName(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button 
                className="w-full text-base" 
                onClick={handleSavePlan}
              >
                <BookmarkCheck className="mr-2 h-4 w-4" /> 
                {isSaved ? "Update Saved Plan" : "Save This Plan"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                Modify Details
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default DietPlanPage;
