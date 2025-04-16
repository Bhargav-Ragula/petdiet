
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Sun, 
  Coffee, 
  Sunset, 
  Moon, 
  CalendarCheck, 
  Utensils, 
  Bone, 
  Dog, 
  Cat, 
  Dumbbell, 
  Medal, 
  Heart, 
  BookOpen, 
  Lightbulb
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("generate");

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
      training: <Dumbbell className="h-8 w-8 text-primary" />,
      health: <Heart className="h-8 w-8 text-primary" />,
      activities: <Medal className="h-8 w-8 text-primary" />,
      grooming: <BookOpen className="h-8 w-8 text-primary" />,
      social: <Lightbulb className="h-8 w-8 text-primary" />
    };
    return icons[type] || <Heart className="h-8 w-8 text-primary" />;
  }

  function getPetIcon(petType: string) {
    switch(petType?.toLowerCase()) {
      case 'dog': return <Dog className="h-6 w-6 mr-2" />;
      case 'cat': return <Cat className="h-6 w-6 mr-2" />;
      default: return <Bone className="h-6 w-6 mr-2" />;
    }
  }

  async function onSubmit(data: FormData) {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setIsUsingFallback(false);
    setActiveTab("generate");

    try {
      const { data: planData, error } = await supabase.functions.invoke("generate-pet-care-plan", {
        body: { ...data, planType }
      });

      if (error) throw new Error(error.message);

      setGeneratedPlan(planData.carePlan);
      setPetDetails(planData.metadata);
      setIsUsingFallback(planData.generatedBy === "fallback");
      
      toast.success(`${planTitle} generated successfully!`);
      setActiveTab("results");
    } catch (error) {
      console.error("Failed to generate plan:", error);
      toast.error(`Failed to generate ${planTitle.toLowerCase()}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  }

  // Function to parse the plan sections from markdown-like text
  const parsePlanSections = (planText: string) => {
    if (!planText) return { header: "", sections: [] };

    const lines = planText.split('\n');
    let header = '';
    const sections: { title: string, content: string[], isSchedule: boolean }[] = [];
    let currentSection: { title: string, content: string[], isSchedule: boolean } | null = null;

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        header = line.replace('# ', '');
      } else if (line.startsWith('## ')) {
        if (currentSection) sections.push(currentSection);
        const title = line.replace('## ', '');
        const isSchedule = title.includes('Schedule') || title.includes('Daily') || 
                          title.includes('Morning') || title.includes('Evening');
        currentSection = { title, content: [], isSchedule };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    });

    if (currentSection) sections.push(currentSection);
    return { header, sections };
  };

  // Render a time-based schedule section
  const renderScheduleSection = (section: { title: string, content: string[] }) => {
    const timeBlocks: { time: string, icon: JSX.Element, title: string, items: string[] }[] = [];
    let currentTime = '';
    let currentItems: string[] = [];

    section.content.forEach(line => {
      if (line.startsWith('### 🌅 Morning')) {
        currentTime = line.replace('### 🌅 Morning', '').trim();
        currentItems = [];
      } else if (line.startsWith('### 🕛 Midday')) {
        if (currentTime) {
          timeBlocks.push({ 
            time: currentTime, 
            icon: <Sun className="h-5 w-5 text-yellow-500" />, 
            title: 'Morning', 
            items: [...currentItems] 
          });
        }
        currentTime = line.replace('### 🕛 Midday', '').trim();
        currentItems = [];
      } else if (line.startsWith('### 🌇 Afternoon')) {
        if (currentTime) {
          timeBlocks.push({ 
            time: currentTime, 
            icon: <Coffee className="h-5 w-5 text-amber-600" />, 
            title: 'Midday', 
            items: [...currentItems] 
          });
        }
        currentTime = line.replace('### 🌇 Afternoon', '').trim();
        currentItems = [];
      } else if (line.startsWith('### 🌙 Evening')) {
        if (currentTime) {
          timeBlocks.push({ 
            time: currentTime, 
            icon: <Sunset className="h-5 w-5 text-orange-500" />, 
            title: 'Afternoon', 
            items: [...currentItems] 
          });
        }
        currentTime = line.replace('### 🌙 Evening', '').trim();
        currentItems = [];
      } else if (line.startsWith('### 🌠 Night')) {
        if (currentTime) {
          timeBlocks.push({ 
            time: currentTime, 
            icon: <Moon className="h-5 w-5 text-indigo-400" />, 
            title: 'Evening', 
            items: [...currentItems] 
          });
        }
        currentTime = line.replace('### 🌠 Night', '').trim();
        currentItems = [];
      } else if (line.trim() !== '') {
        // Handle items (bullet points or regular text)
        const cleanedLine = line.replace(/^- /, '');
        if (cleanedLine) {
          currentItems.push(cleanedLine);
        }
      }
    });

    // Add the last time block
    if (currentTime) {
      timeBlocks.push({ 
        time: currentTime, 
        icon: currentTime.includes('Night') ? 
          <Moon className="h-5 w-5 text-blue-900" /> : 
          <Moon className="h-5 w-5 text-indigo-400" />, 
        title: currentTime.includes('Night') ? 'Night' : 'Evening', 
        items: [...currentItems] 
      });
    }

    return (
      <div className="space-y-4 mt-3">
        {timeBlocks.map((block, idx) => (
          <Card key={idx} className="overflow-hidden border-l-4 border-l-primary/60">
            <CardHeader className="py-3 bg-muted/50 flex flex-row items-center">
              <div className="mr-3 bg-background rounded-full p-2">
                {block.icon}
              </div>
              <div>
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" /> 
                  {block.title} {block.time}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <ul className="space-y-1 list-disc pl-5 text-sm">
                {block.items.map((item, i) => (
                  <li key={i} className="text-muted-foreground">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render a regular content section
  const renderContentSection = (section: { title: string, content: string[] }) => {
    return (
      <div className="mt-3">
        <div className="flex items-center mb-2">
          <CalendarCheck className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">{section.title}</h3>
        </div>
        <div className="pl-7 space-y-1">
          {section.content.map((line, i) => {
            if (line.trim() === '') return null;
            
            if (line.startsWith('- ')) {
              return <p key={i} className="flex items-start text-muted-foreground text-sm">
                <span className="mr-2 mt-1.5 h-1 w-1 rounded-full bg-primary/70 flex-shrink-0"></span>
                <span>{line.replace(/^- /, '')}</span>
              </p>;
            }
            
            return <p key={i} className="text-muted-foreground text-sm">{line}</p>;
          })}
        </div>
      </div>
    );
  };

  // Determine gradient based on plan type
  const getPlanGradient = () => {
    const gradients: Record<string, string> = {
      nutrition: "from-orange-100 to-amber-50",
      training: "from-blue-100 to-sky-50",
      health: "from-red-100 to-rose-50",
      activities: "from-green-100 to-emerald-50",
      grooming: "from-purple-100 to-violet-50",
      social: "from-yellow-100 to-amber-50"
    };
    return gradients[planType] || "from-primary/10 to-secondary/10";
  };

  // Get breed-specific tips or image based on breed name
  const getBreedSpecificContent = () => {
    // This could be expanded with a larger database of breed-specific tips
    return null;
  };

  return (
    <div className="py-6 space-y-6">
      <div className="mb-6">
        <div className={`bg-gradient-to-r ${getPlanGradient()} p-6 rounded-lg mb-6`}>
          <div className="flex items-center">
            {getPlanIcon(planType)}
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-foreground">{planTitle} Generator</h1>
              <p className="text-muted-foreground">{getPlanDescription(planType)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Medal className="h-6 w-6 text-primary mr-2" />
                <span>Personalized</span>
              </CardTitle>
              <CardDescription>Tailored to your pet's unique needs</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CalendarCheck className="h-6 w-6 text-primary mr-2" />
                <span>Structured</span>
              </CardTitle>
              <CardDescription>Detailed daily schedule for your pet</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="h-6 w-6 text-primary mr-2" />
                <span>Expert Guidance</span>
              </CardTitle>
              <CardDescription>Based on professional recommendations</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                          <SelectTrigger className="bg-background">
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
                        <Input placeholder="e.g. Golden Retriever" {...field} className="bg-background" />
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
                        <Input type="number" placeholder="e.g. 5" {...field} className="bg-background" />
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
                        <Input type="number" placeholder="e.g. 25" {...field} className="bg-background" />
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
                        <SelectTrigger className="bg-background">
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
                        className="bg-background" 
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
          {generatedPlan && petDetails && (
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

              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className={`bg-gradient-to-r ${getPlanGradient()} flex flex-row items-center gap-4`}>
                  <div className="bg-white/80 rounded-full p-3 shadow-sm">
                    {getPetIcon(petDetails.petType)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      {getPlanIcon(planType)}
                      <CardTitle className="text-xl ml-2">
                        {planTitle} for {petDetails.breed} {petDetails.petType}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.age} years
                      </span>
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.weight} lbs
                      </span>
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.activityLevel} activity
                      </span>
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 px-6">
                  {(() => {
                    const { header, sections } = parsePlanSections(generatedPlan);
                    return (
                      <div className="prose max-w-none">
                        {sections.map((section, index) => (
                          <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                            {section.isSchedule ? 
                              renderScheduleSection(section) : 
                              renderContentSection(section)}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
                
                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between bg-muted/30 px-6 py-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('generate')}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Edit Pet Details
                  </Button>
                  <Button 
                    onClick={() => window.print()} 
                    className="print:hidden w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Print Plan
                  </Button>
                </CardFooter>
              </Card>

              <div className="text-sm text-muted-foreground mt-4 p-4 border border-muted rounded-md bg-muted/20">
                <p>Disclaimer: This plan is generated by AI and should be used as general guidance only. 
                Always consult with a veterinary professional for advice specific to your pet's health needs.</p>
              </div>

              <Button 
                onClick={() => navigate('/discover')}
                variant="outline" 
                className="mt-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
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
