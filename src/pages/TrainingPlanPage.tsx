
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronLeft, Dumbbell } from "lucide-react";
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
            <ChevronLeft size={18} />
          </Button>
          <CardTitle>Create Pet Training Plan</CardTitle>
        </div>
        <CardDescription>
          Tell us about your pet to generate a customized training plan
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
          <Label htmlFor="petWeight">Weight (lbs/kg)</Label>
          <Input 
            id="petWeight" 
            placeholder="Enter weight" 
            value={petWeight}
            onChange={(e) => setPetWeight(e.target.value)}
          />
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
          <CardTitle>Training Goals</CardTitle>
        </div>
        <CardDescription>
          Select your training goals and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Training Goals (select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {trainingGoalOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id} 
                  checked={trainingGoals.includes(option.id)} 
                  onCheckedChange={() => handleTrainingGoalChange(option.id)}
                />
                <Label htmlFor={option.id} className="text-sm cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="trainingLevel">Current Training Level</Label>
          <Select value={trainingLevel} onValueChange={setTrainingLevel}>
            <SelectTrigger id="trainingLevel">
              <SelectValue placeholder="Select training level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (No previous training)</SelectItem>
              <SelectItem value="intermediate">Intermediate (Knows basic commands)</SelectItem>
              <SelectItem value="advanced">Advanced (Well trained)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea 
            id="additionalInfo" 
            placeholder="Any specific behaviors or challenges? Special needs?" 
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handleGeneratePlan}>
          Generate Training Plan
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Dumbbell size={32} className="text-primary" />
          </div>
          Training Plan Generated!
        </CardTitle>
        <CardDescription className="text-center">
          Your custom training plan for {petName} is ready
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-lg">Basic Commands Training</h3>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                1
              </div>
              <p>Start with "Sit" command using treat luring technique, 5-10 minutes daily</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                2
              </div>
              <p>Progress to "Stay" command once sit is reliable, gradually increasing duration</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                3
              </div>
              <p>Practice "Come" command in enclosed areas with minimal distractions</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Weekly Schedule</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Monday & Thursday:</span>
              <span>Basic Commands (15 minutes)</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Tuesday & Friday:</span>
              <span>Behavior Practice (10 minutes)</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Wednesday:</span>
              <span>Skills Review (10 minutes)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Weekend:</span>
              <span>Fun Training Games & Practice</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Training Tips</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Keep sessions short and positive</li>
            <li>Use high-value treats for motivation</li>
            <li>Practice in different environments as skills improve</li>
            <li>Be consistent with commands and expectations</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full" onClick={() => navigate("/pet-care-plan?type=training")}>
          View Full Training Plan
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
        <p className="text-lg">Generating personalized training plan...</p>
        <p className="text-sm text-muted-foreground text-center">
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
