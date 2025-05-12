import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChevronLeft, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ActivitiesPlanPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [energyLevel, setEnergyLevel] = useState(50);
  const [activityPreferences, setActivityPreferences] = useState<string[]>([]);
  const [timeAvailable, setTimeAvailable] = useState("30min");
  const [environment, setEnvironment] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Activity preferences options
  const activityOptions = [
    { id: "walk", label: "Walking" },
    { id: "run", label: "Running" },
    { id: "fetch", label: "Fetch/Ball games" },
    { id: "swimming", label: "Swimming" },
    { id: "agility", label: "Agility" },
    { id: "mental", label: "Mental stimulation games" }
  ];
  
  // Environment options
  const environmentOptions = [
    { id: "indoor", label: "Indoor activities" },
    { id: "yard", label: "Backyard" },
    { id: "park", label: "Parks" },
    { id: "trail", label: "Trails/Hiking" },
    { id: "beach", label: "Beach" },
    { id: "water", label: "Lakes/Water bodies" }
  ];

  const handleActivityPreferenceChange = (id: string) => {
    setActivityPreferences(current => 
      current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };
  
  const handleEnvironmentChange = (id: string) => {
    setEnvironment(current => 
      current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const handleGeneratePlan = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setStep(3); // Move to success step
      setIsLoading(false);
      toast.success("Activities plan generated successfully!");
    }, 2000);
  };

  const renderStepOne = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
            <ChevronLeft size={20} />
          </Button>
          <CardTitle className="text-2xl">Create Pet Activities Plan</CardTitle>
        </div>
        <CardDescription className="text-lg">
          Tell us about your pet to generate a customized activities plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="petName" className="text-base">Pet Name</Label>
            <Input 
              id="petName" 
              placeholder="Enter your pet's name" 
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petType" className="text-base">Pet Type</Label>
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger id="petType">
                <SelectValue placeholder="Select pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Dog</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="petBreed" className="text-base">Breed</Label>
            <Input 
              id="petBreed" 
              placeholder="Enter breed" 
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petAge" className="text-base">Age</Label>
            <Input 
              id="petAge" 
              placeholder="Years" 
              value={petAge}
              onChange={(e) => setPetAge(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Energy Level</Label>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Energy</span>
              <span>High Energy</span>
            </div>
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              value={[energyLevel]}
              onValueChange={(values) => setEnergyLevel(values[0])}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/")}>
          Cancel
        </Button>
        <Button onClick={() => setStep(2)}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStepTwo = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="mr-2">
            <ChevronLeft size={20} />
          </Button>
          <CardTitle className="text-2xl">Activity Preferences</CardTitle>
        </div>
        <CardDescription className="text-lg">
          Tell us about your activity preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Activity Preferences (select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {activityOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`activity-${option.id}`} 
                  checked={activityPreferences.includes(option.id)} 
                  onCheckedChange={() => handleActivityPreferenceChange(option.id)}
                />
                <Label htmlFor={`activity-${option.id}`} className="text-sm cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeAvailable">Time Available Daily</Label>
          <Select value={timeAvailable} onValueChange={setTimeAvailable}>
            <SelectTrigger id="timeAvailable">
              <SelectValue placeholder="Select available time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15min">Less than 15 minutes</SelectItem>
              <SelectItem value="30min">15-30 minutes</SelectItem>
              <SelectItem value="60min">30-60 minutes</SelectItem>
              <SelectItem value="90min">60-90 minutes</SelectItem>
              <SelectItem value="120min+">More than 90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Available Environment (select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {environmentOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`env-${option.id}`} 
                  checked={environment.includes(option.id)} 
                  onCheckedChange={() => handleEnvironmentChange(option.id)}
                />
                <Label htmlFor={`env-${option.id}`} className="text-sm cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea 
            id="additionalInfo" 
            placeholder="Any specific needs, limitations, or preferences?" 
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handleGeneratePlan}>
          Generate Activities Plan
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center flex flex-col items-center text-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Calendar size={32} className="text-primary" />
          </div>
          Activities Plan Generated!
        </CardTitle>
        <CardDescription className="text-center text-lg">
          Your custom activities plan for {petName || "your pet"} is ready
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-base">
            <strong>AI-Generated Content:</strong> This activities plan was created by AI and should be adapted to your pet's 
            specific needs and abilities. Always monitor your pet during new activities and consult with your veterinarian 
            about appropriate exercise levels.
          </AlertDescription>
        </Alert>
      
        <div className="border rounded-lg p-5 space-y-4">
          <h3 className="font-medium text-xl">Daily Activities</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                1
              </div>
              <div className="pt-1">
                <p className="text-base">Morning: 15-minute walk to explore and exercise</p>
                <p className="text-sm text-muted-foreground mt-1">Example: Morning route through the neighborhood allowing sniffing time at bushes and trees for mental stimulation</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                2
              </div>
              <div className="pt-1">
                <p className="text-base">Midday: 10-minute fetch or tug game for mental stimulation</p>
                <p className="text-sm text-muted-foreground mt-1">Example: Use a plush squeaky toy for indoor tug-of-war or a rubber ball for backyard fetch, alternating between toys to maintain interest</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                3
              </div>
              <div className="pt-1">
                <p className="text-base">Evening: 20-minute leisurely walk with sniffing time</p>
                <p className="text-sm text-muted-foreground mt-1">Example: Evening route through a local park or quiet streets, allowing your pet to set the pace and explore scents</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-5">
          <h3 className="font-medium mb-3 text-xl">Weekly Activities</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-base">Monday & Thursday:</span>
              <span className="text-base">Park visit with fetch games using a tennis ball launcher</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-base">Tuesday & Friday:</span>
              <span className="text-base">Enrichment toys like treat-dispensing puzzle balls or snuffle mats</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-base">Wednesday:</span>
              <span className="text-base">Training combined with play using treats hidden throughout a room</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-base">Weekend:</span>
              <span className="text-base">Longer adventure walk or hike on pet-friendly trails</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-5">
          <h3 className="font-medium mb-3 text-xl">Indoor Activity Ideas</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-base">Hide and seek with treats: Hide treats throughout a room and encourage your pet to find them all</li>
            <li className="text-base">DIY obstacle course: Use sofa cushions to create jumps, chairs to weave through, and tunnels made from blankets</li>
            <li className="text-base">Puzzle toys: Kong toys filled with frozen peanut butter, treat-dispensing balls, or snuffle mats made from fleece strips</li>
            <li className="text-base">Indoor fetch: Roll balls down a hallway or use soft toys for gentle indoor retrieve games</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full text-base" onClick={() => navigate("/pet-care-plan?type=activities")}>
          View Full Activities Plan
        </Button>
        <Button variant="outline" className="w-full text-base" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </CardFooter>
    </Card>
  );

  const renderLoading = () => (
    <Card className="w-full p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xl">Creating your pet's activities plan...</p>
        <p className="text-lg text-muted-foreground text-center">
          Our AI is designing a tailored activity schedule based on your pet's energy level and preferences
        </p>
      </div>
    </Card>
  );

  if (isLoading) {
    return renderLoading();
  }

  switch (step) {
    case 1:
      return renderStepOne();
    case 2:
      return renderStepTwo();
    case 3:
      return renderSuccess();
    default:
      return renderStepOne();
  }
};

export default ActivitiesPlanPage;
