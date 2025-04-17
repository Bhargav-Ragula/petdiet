
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
import { Loader2, ChevronLeft, Calendar } from "lucide-react";
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
            <ChevronLeft size={18} />
          </Button>
          <CardTitle>Create Pet Activities Plan</CardTitle>
        </div>
        <CardDescription>
          Tell us about your pet to generate a customized activities plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="petName">Pet Name</Label>
            <Input 
              id="petName" 
              placeholder="Enter your pet's name" 
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petType">Pet Type</Label>
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
            <Label htmlFor="petBreed">Breed</Label>
            <Input 
              id="petBreed" 
              placeholder="Enter breed" 
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petAge">Age</Label>
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
            <ChevronLeft size={18} />
          </Button>
          <CardTitle>Activity Preferences</CardTitle>
        </div>
        <CardDescription>
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
        <CardTitle className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Calendar size={32} className="text-primary" />
          </div>
          Activities Plan Generated!
        </CardTitle>
        <CardDescription className="text-center">
          Your custom activities plan for {petName} is ready
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-lg">Daily Activities</h3>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                1
              </div>
              <p>Morning: 15-minute walk to explore and exercise</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                2
              </div>
              <p>Midday: 10-minute fetch or tug game for mental stimulation</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                3
              </div>
              <p>Evening: 20-minute leisurely walk with sniffing time</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Weekly Activities</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Monday & Thursday:</span>
              <span>Park visit with fetch games</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Tuesday & Friday:</span>
              <span>Enrichment toys and puzzles</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Wednesday:</span>
              <span>Training combined with play</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Weekend:</span>
              <span>Longer adventure walk or hike</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Indoor Activity Ideas</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hide and seek with treats or toys</li>
            <li>DIY obstacle course using furniture</li>
            <li>Puzzle toys filled with treats</li>
            <li>Indoor fetch in a hallway</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full" onClick={() => navigate("/pet-care-plan?type=activities")}>
          View Full Activities Plan
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </CardFooter>
    </Card>
  );

  const renderLoading = () => (
    <Card className="w-full p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Creating your pet's activities plan...</p>
        <p className="text-sm text-muted-foreground text-center">
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
