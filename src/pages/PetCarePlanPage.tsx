
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Loader2 } from "lucide-react";

interface CarePlanData {
  title: string;
  description: string;
  steps: { id: number; text: string; }[];
  tips: string[];
  resources: { title: string; url: string; }[];
}

const PetCarePlanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('type') || 'training';
  const [isLoading, setIsLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<CarePlanData | null>(null);

  // Mock data based on plan type
  const planTitles: Record<string, string> = {
    'training': 'Pet Training Plan',
    'activities': 'Pet Activities Plan',
    'grooming': 'Pet Grooming Plan',
    'social': 'Pet Socialization Plan',
  };

  useEffect(() => {
    // Simulate API call to generate plan
    const generatePlan = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data based on plan type
      let mockPlan: CarePlanData;

      if (planType === 'social') {
        mockPlan = {
          title: "Pet Socialization Plan",
          description: "A tailored plan to help your pet socialize with other animals and humans, including nearby pet events.",
          steps: [
            { id: 1, text: "Start with short, positive interactions with friendly dogs." },
            { id: 2, text: "Visit dog parks during quieter hours initially." },
            { id: 3, text: "Attend a beginner obedience class to practice social skills." },
            { id: 4, text: "Schedule play dates with dogs of similar temperament." },
            { id: 5, text: "Gradually expose your pet to different environments and people." }
          ],
          tips: [
            "Always reward good social behavior with treats and praise.",
            "Watch for signs of stress and remove your pet from situations if needed.",
            "Keep initial meetings brief and positive.",
            "Consider your pet's personality when choosing social activities."
          ],
          resources: [
            { title: "Pet Meetup: Park Playdate", url: "#" },
            { title: "Local Dog Show - This Weekend", url: "#" },
            { title: "Pet-Friendly Café Gathering - Thursdays", url: "#" },
            { title: "Puppy Training Social Hour - Saturdays", url: "#" }
          ]
        };
      } else if (planType === 'training') {
        mockPlan = {
          title: "Pet Training Plan",
          description: "A structured approach to teaching your pet essential commands and behaviors.",
          steps: [
            { id: 1, text: "Start with basic commands like sit, stay, and come." },
            { id: 2, text: "Practice for 10-15 minutes, 2-3 times daily." },
            { id: 3, text: "Use positive reinforcement with treats and praise." },
            { id: 4, text: "Gradually increase difficulty and distractions." },
            { id: 5, text: "Maintain consistency in commands and expectations." }
          ],
          tips: [
            "Keep training sessions short and fun.",
            "End each session on a positive note.",
            "Be patient and celebrate small victories.",
            "Use high-value treats for more challenging behaviors."
          ],
          resources: [
            { title: "Beginner Training Guide", url: "#" },
            { title: "Clicker Training Basics", url: "#" },
            { title: "Troubleshooting Common Training Issues", url: "#" }
          ]
        };
      } else if (planType === 'activities') {
        mockPlan = {
          title: "Pet Activities Plan",
          description: "Fun and engaging activities to keep your pet physically and mentally stimulated.",
          steps: [
            { id: 1, text: "Include 30 minutes of walking daily." },
            { id: 2, text: "Incorporate puzzle toys for mental stimulation." },
            { id: 3, text: "Try new games like fetch, tug-of-war, or hide-and-seek." },
            { id: 4, text: "Practice agility exercises using household items." },
            { id: 5, text: "Schedule regular playdates with other pets." }
          ],
          tips: [
            "Vary activities to prevent boredom.",
            "Adjust intensity based on your pet's age and health.",
            "Include both physical and mental exercises.",
            "Watch for signs of fatigue or overexertion."
          ],
          resources: [
            { title: "DIY Pet Toys", url: "#" },
            { title: "Indoor Games for Rainy Days", url: "#" },
            { title: "Beginner Pet Agility Guide", url: "#" }
          ]
        };
      } else if (planType === 'grooming') {
        mockPlan = {
          title: "Pet Grooming Plan",
          description: "Regular grooming routines to keep your pet clean, healthy, and comfortable.",
          steps: [
            { id: 1, text: "Brush your pet's coat 2-3 times weekly." },
            { id: 2, text: "Bathe monthly using pet-safe shampoo." },
            { id: 3, text: "Clean ears weekly with approved cleaner." },
            { id: 4, text: "Trim nails every 3-4 weeks." },
            { id: 5, text: "Brush teeth daily with pet toothpaste." }
          ],
          tips: [
            "Start grooming routines when your pet is young.",
            "Use positive reinforcement to create good associations.",
            "Invest in proper grooming tools for your pet's coat type.",
            "Check for skin issues, lumps, or parasites during grooming."
          ],
          resources: [
            { title: "Breed-Specific Grooming Techniques", url: "#" },
            { title: "Dealing with Anxious Pets During Grooming", url: "#" },
            { title: "Seasonal Grooming Tips", url: "#" }
          ]
        };
      } else {
        // Default plan if type doesn't match
        mockPlan = {
          title: "Custom Pet Care Plan",
          description: "A customized care plan for your pet's needs.",
          steps: [
            { id: 1, text: "Assess your pet's current needs and behaviors." },
            { id: 2, text: "Establish a consistent daily routine." },
            { id: 3, text: "Monitor progress and adjust as needed." }
          ],
          tips: [
            "Consistency is key to pet care success.",
            "Always consult with your veterinarian for health concerns.",
            "Adjust care plans as your pet ages."
          ],
          resources: [
            { title: "General Pet Care Guidelines", url: "#" },
            { title: "Nutrition Basics", url: "#" }
          ]
        };
      }

      setCarePlan(mockPlan);
      setIsLoading(false);
    };

    generatePlan();
  }, [planType]);

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
          <ChevronLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{planTitles[planType] || "Pet Care Plan"}</h1>
      </div>

      {isLoading ? (
        <Card className="w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Generating your personalized pet care plan...</p>
            <p className="text-sm text-muted-foreground text-center">
              Our AI is creating a custom plan based on best practices for {planType.replace('-', ' ')}
            </p>
          </div>
        </Card>
      ) : carePlan && (
        <>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{carePlan.title}</CardTitle>
              <CardDescription>{carePlan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Step-by-Step Guide</h3>
                <div className="space-y-2">
                  {carePlan.steps.map(step => (
                    <div key={step.id} className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {step.id}
                      </div>
                      <p>{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Tips & Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {carePlan.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              {planType === 'social' && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Nearby Pet Events</h3>
                  <div className="grid gap-2">
                    {carePlan.resources.map((resource, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{resource.title}</p>
                            <Button variant="outline" size="sm">Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {planType !== 'social' && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Helpful Resources</h3>
                  <div className="space-y-2">
                    {carePlan.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{resource.title}</span>
                        <Button variant="link" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <div className="flex items-center space-x-2 w-full">
                <Checkbox id="save" />
                <Label htmlFor="save">Save this plan to my profile</Label>
              </div>
              <Button className="w-full">Apply This Plan</Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default PetCarePlanPage;
