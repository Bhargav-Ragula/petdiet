import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ChevronLeft, Scissors, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const GroomingPlanPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [petBreed, setPetBreed] = useState("");
  const [coatType, setCoatType] = useState("");
  const [coatLength, setCoatLength] = useState("medium");
  const [shedding, setShedding] = useState("moderate");
  const [groomingConcerns, setGroomingConcerns] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Grooming concerns options
  const concernOptions = [
    { id: "matting", label: "Matting" },
    { id: "tangles", label: "Tangles" },
    { id: "shedding", label: "Excessive shedding" },
    { id: "odor", label: "Odor" },
    { id: "skin", label: "Skin issues" },
    { id: "nails", label: "Overgrown nails" }
  ];

  const handleConcernChange = (id: string) => {
    setGroomingConcerns(current => 
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
      toast.success("Grooming plan generated successfully!");
    }, 2000);
  };

  const renderStepOne = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
            <ChevronLeft size={18} />
          </Button>
          <CardTitle>Create Pet Grooming Plan</CardTitle>
        </div>
        <CardDescription>
          Tell us about your pet to generate a customized grooming plan
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
          <Label htmlFor="coatType">Coat Type</Label>
          <Select value={coatType} onValueChange={setCoatType}>
            <SelectTrigger id="coatType">
              <SelectValue placeholder="Select coat type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">Straight</SelectItem>
              <SelectItem value="curly">Curly</SelectItem>
              <SelectItem value="wiry">Wiry</SelectItem>
              <SelectItem value="double">Double coat</SelectItem>
              <SelectItem value="hairless">Hairless/Very short</SelectItem>
              <SelectItem value="silky">Silky/Flowing</SelectItem>
            </SelectContent>
          </Select>
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
          <CardTitle>Grooming Details</CardTitle>
        </div>
        <CardDescription>
          Tell us more about your pet's grooming needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Coat Length</Label>
          <RadioGroup value={coatLength} onValueChange={setCoatLength} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id="short" />
              <Label htmlFor="short">Short</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="long" id="long" />
              <Label htmlFor="long">Long</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Shedding Level</Label>
          <RadioGroup value={shedding} onValueChange={setShedding} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="minimal" />
              <Label htmlFor="minimal">Minimal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate">Moderate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="heavy" id="heavy" />
              <Label htmlFor="heavy">Heavy</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Grooming Concerns (select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {concernOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id} 
                  checked={groomingConcerns.includes(option.id)} 
                  onCheckedChange={() => handleConcernChange(option.id)}
                />
                <Label htmlFor={option.id} className="text-sm cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea 
            id="additionalInfo" 
            placeholder="Any specific grooming needs or challenges?" 
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
          Generate Grooming Plan
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Scissors size={32} className="text-primary" />
          </div>
          Grooming Plan Generated!
        </CardTitle>
        <CardDescription className="text-center">
          Your custom grooming plan for {petName} is ready
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="warning" className="border-2 border-amber-300 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-base font-medium">
            <AlertTitle className="text-amber-800 mb-1">IMPORTANT DISCLAIMER</AlertTitle>
            This grooming plan is completely generated using AI and should be used with caution. 
            Please consult with a professional pet groomer or veterinarian before implementing any 
            recommendations. Follow this plan at your own risk, as every pet has unique needs that 
            may not be fully addressed by AI-generated advice.
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-lg">Regular Grooming Routine</h3>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                1
              </div>
              <p>Brush coat 3-4 times weekly with a slicker brush and comb</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                2
              </div>
              <p>Bath every 4-6 weeks with gentle shampoo, followed by conditioner</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                3
              </div>
              <p>Clean ears weekly with pet-safe ear cleaner</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                4
              </div>
              <p>Trim nails every 2-3 weeks</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                5
              </div>
              <p>Brush teeth daily or at least 3 times per week</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Recommended Products</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Brushes:</span>
              <span>Slicker brush, Metal comb</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Shampoo:</span>
              <span>Hypoallergenic, oatmeal-based</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">De-shedding:</span>
              <span>Undercoat rake</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Dental:</span>
              <span>Enzymatic toothpaste, soft toothbrush</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Seasonal Adjustments</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Increase brushing frequency during seasonal shedding periods</li>
            <li>Apply pet-safe moisturizer to paw pads in winter</li>
            <li>Consider cooling products and shorter haircuts in summer</li>
            <li>Professional grooming recommended every 8-12 weeks</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full" onClick={() => navigate("/pet-care-plan?type=grooming")}>
          View Full Grooming Plan
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
        <p className="text-lg">Creating your pet's grooming plan...</p>
        <p className="text-sm text-muted-foreground text-center">
          Our AI is designing a customized grooming routine based on your pet's coat type and needs
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

export default GroomingPlanPage;
