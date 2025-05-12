import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChevronLeft, Dumbbell, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const TrainingPlanPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [trainingGoals, setTrainingGoals] = useState<string[]>([]);
  const [trainingLevel, setTrainingLevel] = useState("beginner");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  // Training goal options
  const trainingGoalOptions = [
    { id: "basic", label: "Basic commands (sit, stay, come)" },
    { id: "advanced", label: "Advanced commands" },
    { id: "behavior", label: "Behavior correction" },
    { id: "tricks", label: "Tricks training" },
    { id: "socialization", label: "Socialization" },
    { id: "agility", label: "Agility training" },
  ];

  const handleTrainingGoalChange = (id: string) => {
    setTrainingGoals(current => 
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
      toast.success("Training plan generated successfully!");
    }, 2000);
  };

  const renderStepOne = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
            <ChevronLeft size={20} />
          </Button>
          <CardTitle className="text-2xl">Create Pet Training Plan</CardTitle>
        </div>
        <CardDescription className="text-lg">
          Tell us about your pet to generate a customized training plan
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
              className="text-base"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petType" className="text-base">Pet Type</Label>
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger id="petType" className="text-base">
                <SelectValue placeholder="Select pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog" className="text-base">Dog</SelectItem>
                <SelectItem value="cat" className="text-base">Cat</SelectItem>
                <SelectItem value="other" className="text-base">Other</SelectItem>
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
              className="text-base"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="petAge" className="text-base">Age</Label>
            <Input 
              id="petAge" 
              placeholder="Years" 
              value={petAge}
              onChange={(e) => setPetAge(e.target.value)}
              className="text-base"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="petWeight" className="text-base">Weight (lbs/kg)</Label>
          <Input 
            id="petWeight" 
            placeholder="Enter weight" 
            value={petWeight}
            onChange={(e) => setPetWeight(e.target.value)}
            className="text-base"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/")} className="text-base">
          Cancel
        </Button>
        <Button onClick={() => setStep(2)} className="text-base">
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
          <CardTitle className="text-2xl">Training Goals</CardTitle>
        </div>
        <CardDescription className="text-lg">
          Select your training goals and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base">Training Goals (select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {trainingGoalOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id} 
                  checked={trainingGoals.includes(option.id)} 
                  onCheckedChange={() => handleTrainingGoalChange(option.id)}
                />
                <Label htmlFor={option.id} className="text-base cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="trainingLevel" className="text-base">Current Training Level</Label>
          <Select value={trainingLevel} onValueChange={setTrainingLevel}>
            <SelectTrigger id="trainingLevel" className="text-base">
              <SelectValue placeholder="Select training level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner" className="text-base">Beginner (No previous training)</SelectItem>
              <SelectItem value="intermediate" className="text-base">Intermediate (Knows basic commands)</SelectItem>
              <SelectItem value="advanced" className="text-base">Advanced (Well trained)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additionalInfo" className="text-base">Additional Information</Label>
          <Textarea 
            id="additionalInfo" 
            placeholder="Any specific behaviors or challenges? Special needs?" 
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            className="text-base"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)} className="text-base">
          Back
        </Button>
        <Button onClick={handleGeneratePlan} className="text-base">
          Generate Training Plan
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center flex flex-col items-center text-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Dumbbell size={32} className="text-primary" />
          </div>
          Training Plan Generated!
        </CardTitle>
        <CardDescription className="text-center text-lg">
          Your custom training plan for {petName || "your pet"} is ready
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-base">
            <strong>AI-Generated Content:</strong> This training plan was created by AI and should be reviewed by a professional 
            trainer before implementation. Every pet is unique and may require personalized adaptations.
          </AlertDescription>
        </Alert>
        
        <div className="border rounded-lg p-5 space-y-4">
          <h3 className="font-medium text-xl">Basic Commands Training</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                1
              </div>
              <div className="pt-1">
                <p className="text-base">Start with "Sit" command using treat luring technique, 5-10 minutes daily</p>
                <p className="text-sm text-muted-foreground mt-1">Example: Hold a small piece of chicken at your pet's nose, then raise it slowly over their head until they sit naturally, then immediately reward and say "Sit"</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                2
              </div>
              <div className="pt-1">
                <p className="text-base">Progress to "Stay" command once sit is reliable, gradually increasing duration</p>
                <p className="text-sm text-muted-foreground mt-1">Example: Ask for a sit, say "Stay" with your palm facing them, take one step back, return immediately and reward. Gradually increase to 3 steps, then 5 steps</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                3
              </div>
              <div className="pt-1">
                <p className="text-base">Practice "Come" command in enclosed areas with minimal distractions</p>
                <p className="text-sm text-muted-foreground mt-1">Example: In a hallway, have someone hold your pet while you move away, call their name excitedly followed by "Come!", crouch down with open arms, reward heavily when they reach you</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-5">
          <h3 className="font-medium mb-3 text-xl">Weekly Schedule</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-base">Monday & Thursday:</span>
              <span className="text-base">Basic Commands (15 minutes)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-base">Tuesday & Friday:</span>
              <span className="text-base">Behavior Practice (10 minutes)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-base">Wednesday:</span>
              <span className="text-base">Skills Review (10 minutes)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-base">Weekend:</span>
              <span className="text-base">Fun Training Games & Practice</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-5">
          <h3 className="font-medium mb-3 text-xl">Training Tips</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-base">Keep sessions short (5-7 minutes) and end on a positive note with a command they know well</li>
            <li className="text-base">Use high-value treats like small pieces of boiled chicken, cheese, or freeze-dried liver</li>
            <li className="text-base">Practice in different environments as skills improve - start in quiet rooms, then move to more distracting areas</li>
            <li className="text-base">Be consistent with command words and hand signals - ensure all family members use the same cues</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full text-base" onClick={() => navigate("/pet-care-plan?type=training")}>
          View Full Training Plan
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
        <p className="text-xl">Generating personalized training plan...</p>
        <p className="text-lg text-muted-foreground text-center">
          Our AI is analyzing your pet's details and creating the perfect training routine
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

export default TrainingPlanPage;
