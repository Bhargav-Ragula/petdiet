
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  PawPrint, 
  Activity, 
  Apple, 
  Heart,
  Clock,
  Sun,
  Coffee,
  Sunset,
  Moon,
  CalendarCheck,
  Utensils,
  Dog,
  Cat
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const petTypes = ["Dog", "Cat", "Bird", "Fish", "Hamster", "Rabbit", "Other"];
const activityLevels = ["Low", "Moderate", "High", "Very High"];

const formSchema = z.object({
  petType: z.string().min(1, { message: "Pet type is required" }),
  breed: z.string().min(1, { message: "Breed is required" }),
  age: z.string().min(1, { message: "Age is required" }),
  weight: z.string().min(1, { message: "Weight is required" }),
  activityLevel: z.string().min(1, { message: "Activity level is required" }),
  dietaryRestrictions: z.string().optional(),
});

const DietPlanPage = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [isFromFallback, setIsFromFallback] = useState(false);
  const [petDetails, setPetDetails] = useState<Record<string, string> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: "",
      breed: "",
      age: "",
      weight: "",
      activityLevel: "",
      dietaryRestrictions: "",
    },
  });

  function getPetIcon(petType: string) {
    switch(petType?.toLowerCase()) {
      case 'dog': return <Dog className="h-6 w-6 mr-2" />;
      case 'cat': return <Cat className="h-6 w-6 mr-2" />;
      default: return <PawPrint className="h-6 w-6 mr-2" />;
    }
  }

  // Parse the diet plan sections from markdown-like text
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setDietPlan(null);
    setIsFromFallback(false);
    setPetDetails(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-diet-plan', {
        body: {
          petType: values.petType,
          breed: values.breed,
          age: values.age,
          weight: values.weight,
          activityLevel: values.activityLevel,
          dietaryRestrictions: values.dietaryRestrictions,
        },
      });

      if (error) {
        toast.error("Failed to generate diet plan");
        console.error("Function error:", error);
        return;
      }

      setDietPlan(data.dietPlan);
      setPetDetails(data.metadata);
      
      // Check if the response was generated by the fallback
      if (data.generatedBy === "fallback") {
        setIsFromFallback(true);
        toast.warning("Used fallback diet plan due to API limitations", {
          description: "The diet plan was generated locally as a fallback."
        });
      } else {
        toast.success("Diet plan generated successfully!");
      }
    } catch (error) {
      console.error("Error generating diet plan:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          AI Pet Diet Plan
        </h1>
      </div>

      {!dietPlan ? (
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-2 space-y-4">
            <Card className="bg-gradient-to-br from-background to-muted border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <PawPrint className="h-5 w-5 text-primary" />
                  Why Diet Matters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A tailored diet plan ensures your pet gets the right nutrition 
                  based on their specific needs, promoting better health, energy,
                  and longevity.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-background to-muted border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-5 w-5 text-secondary" />
                  Activity & Nutrition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Active pets need more calories and protein, while less active 
                  ones require fewer calories to maintain a healthy weight.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-background to-muted border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Apple className="h-5 w-5 text-green-500" />
                  Balanced Diet Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A balanced diet helps prevent obesity, supports the immune system,
                  promotes healthy skin and coat, and reduces the risk of digestive issues.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="md:col-span-3 border-0 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Enter Your Pet's Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="petType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select pet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {petTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="Enter breed" {...field} className="bg-background" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter age" {...field} className="bg-background" />
                          </FormControl>
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
                            <Input type="number" placeholder="Enter weight" {...field} className="bg-background" />
                          </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activityLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions/Special Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any allergies, health concerns, or preferences? (optional)" 
                            className="resize-none bg-background" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include any allergies, health concerns or preferences your pet has
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full font-semibold"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Diet Plan...
                      </>
                    ) : (
                      "Generate Diet Plan"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-50">
            <div className="flex items-center gap-4">
              <div className="bg-white/80 rounded-full p-3 shadow-sm">
                {getPetIcon(petDetails?.petType || '')}
              </div>
              <div>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center">
                    <Utensils className="h-6 w-6 text-primary mr-2" />
                    Pet Diet Plan
                    {isFromFallback && (
                      <div className="ml-4 flex items-center text-amber-500 text-sm font-normal bg-amber-50 px-3 py-1 rounded-full">
                        <AlertCircle size={16} className="mr-1" />
                        Fallback Plan
                      </div>
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  {petDetails && (
                    <>
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.breed}
                      </span>
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.age} years
                      </span>
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.weight} lbs
                      </span>
                      <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs">
                        {petDetails.activityLevel} activity
                      </span>
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 px-6">
            {(() => {
              const { header, sections } = parsePlanSections(dietPlan);
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
              onClick={() => {
                setDietPlan(null);
                setPetDetails(null);
              }}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit Pet Details
            </Button>
            <Button 
              onClick={() => window.print()} 
              className="print:hidden w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Print Diet Plan
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Our AI-generated diet plans are for informational purposes only. Always consult with a veterinarian before making significant changes to your pet's diet.</p>
      </div>
    </div>
  );
};

export default DietPlanPage;
