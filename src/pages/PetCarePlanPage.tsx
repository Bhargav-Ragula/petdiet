import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";

interface CarePlanData {
  title: string;
  description: string;
  steps: { id: number; text: string; }[];
  tips: string[];
  resources: { title: string; url: string; }[];
  examples?: string[];
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
    'diet': 'Pet Diet Plan',
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
            "Always reward good social behavior with treats like small pieces of boiled chicken or cheese.",
            "Watch for signs of stress such as tucked tail, pinned ears, or excessive panting, and remove your pet from situations if needed.",
            "Keep initial meetings brief (5-10 minutes) and positive, gradually extending time as comfort increases.",
            "Consider your pet's personality when choosing social activities - some may prefer one-on-one play while others enjoy group settings."
          ],
          resources: [
            { title: "Pet Meetup: Park Playdate - Central Park, Saturday 10AM", url: "#" },
            { title: "Local Dog Show - Riverside Fairgrounds, This Weekend", url: "#" },
            { title: "Pet-Friendly Café Gathering - Pawsome Cafe, Thursdays 6PM", url: "#" },
            { title: "Puppy Training Social Hour - PetSmart Store #1242, Saturdays 11AM", url: "#" }
          ],
          examples: [
            "For shy dogs: Try 'parallel walking' with another calm dog at a distance before direct interaction",
            "For reactive cats: Use a carrier or baby gate to allow safe visual exposure to visitors",
            "For puppies: Organize a small group play session with 2-3 other puppies in a controlled environment",
            "For older pets: Consider senior-specific social groups that feature gentler interaction"
          ]
        };
      } else if (planType === 'training') {
        mockPlan = {
          title: "Pet Training Plan",
          description: "A structured approach to teaching your pet essential commands and behaviors.",
          steps: [
            { id: 1, text: "Start with basic commands like sit, stay, and come using positive reinforcement." },
            { id: 2, text: "Practice for 10-15 minutes, 2-3 times daily, ending before your pet gets tired or bored." },
            { id: 3, text: "Use high-value treats like small pieces of chicken, cheese, or freeze-dried liver for rewards." },
            { id: 4, text: "Gradually increase difficulty by adding distractions like toys or practicing in new locations." },
            { id: 5, text: "Maintain consistency in commands, hand signals, and expectations across all family members." }
          ],
          tips: [
            "Keep training sessions short (5-10 minutes) and end with a fun play session to maintain interest.",
            "End each session with a command your pet knows well to finish on a positive note.",
            "Be patient and celebrate small victories - even minor progress deserves praise and rewards.",
            "Use special high-value treats like pieces of cooked chicken or small bits of cheese for more challenging behaviors."
          ],
          resources: [
            { title: "Beginner Training Guide: The Power of Positive Reinforcement", url: "#" },
            { title: "Clicker Training Basics: Timing is Everything", url: "#" },
            { title: "Troubleshooting Common Training Issues: Distractions and Consistency", url: "#" }
          ],
          examples: [
            "For 'Sit' training: Hold a treat above your dog's nose, then move it back over their head until they naturally sit, then reward immediately",
            "For 'Come' command: Start in a hallway with minimal distractions, call your pet's name followed by 'come' in an enthusiastic voice",
            "For 'Leave it' training: Place a treat under your shoe, let your dog sniff but not get it, reward with a BETTER treat when they look away",
            "For 'Stay' practice: Ask for a sit, say 'stay' with palm out, take one step back, return and reward. Gradually increase distance"
          ]
        };
      } else if (planType === 'activities') {
        mockPlan = {
          title: "Pet Activities Plan",
          description: "Fun and engaging activities to keep your pet physically and mentally stimulated.",
          steps: [
            { id: 1, text: "Include 30 minutes of walking daily, split between morning and evening if possible." },
            { id: 2, text: "Incorporate puzzle toys like treat-dispensing balls or snuffle mats for daily mental stimulation." },
            { id: 3, text: "Try new games like fetch with different toys, tug-of-war with rope toys, or hide-and-seek with treats." },
            { id: 4, text: "Practice agility exercises using household items like hula hoops to jump through or broom handles as jumps." },
            { id: 5, text: "Schedule regular playdates with compatible pets at local dog parks or in your backyard." }
          ],
          tips: [
            "Vary activities between physical exercise, mental stimulation, and social interaction to prevent boredom.",
            "Adjust intensity based on your pet's age, health, and breed - puppies need short bursts while seniors need gentler activities.",
            "Include both physical exercise (walks, fetch) and mental challenges (puzzle toys, training games) each day.",
            "Watch for signs of fatigue or overexertion like excessive panting, lagging behind, or refusing to continue."
          ],
          resources: [
            { title: "DIY Pet Toys: 10 Enrichment Toys You Can Make at Home", url: "#" },
            { title: "Indoor Games for Rainy Days: Keeping Your Pet Active Inside", url: "#" },
            { title: "Beginner Pet Agility Guide: Safe Household Obstacle Courses", url: "#" }
          ],
          examples: [
            "Indoor scent games: Hide treats around the house at different heights and encourage your pet to 'find it'",
            "DIY agility course: Use cushions to jump over, chairs to weave through, and hula hoops to jump through",
            "Water play: For water-loving dogs, use a kiddie pool with floating toys in summer months",
            "Frozen treats: Make popsicles with chicken broth (no onions/garlic) or yogurt with fruits for hot days"
          ]
        };
      } else if (planType === 'grooming') {
        mockPlan = {
          title: "Pet Grooming Plan",
          description: "Regular grooming routines to keep your pet clean, healthy, and comfortable.",
          steps: [
            { id: 1, text: "Brush your pet's coat 2-3 times weekly using appropriate brushes for their specific coat type." },
            { id: 2, text: "Bathe monthly (or as needed) using a gentle, pet-safe shampoo formulated for their coat type." },
            { id: 3, text: "Clean ears weekly with a veterinary-approved ear cleaner and cotton balls (never cotton swabs)." },
            { id: 4, text: "Trim nails every 3-4 weeks using proper pet nail clippers, cutting just below the quick." },
            { id: 5, text: "Brush teeth daily with enzymatic pet toothpaste and a soft-bristled pet toothbrush." }
          ],
          tips: [
            "Start grooming routines when your pet is young with short, positive sessions to create good associations.",
            "Use treats, praise, and patience to create positive experiences during grooming sessions.",
            "Invest in proper grooming tools for your pet's specific coat type - slicker brushes for long fur, curry combs for short coats.",
            "Check for skin issues, lumps, parasites, or unusual odors during grooming sessions and consult your vet if concerns arise."
          ],
          resources: [
            { title: "Breed-Specific Grooming Techniques for Common Dog Breeds", url: "#" },
            { title: "Dealing with Anxious Pets During Grooming: Gentle Approach Methods", url: "#" },
            { title: "Seasonal Grooming Tips: Special Care for Winter and Summer", url: "#" }
          ],
          examples: [
            "For dogs with double coats: Use an undercoat rake during shedding season, followed by a slicker brush to remove loose fur",
            "For nail trimming: Start with just handling paws during calm moments, rewarding with treats before attempting trimming",
            "For bath time: Place a non-slip mat in the tub, use lukewarm water, and have treats ready to reward good behavior",
            "For ear cleaning: Use cotton balls dampened with dog ear cleaner, gently wipe visible parts only, never insert anything into the ear canal"
          ]
        };
      } else if (planType === 'diet') {
        mockPlan = {
          title: "Pet Diet Plan",
          description: "A balanced nutrition plan tailored to your pet's specific needs, age, and activity level.",
          steps: [
            { id: 1, text: "Feed consistent meals at the same times each day using measured portions appropriate for your pet's weight." },
            { id: 2, text: "Choose high-quality commercial pet food with meat as the first ingredient and minimal fillers." },
            { id: 3, text: "Transition to new foods gradually over 7-10 days by mixing increasing amounts with the old food." },
            { id: 4, text: "Provide fresh water at all times, washing water bowls daily to prevent bacteria growth." },
            { id: 5, text: "Monitor weight monthly and adjust portions as needed to maintain ideal body condition." }
          ],
          tips: [
            "Consult your veterinarian before making major diet changes, especially for pets with health conditions.",
            "Treats should make up no more than 10% of your pet's daily caloric intake to maintain balanced nutrition.",
            "Avoid feeding table scraps which can lead to digestive upset and unhealthy weight gain.",
            "Learn to read pet food labels - look for named meat sources and avoid products with excessive fillers or by-products."
          ],
          resources: [
            { title: "Understanding Pet Food Labels: What Quality Ingredients Look Like", url: "#" },
            { title: "Calorie Calculator: Determining Your Pet's Daily Nutritional Needs", url: "#" },
            { title: "Safe Human Foods for Pets: Healthy Additions to Their Diet", url: "#" }
          ],
          examples: [
            "For adult dogs: Premium dry kibble (3/4 cup AM, 3/4 cup PM for medium dogs) with occasional fresh additions like plain cooked chicken or steamed vegetables",
            "For kittens: High-protein wet kitten food (3-4 small meals daily) supplemented with quality kitten kibble for dental health",
            "For senior pets: Easy-to-digest senior formula with added supplements like glucosamine for joint health",
            "For overweight pets: Measured portions of weight management formula, using green beans or carrots as low-calorie treats"
          ]
        };
      } else {
        // Default plan if type doesn't match
        mockPlan = {
          title: "Custom Pet Care Plan",
          description: "A customized care plan for your pet's needs.",
          steps: [
            { id: 1, text: "Assess your pet's current needs and behaviors." },
            { id: 2, text: "Establish a consistent daily routine for feeding, exercise, and rest." },
            { id: 3, text: "Monitor progress and adjust care practices as needed based on your pet's response." }
          ],
          tips: [
            "Consistency is key to pet care success - try to maintain regular schedules for all activities.",
            "Always consult with your veterinarian for health concerns or before making significant changes to care.",
            "Adjust care plans as your pet ages or if their health status changes."
          ],
          resources: [
            { title: "General Pet Care Guidelines: Essential Knowledge for Pet Parents", url: "#" },
            { title: "Nutrition Basics: Meeting Your Pet's Dietary Needs", url: "#" }
          ],
          examples: [
            "For new pet owners: Start with a simple routine of consistent feeding times, regular short play sessions, and scheduled potty breaks",
            "For multiple pets: Create separate feeding stations to monitor individual consumption and prevent resource guarding",
            "For pets with special needs: Consult with your veterinarian for customized care recommendations specific to their condition"
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
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{planTitles[planType] || "Pet Care Plan"}</h1>
      </div>

      {isLoading ? (
        <Card className="w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xl">Generating your personalized pet care plan...</p>
            <p className="text-base text-muted-foreground text-center">
              Our AI is creating a custom plan based on best practices for {planType.replace('-', ' ')}
            </p>
          </div>
        </Card>
      ) : carePlan && (
        <>
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-base">
              <strong>AI-Generated Content:</strong> This pet care plan was generated by AI and should be reviewed by a professional 
              veterinarian or pet care specialist before implementation. Individual pets may have unique needs not addressed in this general plan.
            </AlertDescription>
          </Alert>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">{carePlan.title}</CardTitle>
              <CardDescription className="text-lg">{carePlan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-base">
              <div>
                <h3 className="text-xl font-medium mb-4">Step-by-Step Guide</h3>
                <div className="space-y-3">
                  {carePlan.steps.map(step => (
                    <div key={step.id} className="flex items-start space-x-3">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base">
                        {step.id}
                      </div>
                      <p className="text-base pt-1">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {carePlan.examples && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Practical Examples</h3>
                  <ul className="list-disc pl-6 space-y-3">
                    {carePlan.examples.map((example, index) => (
                      <li key={index} className="text-base">{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-xl font-medium mb-4">Tips & Recommendations</h3>
                <ul className="list-disc pl-6 space-y-3">
                  {carePlan.tips.map((tip, index) => (
                    <li key={index} className="text-base">{tip}</li>
                  ))}
                </ul>
              </div>

              {planType === 'social' && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Nearby Pet Events</h3>
                  <div className="grid gap-3">
                    {carePlan.resources.map((resource, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-base">{resource.title}</p>
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
                  <h3 className="text-xl font-medium mb-4">Helpful Resources</h3>
                  <div className="space-y-3">
                    {carePlan.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span className="text-base">{resource.title}</span>
                        <Button variant="link" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <div className="flex items-center space-x-2 w-full">
                <Checkbox id="save" />
                <Label htmlFor="save" className="text-base">Save this plan to my profile</Label>
              </div>
              <Button className="w-full text-base">Apply This Plan</Button>
              <Button variant="outline" className="w-full text-base" onClick={() => navigate("/")}>
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
