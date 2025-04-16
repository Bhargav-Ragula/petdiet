
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Utensils, Activity, ThumbsUp, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Form schema
const formSchema = z.object({
  petType: z.string().min(1, "Pet type is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.string().min(1, "Age is required"),
  weight: z.string().min(1, "Weight is required"),
  activityLevel: z.string().min(1, "Activity level is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ACTIVITY_LEVELS = ["Low", "Moderate", "High", "Very High"];
const PET_TYPES = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Fish", "Reptile", "Other"];

const PetCarePlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const planType = new URLSearchParams(location.search).get("type") || "nutrition";
  const planTitle = getPlanTitle(planType);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [petDetails, setPetDetails] = useState<Record<string, string> | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: "",
      breed: "",
      age: "",
      weight: "",
      activityLevel: "Moderate",
      notes: "",
    },
  });

  function getPlanTitle(type: string): string {
    const titles: Record<string, string> = {
      nutrition: "Nutrition Plan",
      training: "Training Plan",
      health: "Healthcare Plan",
      activities: "Activities Plan",
      grooming: "Grooming Plan",
      social: "Socialization Plan"
    };
    return titles[type] || "Pet Care Plan";
  }

  function getPlanDescription(type: string): string {
    const descriptions: Record<string, string> = {
      nutrition: "Personalized diet and feeding schedule",
      training: "Behavior training and tricks",
      health: "Wellness and preventative care routine",
      activities: "Exercise and play recommendations",
      grooming: "Cleaning and maintenance guide",
      social: "Interaction strategies with humans and other animals"
    };
    return descriptions[type] || "Personalized care recommendations";
  }

  function getPlanIcon(type: string) {
    const icons: Record<string, JSX.Element> = {
      nutrition: <Utensils className="h-8 w-8 text-primary" />,
      training: <Activity className="h-8 w-8 text-primary" />,
      health: <ThumbsUp className="h-8 w-8 text-primary" />,
      activities: <Activity className="h-8 w-8 text-primary" />,
      grooming: <Utensils className="h-8 w-8 text-primary" />,
      social: <ThumbsUp className="h-8 w-8 text-primary" />
    };
    return icons[type] || <ThumbsUp className="h-8 w-8 text-primary" />;
  }

  async function onSubmit(data: FormData) {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setIsUsingFallback(false);

    try {
      const { data: planData, error } = await supabase.functions.invoke("generate-pet-care-plan", {
        body: { ...data, planType }
      });

      if (error) throw new Error(error.message);

      setGeneratedPlan(planData.carePlan);
      setPetDetails(planData.metadata);
      setIsUsingFallback(planData.generatedBy === "fallback");
      
      toast.success(`${planTitle} generated successfully!`);
    } catch (error) {
      console.error("Failed to generate plan:", error);
      toast.error(`Failed to generate ${planTitle.toLowerCase()}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="py-6 space-y-6">
      <div className="mb-6">
        <div className="bg-gradient-to-r from-primary/40 to-secondary/40 p-4 rounded-lg mb-4">
          <h1 className="text-2xl font-bold text-foreground">{planTitle} Generator</h1>
          <p className="text-muted-foreground">{getPlanDescription(planType)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                {getPlanIcon(planType)}
                <span className="ml-2">Personalized</span>
              </CardTitle>
              <CardDescription>Tailored to your pet's needs</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ThumbsUp className="h-8 w-8 text-primary mr-2" />
                <span>Expert Guidance</span>
              </CardTitle>
              <CardDescription>Based on professional recommendations</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-8 w-8 text-primary mr-2" />
                <span>Actionable</span>
              </CardTitle>
              <CardDescription>Practical tips you can implement today</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Plan</TabsTrigger>
          <TabsTrigger value="results" disabled={!generatedPlan}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="bg-muted/50 p-5 rounded-lg mb-4">
            <h2 className="text-lg font-semibold mb-2">Tell us about your pet</h2>
            <p className="text-sm text-muted-foreground">
              Fill in your pet's details below and we'll create a personalized {planTitle.toLowerCase()} for them.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {PET_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Golden Retriever" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Allergies, health issues, or preferences" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generating Plan..." : `Generate ${planTitle}`}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="results">
          {generatedPlan && (
            <div className="space-y-4">
              {isUsingFallback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
                  <AlertCircle className="text-yellow-600 mr-2 h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Fallback Plan Generated</h3>
                    <p className="text-yellow-700 text-sm">
                      This is a basic plan generated locally due to AI service limitations. 
                      For more detailed plans, please try again later.
                    </p>
                  </div>
                </div>
              )}

              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-xl">
                    {planTitle} for {petDetails?.breed} {petDetails?.petType}
                  </CardTitle>
                  <CardDescription>
                    {petDetails?.age} years old • {petDetails?.weight} lbs • {petDetails?.activityLevel} activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    {generatedPlan.split('\n').map((line, i) => {
                      // Handle headers (lines starting with #)
                      if (line.startsWith('# ')) {
                        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h2>;
                      }
                      // Handle subheaders (lines starting with ##)
                      else if (line.startsWith('## ')) {
                        return <h3 key={i} className="text-lg font-bold mt-3 mb-1">{line.replace('## ', '')}</h3>;
                      }
                      // Handle bullet points
                      else if (line.startsWith('- ')) {
                        return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
                      }
                      // Handle empty lines
                      else if (line.trim() === '') {
                        return <div key={i} className="h-2" />;
                      }
                      // Regular text
                      else {
                        return <p key={i} className="mb-2">{line}</p>;
                      }
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground mt-4 p-3 border border-muted rounded-md">
                <p>Disclaimer: This plan is generated by AI and should be used as general guidance only. 
                Always consult with a veterinary professional for advice specific to your pet's health needs.</p>
              </div>

              <Button 
                onClick={() => navigate('/discover')}
                variant="outline" 
                className="mt-4"
              >
                Back to Discover
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PetCarePlanPage;
