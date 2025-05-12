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

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  const onSubmit = async (values: FormValues) => {
    console.log(values);
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsGenerating(false);
      setStep(3);
    }, 3000);
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
        <CardTitle>Personalized Diet Plan for {form.getValues().petName}</CardTitle>
        <CardDescription>
          Tailored nutrition based on your pet's needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning" className="border-2 border-amber-300 bg-amber-50">
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
            <p>Based on your pet's profile as a {form.getValues().petAge} {form.getValues().petType} 
            weighing {form.getValues().petWeight}kg with {activityLabels[form.getValues().activityLevel - 1].toLowerCase()} 
            activity level:</p>
            
            <ul className="list-disc ml-5 mt-2">
              <li>Morning: 1/2 cup high-quality {form.getValues().petType} food</li>
              <li>Evening: 1/2 cup high-quality {form.getValues().petType} food with 1 tbsp wet food</li>
              <li>Daily caloric intake: Approximately 250-300 calories</li>
              <li>Water: Fresh water available at all times</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Nutritional Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Protein</span>
                <span>30%</span>
              </div>
              <Progress value={30} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Fats</span>
                <span>15%</span>
              </div>
              <Progress value={15} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Carbohydrates</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Fiber</span>
                <span>5%</span>
              </div>
              <Progress value={5} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Moisture</span>
                <span>5%</span>
              </div>
              <Progress value={5} className="h-2 mt-1" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Food Recommendations</h3>
          <div className="space-y-2">
            <div className="p-2 border rounded-md">
              <div className="font-medium">Premium Dry Food Options</div>
              <ul className="list-disc ml-5 mt-1 text-sm">
                <li>Brand A Grain-Free Formula</li>
                <li>Brand B Healthy Weight Formula</li>
                <li>Brand C Natural Balance Formula</li>
              </ul>
            </div>
            <div className="p-2 border rounded-md">
              <div className="font-medium">Wet Food Supplements</div>
              <ul className="list-disc ml-5 mt-1 text-sm">
                <li>Brand X Pâté Style</li>
                <li>Brand Y Gravy Chunks</li>
              </ul>
            </div>
            <div className="p-2 border rounded-md">
              <div className="font-medium">Treats (Limited to 10% of daily calories)</div>
              <ul className="list-disc ml-5 mt-1 text-sm">
                <li>Dental chews (1 per day)</li>
                <li>Training treats (5-10 small pieces)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Special Considerations</h3>
          <p className="text-sm">
            Based on your input about allergies ({form.getValues().allergies || "none specified"}) 
            and dietary restrictions ({form.getValues().dietaryRestrictions || "none specified"}), 
            we've adjusted this plan to avoid potential allergens and meet specific needs.
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
