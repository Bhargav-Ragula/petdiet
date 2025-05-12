
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Form schema
const formSchema = z.object({
  petName: z.string().min(1, "Pet name is required"),
  petType: z.string().min(1, "Pet type is required"),
  petAge: z.string().min(1, "Pet age is required"),
  petWeight: z.string().min(1, "Pet weight is required"),
  activityLevel: z.number().min(1).max(5),
  allergies: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  currentDiet: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Pet types options
const petTypes = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "hamster", label: "Hamster" },
  { value: "other", label: "Other" },
];

// Age groups
const ageGroups = [
  { value: "puppy", label: "Puppy/Kitten (0-1 year)" },
  { value: "young", label: "Young (1-3 years)" },
  { value: "adult", label: "Adult (3-7 years)" },
  { value: "senior", label: "Senior (7+ years)" },
];

// Define the food option types for better type safety
type DogFoodOptions = {
  proteins: string[];
  vegetables: string[];
  fruits: string[];
  grains: string[];
  treats: string[];
};

type CatFoodOptions = {
  proteins: string[];
  vegetables: string[];
  supplements: string[];
  treats: string[];
};

type RabbitFoodOptions = {
  hays: string[];
  vegetables: string[];
  fruits: string[];
  pellets: string[];
};

type BirdFoodOptions = {
  seeds: string[];
  fruits: string[];
  vegetables: string[];
  protein: string[];
};

type HamsterFoodOptions = {
  seeds: string[];
  vegetables: string[];
  fruits: string[];
  protein: string[];
  commercial: string[];
};

type OtherFoodOptions = {
  safe_foods: string[];
  supplements: string[];
  treats: string[];
};

// Combined food options type
type FoodOptions = {
  dog: DogFoodOptions;
  cat: CatFoodOptions;
  rabbit: RabbitFoodOptions;
  bird: BirdFoodOptions;
  hamster: HamsterFoodOptions;
  other: OtherFoodOptions;
};

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petName: "",
      petType: "",
      petAge: "",
      petWeight: "",
      activityLevel: 3,
      allergies: "",
      dietaryRestrictions: "",
      currentDiet: "",
    },
  });

  const generateUniqueDietPlan = (values: FormValues) => {
    // Get random elements to make plans more unique
    const getRandomElement = (array: string[]) => array[Math.floor(Math.random() * array.length)];
    
    // Define example food options based on pet type
    const foodOptions: FoodOptions = {
      dog: {
        proteins: ['lean chicken breast', 'ground turkey', 'salmon', 'lean beef', 'eggs', 'sardines in water', 'cottage cheese'],
        vegetables: ['steamed broccoli', 'carrots', 'green beans', 'sweet potatoes', 'pumpkin', 'spinach', 'zucchini'],
        fruits: ['blueberries', 'apple slices (no seeds)', 'banana', 'watermelon (no seeds)', 'strawberries', 'cantaloupe'],
        grains: ['cooked brown rice', 'oatmeal', 'quinoa', 'barley'],
        treats: ['dehydrated sweet potato', 'carrot sticks', 'frozen yogurt drops', 'apple slices', 'banana chips']
      },
      cat: {
        proteins: ['boiled chicken', 'canned tuna in water', 'lean turkey', 'cooked egg whites', 'small amounts of liver', 'small portions of salmon'],
        vegetables: ['steamed carrots', 'pumpkin puree', 'peas', 'finely chopped spinach', 'small amount of broccoli'],
        supplements: ['fish oil', 'taurine supplement', 'specialized cat multivitamin', 'hairball remedy paste'],
        treats: ['freeze-dried chicken', 'small amounts of cooked fish', 'commercial cat dental treats', 'small pieces of cheese']
      },
      rabbit: {
        hays: ['timothy hay', 'orchard grass', 'meadow hay', 'oat hay'],
        vegetables: ['romaine lettuce', 'kale', 'carrot tops', 'bell peppers', 'cilantro', 'basil', 'parsley', 'dill'],
        fruits: ['small apple pieces', 'blueberries', 'strawberry tops', 'banana (small amounts)', 'pear slices'],
        pellets: ['timothy-based pellets', 'alfalfa-based pellets (for young rabbits)']
      },
      bird: {
        seeds: ['sunflower seeds', 'safflower seeds', 'millet', 'flax seeds', 'hemp seeds'],
        fruits: ['apple slices', 'banana', 'berries', 'orange segments', 'papaya', 'mango'],
        vegetables: ['leafy greens', 'carrots', 'broccoli', 'bell peppers', 'sweet corn'],
        protein: ['cooked egg', 'small amounts of cooked chicken', 'commercial bird pellets']
      },
      hamster: {
        seeds: ['sunflower seeds', 'pumpkin seeds', 'flax seeds'],
        vegetables: ['cucumber', 'carrots', 'kale', 'broccoli', 'romaine lettuce'],
        fruits: ['apple pieces (no seeds)', 'banana slices', 'blueberries', 'pear'],
        protein: ['small pieces of boiled egg', 'mealworms', 'plain cooked chicken'],
        commercial: ['hamster pellets', 'hamster mix with dried vegetables']
      },
      other: {
        safe_foods: ['commercial specialized food', 'vegetables appropriate for species', 'proteins appropriate for species'],
        supplements: ['species-specific vitamins', 'calcium supplements if needed'],
        treats: ['species-appropriate treats', 'fresh food items suitable for the specific animal']
      }
    };
    
    // Generate specific meal plans based on pet type and other factors
    const petType = values.petType.toLowerCase() as keyof FoodOptions;
    const petTypeData = foodOptions[petType] || foodOptions.other;
    const petName = values.petName;
    const activityLevel = values.activityLevel;
    const allergies = values.allergies?.toLowerCase() || '';
    
    let breakfast, lunch, dinner, snacks, supplements;
    let mealPlan = {};
    let nutritionalBreakdown = {};
    
    // Create unique meal plans based on pet type
    if (petType === 'dog') {
      const dogData = petTypeData as DogFoodOptions;
      // Filter out allergens if specified
      const safeProteins = dogData.proteins.filter(p => !allergies.includes(p.toLowerCase()));
      const safeVeggies = dogData.vegetables.filter(v => !allergies.includes(v.toLowerCase()));
      const safeGrains = dogData.grains.filter(g => !allergies.includes(g.toLowerCase()));
      
      breakfast = `${getRandomElement(safeProteins)} (${activityLevel > 3 ? '3/4' : '1/2'} cup) with ${getRandomElement(safeVeggies)} (1/4 cup) and a small amount of ${getRandomElement(safeGrains)}`;
      lunch = activityLevel > 3 ? `Small portion of ${getRandomElement(safeProteins)} (1/3 cup)` : "No midday meal needed for less active dogs";
      dinner = `${getRandomElement(safeProteins)} (${activityLevel > 3 ? '3/4' : '1/2'} cup) mixed with ${getRandomElement(safeVeggies)} and ${getRandomElement(safeVeggies)} (1/4 cup total)`;
      snacks = `${getRandomElement(dogData.treats)} as occasional treats, limiting to ${activityLevel > 3 ? '2-3' : '1-2'} small treats per day`;
      supplements = "Omega-3 fatty acid supplement (for coat health), joint supplement for larger breeds";
      
      nutritionalBreakdown = {
        protein: Math.min(30 + (activityLevel * 2), 45),
        fat: Math.min(15 + activityLevel, 20),
        carbs: Math.max(50 - (activityLevel * 3), 30),
        fiber: 5,
      };
      
      mealPlan = {
        breakfast,
        lunch,
        dinner,
        snacks,
        supplements,
        calories: `${Math.round((parseInt(values.petWeight) * 30) * (0.8 + (activityLevel * 0.1)))} calories per day`,
        water: `${Math.round(parseInt(values.petWeight) * 30)} ml of fresh water daily (refreshed twice daily)`
      };
    } 
    else if (petType === 'cat') {
      const catData = petTypeData as CatFoodOptions;
      const safeProteins = catData.proteins.filter(p => !allergies.includes(p.toLowerCase()));
      
      breakfast = `${getRandomElement(safeProteins)} (${activityLevel > 3 ? '3' : '2'} tablespoons) with premium wet food`;
      lunch = activityLevel > 3 ? `Small portion of ${getRandomElement(safeProteins)} (2 tablespoons)` : "No midday meal for less active cats";
      dinner = `Premium cat food with ${getRandomElement(safeProteins)} (${activityLevel > 3 ? '3' : '2'} tablespoons)`;
      snacks = `${getRandomElement(catData.treats)} as occasional treats, not exceeding 10% of daily caloric intake`;
      supplements = `${getRandomElement(catData.supplements)} as recommended by veterinarian`;
      
      nutritionalBreakdown = {
        protein: Math.min(40 + (activityLevel * 2), 50),
        fat: Math.min(20 + activityLevel, 30),
        carbs: Math.max(30 - (activityLevel * 2), 15),
        fiber: 5,
      };
      
      mealPlan = {
        breakfast,
        lunch,
        dinner,
        snacks,
        supplements,
        calories: `${Math.round((parseInt(values.petWeight) * 20) * (0.8 + (activityLevel * 0.1)))} calories per day`,
        water: `${Math.round(parseInt(values.petWeight) * 60)} ml of fresh water daily (cats often prefer running water from a cat fountain)`
      };
    }
    else if (petType === 'rabbit') {
      const rabbitData = petTypeData as RabbitFoodOptions;
      const safeHays = rabbitData.hays.filter(h => !allergies.includes(h.toLowerCase()));
      const safeVeggies = rabbitData.vegetables.filter(v => !allergies.includes(v.toLowerCase()));
      
      breakfast = `Unlimited ${getRandomElement(safeHays)} with ${getRandomElement(safeVeggies)} and ${getRandomElement(safeVeggies)} (1 cup total of vegetables)`;
      lunch = `Fresh ${getRandomElement(safeHays)} and water`;
      dinner = `${getRandomElement(safeVeggies)}, ${getRandomElement(safeVeggies)}, and ${getRandomElement(safeVeggies)} (1 cup total) with a small amount of ${getRandomElement(rabbitData.pellets)}`;
      snacks = `Small piece of ${getRandomElement(rabbitData.fruits)} (limit to 1-2 tablespoons of fruit daily)`;
      supplements = "Occasional herbs like mint or basil, wooden chew toys for dental health";
      
      nutritionalBreakdown = {
        fiber: 70,
        protein: 12,
        fat: 3,
        carbs: 15,
      };
      
      mealPlan = {
        breakfast,
        lunch,
        dinner,
        snacks,
        supplements,
        hay: "Unlimited access to fresh hay throughout the day",
        water: "Fresh water available at all times, changed twice daily"
      };
    }
    else if (petType === 'bird') {
      const birdData = petTypeData as BirdFoodOptions;
      const safeSeeds = birdData.seeds.filter(s => !allergies.includes(s.toLowerCase()));
      const safeVeggies = birdData.vegetables.filter(v => !allergies.includes(v.toLowerCase()));
      const safeFruits = birdData.fruits.filter(f => !allergies.includes(f.toLowerCase()));
      
      breakfast = `Mix of ${getRandomElement(safeSeeds)} and ${getRandomElement(safeSeeds)} (1 teaspoon) with fresh ${getRandomElement(safeVeggies)}`;
      lunch = `Small piece of ${getRandomElement(safeFruits)} or ${getRandomElement(safeVeggies)}`;
      dinner = `Bird pellets supplemented with ${getRandomElement(safeVeggies)} and small amount of ${getRandomElement(birdData.protein)}`;
      snacks = `Millet spray or small amount of ${getRandomElement(safeFruits)}`;
      supplements = "Cuttlebone for calcium, specialized bird vitamins if recommended by avian vet";
      
      nutritionalBreakdown = {
        protein: 15,
        fat: 10,
        carbs: 65,
        fiber: 10,
      };
      
      mealPlan = {
        breakfast,
        lunch,
        dinner,
        snacks,
        supplements,
        water: "Fresh water daily, changed twice a day"
      };
    }
    else if (petType === 'hamster') {
      const hamsterData = petTypeData as HamsterFoodOptions;
      breakfast = `Commercial hamster food mix (1 tablespoon) with ${getRandomElement(hamsterData.seeds)} (few pieces)`;
      lunch = `Small piece of ${getRandomElement(hamsterData.vegetables)} or ${getRandomElement(hamsterData.fruits)}`;
      dinner = `${getRandomElement(hamsterData.commercial)} (1 tablespoon) with tiny amount of ${getRandomElement(hamsterData.protein)}`;
      snacks = `Occasional ${getRandomElement(hamsterData.seeds)} or small piece of ${getRandomElement(hamsterData.fruits)}`;
      supplements = "Chew sticks for dental health";
      
      nutritionalBreakdown = {
        protein: 16,
        fat: 7,
        carbs: 65,
        fiber: 12,
      };
      
      mealPlan = {
        breakfast,
        lunch,
        dinner,
        snacks,
        supplements,
        water: "Fresh water available at all times via bottle drinker"
      };
    }
    else {
      const otherData = petTypeData as OtherFoodOptions;
      // Generic plan for other pet types
      breakfast = "Species-appropriate morning meal";
      lunch = "Light midday nutrition if needed for species";
      dinner = "Species-appropriate evening meal";
      snacks = `${getRandomElement(otherData.treats)}`;
      supplements = `${getRandomElement(otherData.supplements)}`;
      
      nutritionalBreakdown = {
        protein: 25,
        fat: 15,
        carbs: 45,
        fiber: 15,
      };
      
      mealPlan = {
        note: "This is a generic plan. Please consult with a veterinarian specializing in your pet type for specific dietary recommendations.",
        breakfast,
        lunch,
        dinner,
        snacks,
        supplements,
        water: "Fresh water available at all times, refreshed daily"
      };
    }
    
    // Generate some specific recommendations
    const foodRecommendations = [];
    if (petType === 'dog' || petType === 'cat') {
      const commercialBrands = ['Premium Nature Balance', 'Wholesome Health', 'Natural Heritage', 'Vital Nutrition', 'Pure Paws'];
      foodRecommendations.push({
        type: 'Commercial Food',
        options: [
          `${getRandomElement(commercialBrands)} ${values.petAge === 'senior' ? 'Senior' : values.petAge === 'puppy' ? 'Growth' : 'Adult'} Formula`,
          `${getRandomElement(commercialBrands)} ${activityLevel > 3 ? 'Active' : 'Maintenance'} Recipe`,
          `${getRandomElement(commercialBrands)} Limited Ingredient Diet`
        ]
      });
      
      if (petType === 'dog') {
        const dogData = petTypeData as DogFoodOptions;
        foodRecommendations.push({
          type: 'Homemade Options',
          options: [
            `${getRandomElement(dogData.proteins)} with ${getRandomElement(dogData.vegetables)} and ${getRandomElement(dogData.grains)}`,
            `${getRandomElement(dogData.proteins)} and ${getRandomElement(dogData.proteins)} mix with essential supplements`,
            `Balanced ${getRandomElement(dogData.proteins)} patties with vegetables`
          ]
        });
      } else if (petType === 'cat') {
        const catData = petTypeData as CatFoodOptions;
        foodRecommendations.push({
          type: 'Homemade Options',
          options: [
            `${getRandomElement(catData.proteins)} with ${getRandomElement(catData.vegetables)} and small amount of vegetables`,
            `${getRandomElement(catData.proteins)} and ${getRandomElement(catData.proteins)} mix with essential supplements`,
            `Balanced ${getRandomElement(catData.proteins)} patties with minimal vegetables`
          ]
        });
      }
    } else {
      foodRecommendations.push({
        type: 'Recommended Foods',
        options: [
          'Species-appropriate commercial food',
          'Fresh vegetation suitable for your pet type',
          'Balanced homemade options as directed by exotic pet veterinarian'
        ]
      });
    }
    
    // Create a unique diet plan with the generated information
    return {
      petName: values.petName,
      petType: values.petType,
      petAge: values.petAge,
      petWeight: values.petWeight,
      activityLevel: values.activityLevel,
      allergies: values.allergies || 'None specified',
      dietaryRestrictions: values.dietaryRestrictions || 'None specified',
      mealPlan,
      nutritionalBreakdown,
      foodRecommendations,
      specialConsiderations: [
        `${petName}'s ${values.petAge} life stage requires ${values.petAge === 'senior' ? 'lower calorie, easier to digest foods' : values.petAge === 'puppy' || values.petAge === 'kitten' ? 'higher protein and fat for growth' : 'balanced nutrition for maintenance'}`,
        `With ${activityLevel === 5 ? 'very high' : activityLevel === 4 ? 'high' : activityLevel === 3 ? 'moderate' : activityLevel === 2 ? 'low' : 'very low'} activity level, ${petName} needs ${activityLevel > 3 ? 'increased calories and protein' : activityLevel < 3 ? 'careful portion control to prevent weight gain' : 'standard portioning appropriate for maintenance'}`,
        values.allergies ? `Avoid all foods containing ${values.allergies}` : 'No specific allergies to avoid',
        values.dietaryRestrictions ? `Follow these dietary restrictions: ${values.dietaryRestrictions}` : 'No specific dietary restrictions noted',
        `Transition slowly to this new diet over 7-10 days by gradually mixing increasing amounts with current food`
      ],
      generationDate: new Date().toLocaleDateString()
    };
  };

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Generate a unique diet plan
      const dietPlan = generateUniqueDietPlan(values);
      setGeneratedPlan(dietPlan);
      setIsGenerating(false);
      setStep(3);
      toast.success(`Diet plan for ${values.petName} created successfully!`);
    }, 2000);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  // Define activity level labels
  const activityLabels = ["Very Low", "Low", "Moderate", "High", "Very High"];

  // Basic information step
  const BasicInformationStep = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="petName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pet Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter your pet's name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="petType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pet Type</FormLabel>
            <Select 
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {petTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="petAge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Age Group</FormLabel>
            <Select 
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ageGroups.map((age) => (
                  <SelectItem key={age.value} value={age.value}>
                    {age.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="petWeight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight (in kg)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter weight" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Diet preferences step
  const DietPreferencesStep = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="activityLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activity Level</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  defaultValue={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {activityLabels.map((label, i) => (
                    <span key={i} className={i + 1 === field.value ? "font-bold text-primary" : ""}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              How active is your pet on a daily basis?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Known Allergies</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="E.g., chicken, grains, etc. (Leave blank if none)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="dietaryRestrictions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dietary Restrictions</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any specific dietary needs or restrictions"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="currentDiet"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Diet</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What does your pet currently eat?"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Generated plan step
  const GeneratedPlanStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Diet Plan for {generatedPlan?.petName}</CardTitle>
        <CardDescription>
          Tailored nutrition based on your pet's needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-2 border-amber-300 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-base font-medium">
            <AlertTitle className="text-amber-800 mb-1">IMPORTANT DISCLAIMER</AlertTitle>
            This diet plan is completely generated using AI and should be used with caution. 
            Before implementing any dietary changes, please consult with a veterinarian or pet nutrition specialist. 
            Every pet has unique nutritional needs that may not be fully addressed by AI-generated advice. 
            Follow this plan at your own risk.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="font-medium">Daily Feeding Recommendations</h3>
          <div className="bg-muted p-3 rounded-md">
            <p>Based on your pet's profile as a {generatedPlan?.petAge} {generatedPlan?.petType} 
            weighing {generatedPlan?.petWeight}kg with {activityLabels[generatedPlan?.activityLevel - 1].toLowerCase()} 
            activity level:</p>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-start">
                <span className="font-medium mr-2 min-w-24">Morning:</span>
                <span>{generatedPlan?.mealPlan.breakfast}</span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium mr-2 min-w-24">Midday:</span>
                <span>{generatedPlan?.mealPlan.lunch}</span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium mr-2 min-w-24">Evening:</span>
                <span>{generatedPlan?.mealPlan.dinner}</span>
              </div>
              
              <div className="flex items-start">
                <span className="font-medium mr-2 min-w-24">Treats:</span>
                <span>{generatedPlan?.mealPlan.snacks}</span>
              </div>
              
              {generatedPlan?.mealPlan.calories && (
                <div className="flex items-start">
                  <span className="font-medium mr-2 min-w-24">Calories:</span>
                  <span>{generatedPlan?.mealPlan.calories}</span>
                </div>
              )}
              
              <div className="flex items-start">
                <span className="font-medium mr-2 min-w-24">Water:</span>
                <span>{generatedPlan?.mealPlan.water}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Nutritional Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Protein</span>
                <span>{generatedPlan?.nutritionalBreakdown.protein}%</span>
              </div>
              <Progress value={generatedPlan?.nutritionalBreakdown.protein} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Fats</span>
                <span>{generatedPlan?.nutritionalBreakdown.fat}%</span>
              </div>
              <Progress value={generatedPlan?.nutritionalBreakdown.fat} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Carbohydrates</span>
                <span>{generatedPlan?.nutritionalBreakdown.carbs}%</span>
              </div>
              <Progress value={generatedPlan?.nutritionalBreakdown.carbs} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Fiber</span>
                <span>{generatedPlan?.nutritionalBreakdown.fiber}%</span>
              </div>
              <Progress value={generatedPlan?.nutritionalBreakdown.fiber} className="h-2 mt-1" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Food Recommendations</h3>
          <div className="space-y-2">
            {generatedPlan?.foodRecommendations.map((rec: any, index: number) => (
              <div key={index} className="p-2 border rounded-md">
                <div className="font-medium">{rec.type}</div>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  {rec.options.map((option: string, i: number) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="p-2 border rounded-md">
              <div className="font-medium">Supplements</div>
              <p className="text-sm mt-1">{generatedPlan?.mealPlan.supplements}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Special Considerations</h3>
          <ul className="list-disc ml-5 space-y-1">
            {generatedPlan?.specialConsiderations.map((consideration: string, index: number) => (
              <li key={index} className="text-sm">{consideration}</li>
            ))}
          </ul>
          
          <p className="text-sm mt-2">
            <span className="font-semibold">Note:</span> This plan was generated on {generatedPlan?.generationDate}. 
            Dietary needs can change over time, so review and adjust regularly in consultation with your veterinarian.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleBackToDashboard}>
          Save Plan & Return to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ChevronLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Create Pet Diet Plan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Basic Information" : 
             step === 2 ? "Diet Preferences" : 
             "Generated Diet Plan"}
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Tell us about your pet" : 
             step === 2 ? "Help us understand your pet's dietary needs" : 
             "Review your personalized diet plan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg">Generating diet plan...</p>
              <p className="text-sm text-muted-foreground text-center">
                Our AI is creating a personalized diet plan for {form.getValues().petName}
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {step === 1 && <BasicInformationStep />}
                {step === 2 && <DietPreferencesStep />}
                {step === 3 && <GeneratedPlanStep />}
                
                {step !== 3 && (
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    
                    {step === 1 ? (
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button type="submit">
                        Generate Plan
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DietPlanPage;

