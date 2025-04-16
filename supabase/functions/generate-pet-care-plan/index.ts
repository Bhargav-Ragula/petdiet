
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petType, breed, age, weight, activityLevel, notes, planType } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the system prompt based on plan type
    let systemPrompt = '';
    switch (planType) {
      case 'training':
        systemPrompt = `You are a professional pet trainer. Create a detailed, personalized training plan for pets based on the information provided. 
        Include:
        1. Daily training schedule with specific times (morning 6-9am, midday 11am-1pm, afternoon 3-5pm, evening 6-8pm)
        2. Beginner to advanced techniques appropriate for the pet's age and breed
        3. Recommended training tools and treats
        4. Training milestones by week
        5. Tips for common behavioral challenges specific to this breed
        6. Special considerations based on breed-specific traits
        
        Format your response with clear sections with emoji icons where appropriate.`;
        break;
      
      case 'health':
        systemPrompt = `You are a professional veterinary care specialist. Create a detailed, personalized healthcare plan for pets based on the information provided. 
        Include:
        1. Daily care routine with specific times (morning 6-9am, midday 11am-1pm, afternoon 3-5pm, evening 6-8pm)
        2. Preventative care schedule (vaccinations, check-ups)
        3. Grooming and hygiene recommendations
        4. Common health issues to watch for in this breed
        5. Exercise requirements for optimal health
        6. Special considerations based on breed-specific health needs
        
        Format your response with clear sections with emoji icons where appropriate.`;
        break;
      
      case 'activities':
        systemPrompt = `You are a professional pet activity and enrichment specialist. Create a detailed, personalized activity plan for pets based on the information provided. 
        Include:
        1. Daily activity schedule with specific times (morning 6-9am, midday 11am-1pm, afternoon 3-5pm, evening 6-8pm)
        2. Age and breed-appropriate exercise recommendations
        3. Mental stimulation activities and games
        4. Indoor vs outdoor activity balance
        5. Socialization opportunities
        6. Special considerations based on breed-specific energy levels and instincts
        
        Format your response with clear sections with emoji icons where appropriate.`;
        break;
      
      case 'grooming':
        systemPrompt = `You are a professional pet groomer. Create a detailed, personalized grooming plan for pets based on the information provided. 
        Include:
        1. Daily, weekly, and monthly grooming schedule with specific times
        2. Coat care specific to the breed (brushing, bathing frequency)
        3. Nail, ear, teeth, and eye care routines
        4. Recommended grooming tools and products
        5. Professional grooming visit frequency
        6. Special considerations based on breed-specific coat type and skin needs
        
        Format your response with clear sections with emoji icons where appropriate.`;
        break;
      
      case 'social':
        systemPrompt = `You are a professional pet behavior specialist. Create a detailed, personalized socialization plan for pets based on the information provided. 
        Include:
        1. Daily socialization schedule with specific times
        2. Age-appropriate socialization activities
        3. Techniques for introducing to new people, animals, and environments
        4. Signs of stress to watch for and how to address them
        5. Breed-specific social tendencies and how to work with them
        6. Special considerations based on the pet's history and personality traits
        
        Format your response with clear sections with emoji icons where appropriate.`;
        break;
      
      case 'nutrition':
      default:
        systemPrompt = `You are a professional pet nutritionist. Create a detailed, personalized diet plan for pets based on the information provided. 
        Include:
        1. Daily feeding schedule with specific times (morning 6-9am, midday 11am-1pm, afternoon 3-5pm, evening 6-8pm, night 9-11pm)
        2. Portion sizes tailored to the pet's weight and activity level
        3. Recommended foods with specific brands if applicable
        4. Supplement recommendations
        5. Hydration guidance
        6. Special considerations based on breed-specific needs
        
        Format your response with clear sections with emoji icons where appropriate.`;
        break;
    }

    const userPrompt = `Create a ${getPlanTypeName(planType)} plan for a ${age} year old ${breed} ${petType} that weighs ${weight} pounds with ${activityLevel} activity level. ${notes ? `Additional notes: ${notes}.` : ''}`;

    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', JSON.stringify(error, null, 2));
        
        // Generate a fallback response when OpenAI API fails
        const fallbackCarePlan = generateFallbackCarePlan(petType, breed, age, weight, activityLevel, notes, planType);
        
        return new Response(
          JSON.stringify({ 
            carePlan: fallbackCarePlan,
            metadata: { petType, breed, age, weight, activityLevel, notes, planType },
            generatedBy: "fallback" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const carePlan = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ 
          carePlan,
          metadata: { petType, breed, age, weight, activityLevel, notes, planType }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error('Error in OpenAI API call:', error);
      // Generate a fallback response
      const fallbackCarePlan = generateFallbackCarePlan(petType, breed, age, weight, activityLevel, notes, planType);
      
      return new Response(
        JSON.stringify({ 
          carePlan: fallbackCarePlan,
          metadata: { petType, breed, age, weight, activityLevel, notes, planType },
          generatedBy: "fallback" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-pet-care-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getPlanTypeName(type: string): string {
  const names: Record<string, string> = {
    nutrition: "nutrition",
    training: "training",
    health: "healthcare",
    activities: "activity",
    grooming: "grooming",
    social: "socialization"
  };
  return names[type] || "care";
}

// Fallback care plan generator function
function generateFallbackCarePlan(
  petType: string, 
  breed: string, 
  age: string, 
  weight: string, 
  activityLevel: string, 
  notes?: string, 
  planType: string = "nutrition"
): string {
  const petTypeLC = petType.toLowerCase();
  const ageNum = parseInt(age) || 1;
  const weightNum = parseInt(weight) || 10;
  
  // Pet type specific emoji
  const petEmoji = petTypeLC === "dog" ? "🐕" : 
                  petTypeLC === "cat" ? "🐱" : 
                  petTypeLC === "bird" ? "🐦" : 
                  petTypeLC === "fish" ? "🐠" : 
                  petTypeLC === "rabbit" ? "🐰" : "🐾";
  
  // Activity level emoji
  const activityEmoji = activityLevel === "High" || activityLevel === "Very High" ? "🏃" : 
                       activityLevel === "Low" ? "😴" : "🚶";
  
  // Age category
  const ageCategory = petTypeLC === "dog" ? 
                     (ageNum < 2 ? "puppy" : ageNum > 7 ? "senior dog" : "adult dog") :
                     petTypeLC === "cat" ? 
                     (ageNum < 1 ? "kitten" : ageNum > 10 ? "senior cat" : "adult cat") :
                     "pet";

  // Plan type specific emoji
  const planEmoji = planType === "nutrition" ? "🍖" :
                   planType === "training" ? "🎾" :
                   planType === "health" ? "⚕️" :
                   planType === "activities" ? "🏞️" :
                   planType === "grooming" ? "🛁" :
                   planType === "social" ? "🐩" : "📋";
  
  // Generate appropriate plan based on type
  switch (planType) {
    case "training":
      return generateTrainingPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, petEmoji, activityEmoji, ageCategory, notes);
    case "health":
      return generateHealthPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, petEmoji, activityEmoji, ageCategory, notes);
    case "activities":
      return generateActivitiesPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, petEmoji, activityEmoji, ageCategory, notes);
    case "grooming":
      return generateGroomingPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, petEmoji, activityEmoji, ageCategory, notes);
    case "social":
      return generateSocializationPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, petEmoji, activityEmoji, ageCategory, notes);
    case "nutrition":
    default:
      return generateNutritionPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, petEmoji, activityEmoji, ageCategory, notes);
  }
}

function generateNutritionPlan(
  petTypeLC: string, 
  breed: string, 
  ageNum: number, 
  weightNum: number, 
  activityLevel: string,
  petEmoji: string,
  activityEmoji: string,
  ageCategory: string,
  notes?: string
): string {
  // Calculate calorie needs based on weight and activity
  const baseCalories = petTypeLC === "dog" 
    ? Math.round(weightNum * 30 * (activityLevel === "Low" ? 0.8 : activityLevel === "High" || activityLevel === "Very High" ? 1.2 : 1))
    : petTypeLC === "cat" 
    ? Math.round(weightNum * 20 * (activityLevel === "Low" ? 0.8 : activityLevel === "High" || activityLevel === "Very High" ? 1.2 : 1))
    : 0;
  
  // Breed-specific recommendations
  let breedSpecific = "";
  
  if (petTypeLC === "dog") {
    const largeBreeds = ["german shepherd", "labrador", "golden retriever", "rottweiler", "husky"];
    const smallBreeds = ["chihuahua", "pomeranian", "shih tzu", "yorkshire", "dachshund", "pug"];
    
    const breedLC = breed.toLowerCase();
    
    if (largeBreeds.some(b => breedLC.includes(b))) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Large breed formula recommended to support joint health\n- Consider glucosamine supplements for joint support\n- Watch for signs of bloat - feed smaller, more frequent meals\n- Avoid rapid weight gain especially during growth phases`;
    } else if (smallBreeds.some(b => breedLC.includes(b))) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Small breed formula with smaller kibble size recommended\n- Higher calorie density food may be needed due to faster metabolism\n- More frequent meals to prevent hypoglycemia\n- Dental health is especially important - consider dental treats`;
    }
  }
  
  if (petTypeLC === "dog") {
    return `# ${petEmoji} Personalized Diet Plan for ${breed} Dog

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Daily Caloric Need:** Approximately ${baseCalories} calories

## 📅 Daily Feeding Schedule

### 🌅 Morning (6:00-8:00 AM)
- Main meal: ${Math.round(weightNum * 0.12)} oz of high-quality dog food (${Math.round(baseCalories * 0.4)} calories)
- Add 1 tablespoon plain yogurt for probiotics
- Fresh water refill

### 🕛 Midday (11:30 AM-1:00 PM) 
- Healthy treat: 1 medium carrot or apple slice (no seeds)
- Brief walk and water refresh

### 🌇 Afternoon (4:00-5:00 PM)
- Small training treats during short training session (keep under ${Math.round(baseCalories * 0.05)} calories)
- Interactive puzzle toy with small amount of kibble

### 🌙 Evening (6:30-7:30 PM)
- Second main meal: ${Math.round(weightNum * 0.12)} oz of high-quality dog food (${Math.round(baseCalories * 0.4)} calories)
- Add 1 teaspoon fish oil for coat health
- Fresh water refill

### 🌠 Night (Before Bed)
- Optional small bedtime treat for ${ageCategory === "puppy" ? "puppies" : "senior dogs"} (keep under ${Math.round(baseCalories * 0.03)} calories)
- One last bathroom break

## 🥩 Recommended Foods

### Kibble Options
- ${ageCategory === "puppy" ? "Puppy formula" : ageCategory === "senior dog" ? "Senior formula" : "Adult maintenance formula"}
- Options: Royal Canin ${breed.includes(" ") ? breed.split(" ")[0] : breed} Formula, Hill's Science Diet, or Purina Pro Plan

### Fresh Additions
- Lean protein: Cooked chicken, turkey, or fish (no bones)
- Vegetables: Carrots, green beans, pumpkin
- Fruits (occasional): Blueberries, apple slices (no seeds)

## 💧 Hydration
- Provide access to fresh, clean water at all times
- Wash bowl daily and refill at least twice per day
- For picky drinkers, consider pet fountain

## 💊 Supplements
- Omega-3 fatty acids: 1,000mg daily for joint health and coat
- ${ageNum > 7 ? "Glucosamine/chondroitin for senior joint health" : "Multivitamin formulated for " + ageCategory + "s"}
- Probiotics to support digestive health

${breedSpecific || ""}

## 📝 Special Notes
- ${activityLevel === "High" || activityLevel === "Very High" ? 
   "Your dog's high activity level means they need extra calories - adjust portions if they seem hungry or lose weight" : 
   activityLevel === "Low" ? 
   "Your dog's lower activity level means careful portion control is important to prevent weight gain" : 
   "Monitor weight monthly and adjust portions as needed"}
- ${ageCategory === "puppy" ? "Puppies need frequent small meals - consider splitting the portions into 3-4 feedings per day" : 
   ageCategory === "senior dog" ? "Senior dogs may benefit from softer food or adding warm water to kibble" : 
   "Adult dogs generally do well with twice daily feeding"}
- ${notes ? `Special notes: ${notes}` : "No specific dietary restrictions noted"}`;
  } 
  else if (petTypeLC === "cat") {
    return `# ${petEmoji} Personalized Diet Plan for ${breed} Cat

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Daily Caloric Need:** Approximately ${baseCalories} calories

## 📅 Daily Feeding Schedule

### 🌅 Morning (6:00-7:30 AM)
- First meal: ${Math.round(weightNum * 0.06)} oz of high-quality cat food (${Math.round(baseCalories * 0.3)} calories)
- Mix of wet and dry food for hydration
- Fresh water refill

### 🕛 Midday (11:00 AM-1:00 PM)
- Small portion of wet food: ${Math.round(weightNum * 0.03)} oz (${Math.round(baseCalories * 0.15)} calories)
- Refresh water bowl

### 🌇 Afternoon (3:30-5:00 PM)
- Interactive puzzle feeder with ${Math.round(weightNum * 0.03)} oz of kibble (${Math.round(baseCalories * 0.15)} calories)
- Playtime to stimulate hunting instincts

### 🌙 Evening (7:00-8:00 PM)
- Main meal: ${Math.round(weightNum * 0.08)} oz of premium wet food (${Math.round(baseCalories * 0.4)} calories)
- Add fish oil supplement
- Fresh water refill

## 🥩 Recommended Foods

### Premium Cat Food Options
- Wet food: Royal Canin, Wellness, Hill's Science Diet (${ageCategory}-specific formula)
- Dry food: Purina Pro Plan, Blue Buffalo, Iams

### Nutritional Balance
- High-quality protein sources (chicken, turkey, fish)
- Limited carbohydrate content
- Adequate taurine levels (essential for cats)
- Proper fat content for energy

## 💧 Hydration
- Cats often have low thirst drive - consider pet water fountain
- Place multiple water sources throughout home
- Wet food helps provide additional moisture
- Check water level and freshness twice daily

## 💊 Supplements
- Omega-3 fatty acids for coat health (fish oil: ${Math.round(weightNum * 10)}mg daily)
- ${ageNum > 10 ? "Joint supplements with glucosamine for senior cats" : "Multivitamin formulated specifically for cats"}
- Digestive enzymes and probiotics for sensitive stomachs

## 📝 Special Considerations
- ${breed.toLowerCase().includes("persian") || breed.toLowerCase().includes("himalayan") ? 
   "Flat-faced breeds may need special dishes for easier eating" : 
   breed.toLowerCase().includes("maine") ? 
   "Larger cats need more calories during growth phases but be careful of overfeeding in adulthood" :
   "Monitor weight monthly and adjust portions as needed"}
- ${activityLevel === "Low" ? 
   "Indoor cats with low activity need careful portion control to prevent obesity" : 
   activityLevel === "High" || activityLevel === "Very High" ? 
   "Very active cats may need up to 20% more calories - monitor weight and body condition" :
   "Ensure your cat has plenty of opportunity for exercise through play"}
- ${notes ? `Special notes: ${notes}` : "No specific dietary restrictions noted"}`;
  }
  else {
    return `# ${petEmoji} Personalized Diet Plan for ${breed} ${petTypeLC}

## Pet Profile
- **Species:** ${petTypeLC}
- **Breed:** ${breed}
- **Age:** ${ageNum} years
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## 📅 Daily Care Schedule

### 🌅 Morning (7:00-9:00 AM)
- First feeding with fresh food appropriate for your ${petTypeLC}
- Clean habitat/enclosure
- Fresh water provision

### 🕛 Midday (12:00-2:00 PM)
- Check water levels
- Enrichment activity or supervised time outside enclosure (if applicable)

### 🌇 Afternoon (3:00-5:00 PM)
- Small supplemental feeding if appropriate for species
- Habitat maintenance as needed

### 🌙 Evening (6:00-8:00 PM)
- Main feeding for the day
- Final habitat check
- Social interaction time if appropriate for species

## 🥩 Nutrition Recommendations
- Research specific nutritional needs for your ${petTypeLC} species
- Consult with a veterinarian specialized in exotic or small pets
- Provide a balanced diet appropriate for your pet's specific needs

## 💧 Hydration
- Ensure appropriate water delivery system for your species
- Clean and refill water containers daily
- Monitor hydration through behavior and waste output

## 🏠 Habitat Considerations
- Maintain appropriate temperature and humidity
- Provide adequate space for movement and exercise
- Include appropriate enrichment items

## 📝 Special Notes
- ${petTypeLC}s have unique care requirements that may differ significantly from common pets
- Regular visits to a specialized veterinarian are recommended
- ${notes ? `Special notes: ${notes}` : "Research specific dietary needs for your pet's species"}
- Consult species-specific care guides for detailed information`;
  }
}

function generateTrainingPlan(
  petTypeLC: string,
  breed: string,
  ageNum: number,
  weightNum: number,
  activityLevel: string,
  petEmoji: string,
  activityEmoji: string,
  ageCategory: string,
  notes?: string
): string {
  if (petTypeLC === "dog") {
    // Determine trainability based on breed
    const highlyTrainableBreeds = ["border collie", "poodle", "german shepherd", "labrador", "golden retriever", "doberman"];
    const lowTrainableBreeds = ["afghan hound", "bulldog", "chow chow", "basenji", "beagle", "shiba inu"];
    
    const breedLC = breed.toLowerCase();
    const trainability = highlyTrainableBreeds.some(b => breedLC.includes(b)) ? "high" : 
                        lowTrainableBreeds.some(b => breedLC.includes(b)) ? "requires patience" : "moderate";
    
    return `# ${petEmoji} Personalized Training Plan for ${breed} Dog

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Trainability:** ${trainability.charAt(0).toUpperCase() + trainability.slice(1)}

## 📅 Daily Training Schedule

### 🌅 Morning (6:00-8:00 AM)
- 5-minute reinforcement of basic commands before breakfast
- Short leash walking practice with focus on heel command
- Mental stimulation puzzle during breakfast

### 🕛 Midday (11:30 AM-1:00 PM)
- 10-minute training session focusing on one new skill
- Practice "stay" command with increasing duration
- Brief play session as reward

### 🌇 Afternoon (3:30-5:00 PM)
- 15-minute active training combining previously learned skills
- Socialization practice if appropriate (with people or other dogs)
- Obedience reinforcement during play

### 🌙 Evening (6:30-7:30 PM)
- 5-minute calm behavior training (settle, place command)
- Reinforcement of day's lessons
- Quiet bonding time with gentle praise

## 🎯 Weekly Training Goals

### Week 1: Foundation
- Master sit, stay, come commands
- Begin leash walking without pulling
- Establish name recognition and focus

### Week 2: Building Skills
- Extend stay duration to 30 seconds
- Introduce down command
- Begin off-leash recall in secure area

### Week 3: Advanced Work
- Introduce heel command
- Begin distraction training
- Add hand signals to verbal commands

### Week 4: Refinement
- Combine commands in sequence
- Practice with moderate distractions
- Introduce duration and distance challenges

## 🧠 Breed-Specific Training Tips
${breedLC.includes("retriever") || breedLC.includes("labrador") ? 
"- Highly food and play motivated - use both as rewards\n- Natural retrieving instincts - incorporate fetch into training\n- Eager to please - praise is very effective\n- May be easily distracted by scents - work on focus"
: breedLC.includes("shepherd") ?
"- Highly intelligent - needs mental challenges\n- May be protective - focus on socialization\n- Responds well to consistent routine\n- Excels with clear hierarchy and expectations"
: breedLC.includes("terrier") ?
"- Independent thinkers - keep sessions engaging\n- High prey drive - manage distractions carefully\n- Responds well to positive reinforcement\n- May need extra patience with recall training"
: breedLC.includes("hound") ?
"- Scent-driven - expect distraction by smells\n- Independent nature - be extra consistent\n- Use high-value treats for motivation\n- May need secure area for off-leash work"
: "- Research specific training techniques for your breed\n- Consider consulting with a breed-specific trainer\n- Adapt training to your dog's individual personality\n- Be consistent with commands and expectations"}

## 🏆 Recommended Training Methods
- Positive reinforcement with treats and praise
- Clicker training for precise timing
- Short, frequent sessions (5-15 minutes)
- Consistency in commands and expectations

## 🧰 Training Tools
- High-value treats (small, soft, and fragrant)
- 6-foot leash for basic training
- Long-line (15-30 feet) for distance work
- Treat pouch for easy access
- Clicker (optional)
- Interactive toys for mental stimulation

## 📝 Special Considerations
- ${ageCategory === "puppy" ? 
   "Keep training sessions very short (2-5 minutes) but frequent throughout the day" : 
   ageCategory === "senior dog" ? 
   "Adjust for shorter attention span and potential physical limitations" : 
   "Adult dogs can focus longer but still benefit from varied training"}
- ${activityLevel === "High" || activityLevel === "Very High" ? 
   "Incorporate training into exercise to help manage high energy" : 
   activityLevel === "Low" ? 
   "Keep training physically easy but mentally stimulating" : 
   "Balance mental and physical challenges in training sessions"}
- ${notes ? `Special notes: ${notes}` : "No specific training challenges noted"}`;
  } 
  else if (petTypeLC === "cat") {
    return `# ${petEmoji} Personalized Training Plan for ${breed} Cat

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## 📅 Daily Training Schedule

### 🌅 Morning (7:00-8:00 AM)
- 2-3 minute clicker training before breakfast
- Target training with wand toy
- Food puzzle for breakfast to stimulate problem-solving

### 🕛 Midday (12:00-1:00 PM)
- 2-minute training session with favorite toy as reward
- Practice "come when called" with special treats
- Short play session as reinforcement

### 🌇 Afternoon (4:00-5:00 PM)
- 3-minute training for a new behavior
- Practice previously learned cues
- Interactive toy time as reward

### 🌙 Evening (7:00-8:00 PM)
- Final 1-2 minute training session
- Calm behavior reinforcement
- Treat-dispensing toy for mental stimulation

## 🎯 Weekly Training Goals

### Week 1: Basics
- Introduce clicker or marker word
- Begin target training with finger or target stick
- Start "come when called" to their name

### Week 2: Simple Behaviors
- Sit cue using lure method
- High-five or paw touch
- Encourage use of scratching post

### Week 3: Practical Skills
- Enter carrier on cue
- Allow brief handling of paws
- "Stay" for 5 seconds

### Week 4: Advanced Work
- Introduce harness acceptance if needed
- Begin leash familiarization
- Extend stay duration to 10-15 seconds

## 🧠 Cat Training Tips
- Keep sessions very short (1-3 minutes maximum)
- Train before meals when motivation is highest
- Use tiny, high-value treats (freeze-dried meat works well)
- End on success, however small
- Never force or punish - cats respond poorly to pressure

## 🧰 Training Tools
- Clicker or consistent marker word
- Target stick (or use your finger)
- Variety of tiny, high-value treats
- Interactive toys
- Treat-dispensing puzzles
- Cat wand toys

## 📝 Special Considerations
- ${ageCategory === "kitten" ? 
   "Kittens have very short attention spans - keep sessions under 1 minute" : 
   ageNum > 10 ? 
   "Senior cats may learn more slowly - be extra patient and keep sessions shorter" : 
   "Adult cats can learn new behaviors but need consistent practice"}
- ${breed.toLowerCase().includes("siamese") || breed.toLowerCase().includes("abyssinian") ? 
   "Your breed is typically intelligent and active - can learn more complex behaviors" : 
   breed.toLowerCase().includes("persian") || breed.toLowerCase().includes("himalayan") ? 
   "Your breed may be more laid-back - focus on calm, simple behaviors" : 
   "Each cat has individual preferences - adapt training to what motivates your cat"}
- ${activityLevel === "High" || activityLevel === "Very High" ? 
   "Channel energy with play before training for better focus" : 
   activityLevel === "Low" ? 
   "Keep physical demands minimal but maintain mental stimulation" : 
   "Balance play and training based on daily energy levels"}
- ${notes ? `Special notes: ${notes}` : "No specific training challenges noted"}`;
  }
  else {
    return `# ${petEmoji} Personalized Training Plan for ${breed} ${petTypeLC}

## Pet Profile
- **Species:** ${petTypeLC}
- **Breed:** ${breed}
- **Age:** ${ageNum} years
- **Activity Level:** ${activityLevel} ${activityEmoji}

## Training Approach
For ${petTypeLC}s, conventional training methods may need significant adaptation. This plan focuses on:
- Establishing comfort and trust
- Encouraging natural behaviors
- Managing environment for success
- Species-appropriate interaction

## 📅 Daily Interaction Schedule

### 🌅 Morning (7:00-9:00 AM)
- Calm approach and feeding routine
- Observe behavior for health and comfort
- Brief handling if appropriate for species

### 🕛 Midday (12:00-2:00 PM)
- Environmental enrichment addition
- Positive reinforcement for approach behaviors
- Brief target training if appropriate

### 🌇 Afternoon (4:00-6:00 PM)
- Specialized interaction based on species needs
- Habitat maintenance with positive associations
- Quiet observation time to understand behavior patterns

### 🌙 Evening (7:00-9:00 PM)
- Calm interaction and final feeding
- Minimal handling to reduce stress
- Set up nighttime environment appropriately

## 🧰 Species-Appropriate Tools
- Research species-specific enrichment items
- Appropriate handling equipment if needed
- Safe space for retreat when stressed
- Species-appropriate rewards

## 📝 Special Considerations
- ${petTypeLC}s have unique care requirements that differ from dogs and cats
- Consult with a veterinarian specialized in exotic pets
- Research species-specific behavior and communication
- ${notes ? `Special notes: ${notes}` : "No specific training challenges noted"}
- Focus on positive reinforcement and natural behavior encouragement`;
  }
}

function generateHealthPlan(
  petTypeLC: string,
  breed: string,
  ageNum: number,
  weightNum: number,
  activityLevel: string,
  petEmoji: string,
  activityEmoji: string,
  ageCategory: string,
  notes?: string
): string {
  if (petTypeLC === "dog") {
    // Breed-specific health concerns
    let breedHealthConcerns = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("retriever") || breedLC.includes("labrador")) {
      breedHealthConcerns = "hip/elbow dysplasia, obesity, ear infections";
    } else if (breedLC.includes("bulldog") || breedLC.includes("pug") || breedLC.includes("boxer")) {
      breedHealthConcerns = "breathing issues, overheating, skin fold infections";
    } else if (breedLC.includes("shepherd") || breedLC.includes("doberman")) {
      breedHealthConcerns = "hip/elbow dysplasia, cardiac issues, von Willebrand's disease";
    } else if (breedLC.includes("dachshund") || breedLC.includes("corgi")) {
      breedHealthConcerns = "intervertebral disc disease, obesity, back problems";
    } else if (breedLC.includes("poodle") || breedLC.includes("bichon")) {
      breedHealthConcerns = "dental disease, ear infections, skin allergies";
    }
    
    return `# ${petEmoji} Personalized Healthcare Plan for ${breed} Dog

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Common breed health concerns:** ${breedHealthConcerns || "Research specific concerns for your breed"}

## 📅 Daily Health Routine

### 🌅 Morning (6:00-8:00 AM)
- Quick visual health check during morning bathroom break
- Check water freshness and food intake
- Administer any morning medications with food
- Brief dental check while giving dental treat

### 🕛 Midday (11:30 AM-1:00 PM)
- Brief exercise appropriate for age and health status
- Fresh water check and refill
- Monitor bathroom habits for any changes
- Quick check of eyes, nose, and energy level

### 🌇 Afternoon (4:00-5:00 PM)
- Main exercise session tailored to health needs
- Body check during petting (feel for lumps, sensitive areas)
- Brief grooming session to check skin and coat
- Mental enrichment activity for cognitive health

### 🌙 Evening (6:30-8:00 PM)
- Ear and paw check after final outdoor time
- Dental care (brushing teeth or dental chew)
- Administer any evening medications
- Calm environment for good sleep quality

## 💉 Preventative Care Schedule

### Monthly
- Flea, tick, and heartworm preventatives
- Weight check at home
- Nail trimming as needed
- Full at-home body check

### Quarterly
- Seasonal parasite control adjustment
- Deep coat check for seasonal shedding issues
- Dental health assessment
- ${ageNum > 7 ? "Senior wellness blood work (recommended)" : ""}

### Annually
- Complete veterinary wellness exam
- Vaccinations as recommended by veterinarian
- Dental cleaning assessment
- Heartworm and parasite testing

## 🔍 Health Monitoring

### Watch For
- Changes in appetite, thirst, or bathroom habits
- Difficulty rising or reluctance to exercise
- Coughing, sneezing, or labored breathing
- Skin issues, lumps, or coat changes
- Behavioral changes that might indicate pain or discomfort

### Breed-Specific Monitoring
${breedHealthConcerns ? 
`- Regular checks for signs of ${breedHealthConcerns}
- Discuss breed-specific preventative care with your veterinarian
- Consider genetic testing for common breed disorders` : 
"- Research and monitor for common health issues in your breed"}

## 📝 Special Health Considerations
- ${ageCategory === "puppy" ? 
   "Puppies need frequent veterinary visits for initial vaccines and development checks" : 
   ageCategory === "senior dog" ? 
   "Senior dogs benefit from twice-yearly veterinary checkups and bloodwork" : 
   "Adult dogs should have annual wellness exams"}
- ${activityLevel === "High" || activityLevel === "Very High" ? 
   "Active dogs need careful monitoring for joint health and injuries" : 
   activityLevel === "Low" ? 
   "Low-activity dogs need careful weight management and gentle exercise" : 
   "Maintain moderate, regular exercise appropriate for age and breed"}
- ${weightNum > (petTypeLC === "dog" ? 50 : 15) ? 
   "Larger dogs often face joint issues - support with appropriate supplements" : 
   "Smaller dogs often face dental issues - prioritize dental care"}
- ${notes ? `Special health notes: ${notes}` : "No specific health concerns noted"}`;
  } 
  else if (petTypeLC === "cat") {
    // Cat breed health concerns
    let breedHealthConcerns = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("persian") || breedLC.includes("himalayan")) {
      breedHealthConcerns = "breathing issues, eye discharge, dental disease, polycystic kidney disease";
    } else if (breedLC.includes("maine") || breedLC.includes("ragdoll")) {
      breedHealthConcerns = "hypertrophic cardiomyopathy, joint issues due to size";
    } else if (breedLC.includes("siamese") || breedLC.includes("oriental")) {
      breedHealthConcerns = "dental disease, respiratory issues, amyloidosis";
    } else if (breedLC.includes("sphynx")) {
      breedHealthConcerns = "skin issues, hypertrophic cardiomyopathy, dental disease";
    }
    
    return `# ${petEmoji} Personalized Healthcare Plan for ${breed} Cat

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Common breed health concerns:** ${breedHealthConcerns || "Research specific concerns for your breed"}

## 📅 Daily Health Routine

### 🌅 Morning (7:00-8:30 AM)
- Observe eating, drinking, and litter box use
- Check eyes for clarity and absence of discharge
- Administer any morning medications (hide in treat or food)
- Brief play session to assess mobility and energy

### 🕛 Midday (12:00-2:00 PM)
- Fresh water check and refill
- Brief interaction to gauge energy and behavior
- Litter box cleaning and monitoring
- Provide clean resting areas

### 🌇 Afternoon (3:30-5:30 PM)
- Interactive play for exercise and weight management
- Brief grooming session to check skin and coat
- Mental enrichment with puzzle feeder or new toy
- Quick check of ears, eyes, nose for any issues

### 🌙 Evening (7:00-9:00 PM)
- Final meal and medication administration if needed
- Gentle body check during petting time
- Dental care with appropriate treats or brushing
- Create calm environment for quality sleep time

## 💉 Preventative Care Schedule

### Monthly
- Flea preventative application
- Weight check at home
- Nail trimming as needed
- Thorough grooming session

### Quarterly
- Complete at-home health scan
- Dental health assessment
- Parasite prevention review
- ${ageNum > 10 ? "Check for signs of arthritis or mobility changes" : ""}

### Annually
- Complete veterinary wellness exam
- Vaccinations as recommended
- Blood work and urinalysis
- Dental health professional assessment

## 🔍 Health Monitoring

### Watch For
- Changes in litter box habits or appearance of waste
- Increased thirst or changes in appetite
- Hiding behavior or personality changes
- Grooming changes (either excessive or neglected)
- Vomiting, especially if frequent

### Breed-Specific Monitoring
${breedHealthConcerns ? 
`- Regular checks for signs of ${breedHealthConcerns}
- Discuss breed-specific preventative care with your veterinarian
- Consider genetic testing for common breed disorders` : 
"- Research and monitor for common health issues in your breed"}

## 📝 Special Health Considerations
- ${ageCategory === "kitten" ? 
   "Kittens need frequent veterinary visits for vaccines and deworming" : 
   ageNum > 10 ? 
   "Senior cats benefit from twice-yearly checkups and bloodwork" : 
   "Adult cats should have annual wellness exams"}
- ${activityLevel === "Low" ? 
   "Indoor-only cats need environmental enrichment and weight management" : 
   activityLevel === "High" || activityLevel === "Very High" ? 
   "Very active cats need safe outlets for energy and closer monitoring for injuries" : 
   "Provide regular play and exercise opportunities"}
- ${breedLC.includes("flat") || breedLC.includes("persian") || breedLC.includes("exotic") ? 
   "Brachycephalic (flat-faced) cats need special attention to breathing and eye health" : 
   breedLC.includes("hairless") || breedLC.includes("sphynx") ? 
   "Hairless breeds need skin care and temperature management" : 
   "Regular grooming helps monitor skin health and reduce hairballs"}
- ${notes ? `Special health notes: ${notes}` : "No specific health concerns noted"}`;
  }
  else {
    return `# ${petEmoji} Personalized Healthcare Plan for ${breed} ${petTypeLC}

## Pet Profile
- **Species:** ${petTypeLC}
- **Breed:** ${breed}
- **Age:** ${ageNum} years
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## 📅 Daily Health Routine

### 🌅 Morning (7:00-9:00 AM)
- Observe eating and drinking behavior
- Check habitat conditions (temperature, humidity)
- Visual health assessment
- Administer any medications if needed

### 🕛 Midday (12:00-2:00 PM)
- Fresh water check and refill
- Quick habitat cleaning as needed
- Brief observation period to check activity levels
- Environmental enrichment addition

### 🌇 Afternoon (3:00-5:00 PM)
- Main habitat cleaning if needed
- Food and supplement provision
- Check for normal waste elimination
- Brief handling if appropriate for species

### 🌙 Evening (7:00-9:00 PM)
- Final visual health check
- Adjust habitat for nighttime conditions
- Provide fresh water
- Ensure security and comfort of enclosure

## 💉 Preventative Care Schedule

### Weekly
- Thorough habitat cleaning
- Weight monitoring if possible
- Complete visual health assessment
- Check for any abnormal signs or behaviors

### Monthly
- Deep habitat cleaning
- Equipment maintenance check
- Assessment of growth/development
- Adjust diet and care as needed for life stage

### Annually
- Exotic veterinarian checkup
- Species-appropriate testing
- Habitat upgrade assessment
- Review of dietary needs

## 🔍 Health Monitoring

### Watch For
- Changes in eating or drinking
- Abnormal waste (consistency, frequency)
- Unusual behavior or lethargy
- Respiratory changes
- Skin/scale/feather condition changes

## 📝 Special Health Considerations
- ${petTypeLC}s require specialized veterinary care from an exotic animal specialist
- Research species-specific health needs thoroughly
- Maintain optimal habitat conditions to prevent stress and illness
- ${notes ? `Special health notes: ${notes}` : "No specific health concerns noted"}
- Many health issues relate to improper habitat or diet - prevention is critical`;
  }
}

function generateActivitiesPlan(
  petTypeLC: string,
  breed: string,
  ageNum: number,
  weightNum: number,
  activityLevel: string,
  petEmoji: string,
  activityEmoji: string,
  ageCategory: string,
  notes?: string
): string {
  if (petTypeLC === "dog") {
    // Determine energy needs based on breed
    const highEnergyBreeds = ["border collie", "australian shepherd", "husky", "vizsla", "jack russell", "dalmatian"];
    const lowEnergyBreeds = ["bulldog", "basset hound", "great dane", "mastiff", "shih tzu", "pug"];
    
    const breedLC = breed.toLowerCase();
    const energyNeeds = highEnergyBreeds.some(b => breedLC.includes(b)) ? "high" : 
                      lowEnergyBreeds.some(b => breedLC.includes(b)) ? "low" : "moderate";
    
    // Adjust activity minutes based on energy level and age
    const baseMinutes = energyNeeds === "high" ? 60 : energyNeeds === "low" ? 30 : 45;
    const ageAdjuster = ageNum < 2 ? 0.8 : ageNum > 8 ? 0.6 : 1;
    const activityAdjuster = activityLevel === "High" || activityLevel === "Very High" ? 1.2 : 
                            activityLevel === "Low" ? 0.8 : 1;
    
    const dailyMinutes = Math.round(baseMinutes * ageAdjuster * activityAdjuster);
    
    return `# ${petEmoji} Personalized Activity Plan for ${breed} Dog

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Energy needs:** ${energyNeeds.charAt(0).toUpperCase() + energyNeeds.slice(1)}
- **Recommended daily activity:** ${dailyMinutes} minutes

## 📅 Daily Activity Schedule

### 🌅 Morning (6:00-8:00 AM)
- ${Math.round(dailyMinutes * 0.4)} minute brisk walk or light jog
- 5 minutes of stretching and warm-up play
- Brief training session incorporated into exercise
- Sniff breaks for mental stimulation

### 🕛 Midday (11:30 AM-1:00 PM)
- 10-minute potty break with short play session
- Mental stimulation puzzle or Kong toy
- Brief training reinforcement or tricks practice
- Quiet time for rest and digestion

### 🌇 Afternoon (3:30-5:30 PM)
- ${Math.round(dailyMinutes * 0.5)} minute main exercise session:
  ${energyNeeds === "high" ? 
    "• Fetch, frisbee, or agility practice\n  • Jogging or hiking on varied terrain\n  • Swimming if available" : 
    energyNeeds === "low" ? 
    "• Gentle walking with plenty of sniff breaks\n  • Easy play session with favorite toys\n  • Short socialization time if desired" : 
    "• Moderate walking with play breaks\n  • Interactive games like tug or fetch\n  • Training games for mental stimulation"}
- Cooling down period with gentle walking
- Water break and rest time

### 🌙 Evening (7:00-8:30 PM)
- Short, 10-minute potty walk
- Calm indoor play or training games
- Gentle massage and bonding time
- Relaxation cues to wind down for the night

## 🏆 Weekly Activity Variety

### Physical Exercise
- Leashed walks in different environments
- ${energyNeeds === "high" ? "Off-leash play in secure areas" : "Gentle play sessions"}
- ${weightNum > 50 ? "Swimming (gentle on joints)" : "Agility exercises appropriate for size"}
- ${ageNum < 2 ? "Short bursts of play with plenty of rest breaks" : ageNum > 8 ? "Gentle walking on soft surfaces" : "Age-appropriate physical challenges"}

### Mental Stimulation
- Puzzle toys and treat-dispensing games
- Training sessions for new skills
- Scent games and nose work activities
- New walking routes for novel experiences

### Social Activities
- ${activityLevel === "High" || activityLevel === "Very High" ? 
    "Supervised dog park visits (if well-socialized)" : 
    "Calm meet-ups with known dog friends"}
- Pet-friendly outings in new environments
- Controlled greetings with new people
- ${ageCategory === "puppy" ? "Puppy socialization classes" : ""}

## 🧠 Breed-Specific Activities
${breedLC.includes("retriever") || breedLC.includes("labrador") ? 
"- Retrieving games and water activities\n- Scent-based challenges\n- Agility exercises\n- Social activities with people and dogs" 
: breedLC.includes("herding") || breedLC.includes("collie") || breedLC.includes("shepherd") ?
"- Herding ball toys\n- Advanced obedience training\n- Agility or flyball sports\n- Mental challenges that simulate work"
: breedLC.includes("terrier") ?
"- Digging pit or sandbox play\n- Tug games with clear rules\n- Earth dog activities or simulations\n- Chasing games with appropriate toys"
: breedLC.includes("hound") ?
"- Scent trails and nose work\n- Long exploratory walks\n- Sound-based recall games\n- Tracking activities"
: "- Research activities that match your dog's breed history\n- Consider what tasks your breed was originally developed for\n- Adapt historical work into play activities\n- Consult breed-specific resources for ideas"}

## 📝 Special Considerations
- ${ageCategory === "puppy" ? 
   "Puppies need multiple short activity sessions with plenty of rest; avoid high-impact exercise" : 
   ageCategory === "senior dog" ? 
   "Senior dogs benefit from consistent, gentle exercise; monitor for signs of pain or fatigue" : 
   "Adult dogs need balanced physical and mental exercise tailored to their health status"}
- ${weightNum > 50 ? 
   "Larger dogs should avoid jumping from heights and exercise on softer surfaces when possible" : 
   "Smaller dogs often need less duration but similar frequency of exercise"}
- ${activityLevel === "Low" ? 
   "Start with very short sessions and gradually increase duration as fitness improves" : 
   activityLevel === "High" || activityLevel === "Very High" ? 
   "Ensure adequate physical and mental exercise to prevent boredom behaviors" : 
   "Balance activity with appropriate rest periods"}
- ${notes ? `Special activity notes: ${notes}` : "No specific activity restrictions noted"}`;
  } 
  else if (petTypeLC === "cat") {
    // Activity recommendations based on breed tendencies
    let breedActivityTips = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("bengal") || breedLC.includes("abyssinian") || breedLC.includes("siamese")) {
      breedActivityTips = "Your breed is typically very active and intelligent - provide plenty of climbing, interactive play, and puzzle feeders";
    } else if (breedLC.includes("persian") || breedLC.includes("ragdoll") || breedLC.includes("himalayan")) {
      breedActivityTips = "Your breed typically has a more laid-back nature - focus on gentle play sessions and comfortable resting spots";
    } else if (breedLC.includes("maine") || breedLC.includes("norwegian")) {
      breedActivityTips = "Your breed is typically playful despite their large size - provide sturdy climbing trees and larger toys";
    }
    
    return `# ${petEmoji} Personalized Activity Plan for ${breed} Cat

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Recommended play sessions:** ${activityLevel === "Low" ? "3-4" : activityLevel === "High" || activityLevel === "Very High" ? "6-8" : "4-5"} short sessions daily

## 📅 Daily Activity Schedule

### 🌅 Morning (6:00-8:00 AM)
- 5-minute interactive wand toy play
- Puzzle feeder for breakfast for mental stimulation
- Window perch time to watch morning activity outside
- Rotate toys to maintain interest

### 🕛 Midday (11:00 AM-1:00 PM)
- 3-5 minute play session with catnip toy
- Hide treats around the home for hunting stimulation
- Provide fresh cardboard scratcher or scratching post
- Quiet observation time

### 🌇 Afternoon (3:00-5:00 PM)
- 5-10 minute main play session with variety of toys
- Climbing activity on cat tree or shelves
- Rotate in a new toy or rearrange play area
- Social interaction time with gentle petting

### 🌙 Evening (7:00-9:00 PM)
- 5-10 minute play to expend evening energy
- Puzzle toy with treats before dinner
- Gentle brushing session for bonding
- Set up overnight enrichment (window access, quiet toys)

## 🏆 Weekly Activity Variety

### Physical Play
- Wand toys mimicking prey movement
- Ping pong balls or crinkle balls for batting
- Laser pointer play (always end with catchable toy)
- ${activityLevel === "High" || activityLevel === "Very High" ? "Cat wheel if appropriate and available" : "Gentle chase games"}

### Mental Stimulation
- Puzzle feeders of increasing difficulty
- Treat-hiding games throughout the home
- New cardboard boxes or paper bags to explore
- Rotating toy collection to maintain novelty

### Environmental Enrichment
- Vertical space with cat trees, shelves, or perches
- Window perches with bird feeders outside
- Safe outdoor experience (catio, harness, or enclosed stroller)
- Different textures and surfaces for exploration

### Social Activities
- Gentle interactive play with humans
- ${ageNum < 2 && activityLevel !== "Low" ? "Consider compatible feline playmate if single cat" : ""}
- Brief, positive experiences with visitors
- Clicker training for mental stimulation

## 🧠 Breed-Specific Activities
${breedActivityTips || "- Research activities that appeal to your specific breed\n- Observe your cat's preferences and build on those\n- Provide variety in play and enrichment\n- Respect your cat's individual personality"}

## 📝 Special Considerations
- ${ageCategory === "kitten" ? 
   "Kittens have bursts of high energy followed by deep sleep - accommodate this natural pattern" : 
   ageNum > 10 ? 
   "Senior cats benefit from gentle play and comfortable resting spots at different heights" : 
   "Adult cats need regular play to maintain healthy weight and mental wellbeing"}
- ${activityLevel === "Low" ? 
   "Encourage gentle activity with enticing toys and positive reinforcement" : 
   activityLevel === "High" || activityLevel === "Very High" ? 
   "Ensure adequate play to prevent destructive behaviors from boredom" : 
   "Balance play with appropriate rest periods"}
- ${weightNum > 15 ? 
   "Monitor for joint issues - provide ramps to favorite perches and gentle play" : 
   "Ensure play areas have secure footing to prevent injury during active play"}
- ${notes ? `Special activity notes: ${notes}` : "No specific activity restrictions noted"}`;
  }
  else {
    return `# ${petEmoji} Personalized Activity Plan for ${breed} ${petTypeLC}

## Pet Profile
- **Species:** ${petTypeLC}
- **Breed:** ${breed}
- **Age:** ${ageNum} years
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## Important Note
This is a generalized activity plan. ${petTypeLC}s have highly specialized activity needs that vary significantly by species. Consult with a veterinarian who specializes in exotic pets for species-appropriate recommendations.

## 📅 Daily Activity Schedule

### 🌅 Morning (7:00-9:00 AM)
- Observe natural activity patterns
- Provide fresh enrichment appropriate to species
- Maintain appropriate lighting cycle
- First feeding with foraging opportunity if appropriate

### 🕛 Midday (11:00 AM-1:00 PM)
- Brief interaction if species-appropriate
- Refresh habitat enrichment
- Observe behavior for health assessment
- Provide varied terrain or substrate if appropriate

### 🌇 Afternoon (3:00-5:00 PM)
- Main activity period - provide appropriate enrichment
- Species-appropriate exercise opportunity
- Novel stimuli introduction (sights, sounds, smells)
- Second feeding with different presentation method

### 🌙 Evening (7:00-9:00 PM)
- Begin transition to night cycle if appropriate
- Calm, appropriate enrichment for nighttime
- Final habitat check for safety and comfort
- Social species may need evening interaction

## 🏆 Environmental Enrichment

### Habitat Design
- Multiple hiding and resting areas
- Varied terrain appropriate for natural behaviors
- Climbing, burrowing, or swimming areas as needed
- Temperature gradient if appropriate for species

### Sensory Stimulation
- Visual barriers and viewing opportunities
- Species-appropriate sounds or quiet
- Natural substrate that encourages foraging
- Safe plants or natural materials when possible

### Novel Experiences
- Rotate enrichment items weekly
- Change habitat arrangement periodically
- Introduce new safe objects for exploration
- Vary feeding methods and locations

## 📝 Special Considerations
- Research species-specific activity needs thoroughly
- Many exotic pets do not benefit from handling - respect natural behaviors
- Activity needs vary dramatically by species and individual
- Inappropriate enrichment can cause stress rather than benefit
- ${notes ? `Special notes: ${notes}` : "Consult exotic pet specialists for specific activity recommendations"}`;
  }
}

function generateGroomingPlan(
  petTypeLC: string,
  breed: string,
  ageNum: number,
  weightNum: number,
  activityLevel: string,
  petEmoji: string,
  activityEmoji: string,
  ageCategory: string,
  notes?: string
): string {
  if (petTypeLC === "dog") {
    // Determine coat type based on breed
    let coatType = "";
    let groomingFrequency = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("poodle") || breedLC.includes("bichon") || breedLC.includes("doodle")) {
      coatType = "Curly, non-shedding";
      groomingFrequency = "Every 4-6 weeks professional, daily home brushing";
    } else if (breedLC.includes("retriever") || breedLC.includes("shepherd") || breedLC.includes("husky")) {
      coatType = "Double-coat, heavy shedding";
      groomingFrequency = "Weekly thorough brushing, daily during shedding seasons";
    } else if (breedLC.includes("terrier") && !breedLC.includes("yorkshire")) {
      coatType = "Wiry, low shedding";
      groomingFrequency = "Hand-stripping or clipping every 6-8 weeks, weekly brushing";
    } else if (breedLC.includes("yorkshire") || breedLC.includes("maltese") || breedLC.includes("shih tzu")) {
      coatType = "Long, silky, continuous growth";
      groomingFrequency = "Every 4-6 weeks professional, daily brushing";
    } else if (breedLC.includes("bulldog") || breedLC.includes("beagle") || breedLC.includes("boxer")) {
      coatType = "Short, smooth";
      groomingFrequency = "Weekly brushing, bath as needed every 4-6 weeks";
    } else {
      coatType = "Standard";
      groomingFrequency = "Brushing 2-3 times weekly, bath every 4-8 weeks";
    }
    
    return `# ${petEmoji} Personalized Grooming Plan for ${breed} Dog

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Coat Type:** ${coatType}
- **Professional Grooming Needs:** ${groomingFrequency}

## 📅 Daily Grooming Schedule

### 🌅 Morning (6:00-8:00 AM)
- Quick check of eyes for discharge - gently wipe if needed
- Brief tooth brushing or dental treat
- Check paws for debris after morning walk
- Wipe facial folds if applicable to breed

### 🕛 Midday (12:00-2:00 PM)
- Quick brush with appropriate tool if high-shedding breed
- Check and clean ears if needed
- Fresh water in clean bowl
- Monitor for any skin irritation during petting

### 🌇 Afternoon (4:00-6:00 PM)
- Main brushing session (5-15 minutes depending on coat type)
  ${coatType.includes("Curly") ? 
    "• Use slicker brush followed by metal comb\n  • Check for matting behind ears and in armpits\n  • Detangle any small knots before they worsen" : 
    coatType.includes("Double") ? 
    "• Undercoat rake to remove loose hair\n  • Slicker brush to smooth topcoat\n  • Extra attention during seasonal shedding" :
    coatType.includes("Wiry") ? 
    "• Use slicker brush against and with hair growth\n  • Comb through beard and leg furnishings\n  • Check for skin issues under dense coat" :
    coatType.includes("Long") ? 
    "• Section brushing with pin brush or slicker\n  • Detangling spray for silky coats\n  • Special attention to ear fringe and chest" :
    coatType.includes("Short") ? 
    "• Rubber curry brush or grooming mitt\n  • Wipe down with microfiber cloth\n  • Check skin folds if applicable" :
    "• Use appropriate brush for your dog's coat type\n  • Brush in direction of hair growth\n  • Check for any skin issues"}
- Nail check - trim if clicking on floor
- Clean tear stains if applicable

### 🌙 Evening (7:00-9:00 PM)
- Brief tooth brushing or dental care
- Paw pad check and moisturize if needed
- Quick ear check and cleaning if needed
- Gentle massage while checking for any lumps or irritations

## 🛁 Weekly Grooming Tasks

### Bathing
- ${coatType.includes("Curly") || coatType.includes("Long") ? "Every 2-3 weeks" : coatType.includes("Double") ? "Every 4-6 weeks unless dirty" : "Every 3-4 weeks or as needed"}
- Use breed-appropriate dog shampoo
- Thoroughly rinse all product out
- Complete drying to prevent skin issues
- Eye and ear protection during bath

### Deep Coat Care
- Full-body thorough brushing session
- Check between paw pads and trim hair if needed
- Sanitary trim if needed for cleanliness
- ${coatType.includes("Long") || coatType.includes("Curly") ? "Check for mats in problem areas" : ""}

### Nail and Paw Care
- Trim nails using appropriate tool
- File rough edges after clipping
- Check between paw pads for debris/irritation
- Trim excessive hair between pads if needed

### Ear Care
- Clean with appropriate dog ear cleaner
- Check for redness, odor, or discharge
- ${breedLC.includes("spaniel") || breedLC.includes("retriever") || breedLC.includes("poodle") ? "Extra attention due to ear anatomy" : ""}

## 🧰 Recommended Grooming Tools
${coatType.includes("Curly") ? 
"- Slicker brush\n- Metal greyhound comb\n- Detangling spray\n- Professional-quality clippers\n- Blunt-tip scissors for face"
: coatType.includes("Double") ? 
"- Undercoat rake or de-shedding tool\n- Slicker brush\n- Pin brush\n- High-velocity dryer (optional)\n- Shedding blade"
: coatType.includes("Wiry") ? 
"- Slicker brush\n- Stripping knife (if hand-stripping)\n- Metal comb\n- Thinning shears\n- Terrier pad for face"
: coatType.includes("Long") ? 
"- Pin brush\n- Slicker brush\n- Metal comb\n- Detangling spray\n- Blunt-tip scissors for trimming"
: coatType.includes("Short") ? 
"- Rubber curry brush\n- Grooming mitt\n- Soft bristle brush\n- Microfiber cloth\n- Shedding blade (optional)"
: "- All-purpose dog brush\n- Nail clippers\n- Dog-specific toothbrush and toothpaste\n- Dog-specific shampoo\n- Ear cleaning solution"}

## 📝 Special Considerations
- ${ageCategory === "puppy" ? 
   "Start grooming sessions very short and positive to build lifelong acceptance" : 
   ageCategory === "senior dog" ? 
   "Senior dogs may need more frequent, gentler sessions and help with self-grooming" : 
   "Maintain regular grooming to prevent issues and monitor health"}
- ${breedLC.includes("bulldog") || breedLC.includes("pug") || breedLC.includes("shar pei") ? 
   "Clean facial folds regularly to prevent infection" : 
   breedLC.includes("retriever") || breedLC.includes("newfoundland") || breedLC.includes("spaniel") ? 
   "Check ears frequently as breed is prone to ear infections" : 
   "Pay attention to areas your dog cannot reach easily"}
- ${activityLevel === "High" || activityLevel === "Very High" ? 
   "Active dogs need more frequent paw checks and may require more bathing" : 
   "Regular grooming helps distribute natural oils and remove loose hair"}
- ${notes ? `Special grooming notes: ${notes}` : "No specific grooming challenges noted"}`;
  } 
  else if (petTypeLC === "cat") {
    // Determine coat type based on breed
    let coatType = "";
    let groomingFrequency = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("persian") || breedLC.includes("himalayan")) {
      coatType = "Long, dense, prone to matting";
      groomingFrequency = "Daily brushing, professional grooming every 4-6 weeks";
    } else if (breedLC.includes("maine") || breedLC.includes("norwegian") || breedLC.includes("ragdoll")) {
      coatType = "Semi-long, thick, water-resistant";
      groomingFrequency = "2-3 times weekly brushing, occasional professional help";
    } else if (breedLC.includes("siamese") || breedLC.includes("bengal") || breedLC.includes("abyssinian")) {
      coatType = "Short, fine, close-lying";
      groomingFrequency = "Weekly brushing, rarely needs professional help";
    } else if (breedLC.includes("rex") || breedLC.includes("devon") || breedLC.includes("cornish")) {
      coatType = "Curly or wavy, delicate";
      groomingFrequency = "Gentle weekly wiping, minimal brushing";
    } else if (breedLC.includes("sphynx")) {
      coatType = "Minimal to no coat, oily skin";
      groomingFrequency = "Weekly bathing, daily skin wiping";
    } else {
      coatType = "Standard domestic short/medium";
      groomingFrequency = "Weekly brushing, occasional bath if needed";
    }
    
    return `# ${petEmoji} Personalized Grooming Plan for ${breed} Cat

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Coat Type:** ${coatType}
- **Grooming Needs:** ${groomingFrequency}

## 📅 Daily Grooming Schedule

### 🌅 Morning (7:00-9:00 AM)
- Quick check of eyes for discharge - wipe if needed
- Brief brushing session if tolerated (1-2 minutes)
- Check ears for cleanliness
- Fresh water in clean bowl

### 🕛 Midday (12:00-2:00 PM)
- Gentle petting with grooming glove if accepted
- Monitor for any fur clumps or mats
- Check paws for debris or litter
- Observe grooming behavior

### 🌇 Afternoon (4:00-6:00 PM)
- Main grooming session (3-10 minutes depending on coat type)
  ${coatType.includes("Long") ? 
    "• Metal comb to detect tangles\n  • Slicker brush to remove loose hair\n  • Special attention to armpits, belly, and ruff" : 
    coatType.includes("Semi-long") ? 
    "• Wide-tooth comb for initial pass\n  • Slicker brush for undercoat\n  • Extra attention during seasonal shedding" :
    coatType.includes("Short") ? 
    "• Soft rubber brush or grooming mitt\n  • Gentle but thorough strokes\n  • Finish with soft cloth to collect loose hair" :
    coatType.includes("Curly") ? 
    "• Very gentle wiping with microfiber cloth\n  • Minimal brushing to protect delicate coat\n  • Check for skin issues under curls" :
    coatType.includes("Minimal") ? 
    "• Wipe body with special pet wipes\n  • Check skin folds for buildup\n  • Apply pet-safe moisturizer if needed" :
    "• Use brush appropriate for your cat's coat type\n  • Brush in direction of hair growth\n  • Keep sessions positive and brief"}
- Nail check - trim if needed (one or two at a time)
- Clean corner of eyes if needed

### 🌙 Evening (7:00-9:00 PM)
- Brief tooth brushing or dental treat if accepted
- Quick ear check
- Gentle bonding brush with very soft brush
- Check for any skin irritations

## 🛁 Weekly Grooming Tasks

### Bathing (if tolerated and needed)
- ${coatType.includes("Minimal") ? "Weekly with specialized shampoo" : "Only when necessary, 3-4 times yearly at most"}
- Use cat-specific shampoo only
- Ensure room is warm and draft-free
- Quick, efficient process to minimize stress
- Thorough but gentle drying

### Deep Coat Care
- More thorough brushing session on weekend
- Check hard-to-reach areas thoroughly
- ${coatType.includes("Long") || coatType.includes("Semi-long") ? 
   "Check for and address any small mats before they grow" : 
   "Focus on areas where hairballs may develop"}
- Petroleum jelly or hairball remedy if needed

### Nail and Paw Care
- Check and trim nail tips as needed
- Inspect paw pads for irritation
- Clean between toes if needed
- Monitor claw health and shape

### Ear Care
- Check for cleanliness and odor
- Gently clean with cat-specific ear cleaner if needed
- Watch for head shaking or ear scratching

## 🧰 Recommended Grooming Tools
${coatType.includes("Long") ? 
"- Metal greyhound comb with wide and narrow teeth\n- Slicker brush\n- Dematting tool (for emergencies only)\n- Blunt-tip scissors for sanitary areas\n- Cat-specific detangling spray"
: coatType.includes("Semi-long") ? 
"- Wide-tooth metal comb\n- Slicker brush\n- Soft bristle brush\n- Grooming glove\n- Flea comb for face"
: coatType.includes("Short") ? 
"- Rubber grooming mitt\n- Soft bristle brush\n- Zoom groom type rubber brush\n- Microfiber cloth\n- Flea comb for face"
: coatType.includes("Curly") ? 
"- Microfiber cloths\n- Very soft baby brush\n- Specialized cat wipes\n- Flea comb for face only\n- Soft grooming glove"
: coatType.includes("Minimal") ? 
"- Specialized pet wipes\n- Soft washcloth\n- Pet-safe moisturizer\n- Warm water for bathing\n- Cat-specific shampoo"
: "- Flea comb\n- Soft bristle brush\n- Nail clippers designed for cats\n- Cat-specific toothbrush and toothpaste\n- Grooming wipes for spot cleaning"}

## 📝 Special Considerations
- ${ageCategory === "kitten" ? 
   "Start with very brief, positive grooming experiences to build acceptance" : 
   ageNum > 10 ? 
   "Senior cats may need help with grooming as flexibility decreases with age" : 
   "Respect your cat's tolerance limits and gradually build duration"}
- ${coatType.includes("Long") ? 
   "Long-haired cats need consistent grooming to prevent painful mats" : 
   coatType.includes("Minimal") ? 
   "Hairless cats need regular skin care to manage natural oils" : 
   "Regular grooming helps reduce hairballs and shedding"}
- ${breedLC.includes("persian") || breedLC.includes("exotic") ? 
   "Facial folds need daily cleaning to prevent tear staining and infection" : 
   "Focus grooming on areas your cat has difficulty reaching"}
- ${notes ? `Special grooming notes: ${notes}` : "No specific grooming challenges noted"}`;
  }
  else {
    return `# ${petEmoji} Personalized Grooming Plan for ${breed} ${petTypeLC}

## Pet Profile
- **Species:** ${petTypeLC}
- **Breed:** ${breed}
- **Age:** ${ageNum} years
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## Important Note
This is a generalized grooming plan. ${petTypeLC}s have highly specialized grooming needs that vary significantly by species. Consult with a veterinarian who specializes in exotic pets for species-appropriate recommendations.

## 📅 Basic Grooming Schedule

### 🌅 Morning Habitat Check
- Ensure appropriate humidity and temperature
- Remove waste and soiled bedding
- Check water and food dishes for cleanliness
- Observe for any unusual shedding or skin issues

### 🌇 Weekly Habitat Maintenance
- Deep clean of appropriate habitat areas
- Check for any parasites or issues
- Refresh substrate as needed for species
- Clean and disinfect items in habitat

### 🌙 Monthly Health Scan
- Weight check if possible
- Examine skin, scales, feathers, or fur condition
- Check beak, nails, or claws as appropriate
- Monitor for normal shedding patterns

## 🧰 Species Considerations

### Handling for Grooming
- Research proper handling techniques for your specific species
- Many exotic pets should not be bathed or handled frequently
- Consider professional help for initial grooming guidance
- Never force grooming on a stressed animal

### Environmental Support
- Provide appropriate humidity for skin/scale/feather health
- Offer species-appropriate bathing options (dust baths, water features)
- Natural wearing surfaces for beak/nail/claw maintenance
- Appropriate substrate for natural cleaning behaviors

### When to Seek Help
- Any unusual skin conditions or excessive shedding
- Signs of parasites or irritation
- Overgrown nails, beak, or scales
- Changes in normal self-grooming behavior

## 📝 Special Considerations
- Many exotic pets handle their own grooming needs if provided with proper habitat
- Research specific grooming requirements for your particular species
- Improper grooming can cause serious stress or injury
- ${notes ? `Special grooming notes: ${notes}` : "Consult exotic pet specialists for specific grooming recommendations"}`;
  }
}

function generateSocializationPlan(
  petTypeLC: string,
  breed: string,
  ageNum: number,
  weightNum: number,
  activityLevel: string,
  petEmoji: string,
  activityEmoji: string,
  ageCategory: string,
  notes?: string
): string {
  if (petTypeLC === "dog") {
    // Socialization needs based on breed characteristics
    let socialCharacteristics = "";
    let socialChallenges = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("retriever") || breedLC.includes("labrador") || breedLC.includes("spaniel")) {
      socialCharacteristics = "Typically friendly and social with people and dogs";
      socialChallenges = "May be overly excited in greetings, jumping behavior";
    } else if (breedLC.includes("shepherd") || breedLC.includes("doberman") || breedLC.includes("rottweiler")) {
      socialCharacteristics = "Often reserved with strangers, loyal to family";
      socialChallenges = "May be protective or cautious with new people/animals";
    } else if (breedLC.includes("terrier")) {
      socialCharacteristics = "Often independent and feisty";
      socialChallenges = "May have high prey drive or reactivity to other animals";
    } else if (breedLC.includes("hound")) {
      socialCharacteristics = "Generally good with other dogs, may be distracted by scents";
      socialChallenges = "May be independent and less focused on human interaction";
    } else if (breedLC.includes("toy") || breedLC.includes("small") || weightNum < 20) {
      socialCharacteristics = "May be reserved with strangers, bonded closely with family";
      socialChallenges = "May be fearful of larger dogs or overwhelming situations";
    } else {
      socialCharacteristics = "Individual personality varies by dog";
      socialChallenges = "Observe your dog's specific social preferences";
    }
    
    return `# ${petEmoji} Personalized Socialization Plan for ${breed} Dog

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Breed social traits:** ${socialCharacteristics}
- **Potential challenges:** ${socialChallenges}

## 📅 Daily Socialization Schedule

### 🌅 Morning (6:00-8:00 AM)
- Calm greeting routine with household members
- Brief neighborhood walk with casual passing greetings
- Practice focus exercises with mild distractions
- Reward calm behavior around morning activities

### 🕛 Midday (12:00-2:00 PM)
- 10-minute interaction with familiar people/pets
- Practice polite greetings if visitors arrive
- Exposure to everyday household sounds and activities
- Reward relaxed behavior in different areas of home

### 🌇 Afternoon (4:00-6:00 PM)
- Main socialization outing (15-30 minutes)
  ${ageNum < 1 ? 
    "• New environment exposure (different streets, parks)\n  • Controlled meeting with vaccinated, calm dogs\n  • Brief exposure to various sounds, surfaces, people" : 
    ageCategory === "senior dog" ? 
    "• Quiet, positive social interactions\n  • Gentle walking in familiar areas with occasional new elements\n  • Calm visits with familiar dogs or people" :
    "• Regular walking route with occasional new paths\n  • Casual interactions with well-mannered dogs\n  • Practice maintaining focus during distractions"}
- Practice obedience cues in gradually increasing distractions
- Reward calm behavior and appropriate social responses

### 🌙 Evening (7:00-9:00 PM)
- Calm indoor enrichment activity
- Gentle bonding time with household members
- Brief outdoor potty time with minimal social pressure
- Wind-down routine in consistent, quiet environment

## 🏆 Weekly Socialization Goals

### People Socialization
- Positive experiences with ${ageNum < 1 ? "diverse types of people (different ages, appearances, etc.)" : "familiar and occasional new people"}
- Practice greetings with appropriate jumping control
- ${breedLC.includes("shepherd") || breedLC.includes("guard") ? "Work on accepting strangers with calm behavior" : "Reinforce friendly, appropriate greetings"}
- Create positive associations with handling and restraint

### Dog Socialization
- ${ageNum < 1 ? "Regular playdates with vaccinated, well-socialized dogs" : "Maintain positive relationships with familiar dogs"}
- Practice appropriate greetings and play skills
- Read body language and respect when your dog needs space
- ${breedLC.includes("terrier") || socialChallenges.includes("reactive") ? "Controlled distance work with trigger dogs" : "Occasional new dog introductions in positive settings"}

### Environmental Socialization
- ${ageNum < 1 ? "Expose to various environments, surfaces, sounds" : "Maintain comfort in everyday environments with occasional new experiences"}
- Practice calm behavior in increasingly distracting settings
- ${activityLevel === "High" || activityLevel === "Very High" ? "Work on settling in stimulating environments" : "Gradually increase environmental challenges"}
- Create positive associations with common stressors (vet, groomer)

## 🧠 Breed-Specific Socialization Tips
${breedLC.includes("retriever") || breedLC.includes("lab") ? 
"- Channel friendly energy into structured greetings\n- Use food rewards for calm greetings instead of excited ones\n- Provide appropriate outlets for social needs through playgroups\n- Practice focus work around high-value distractions"
: breedLC.includes("shepherd") || breedLC.includes("doberman") || breedLC.includes("guard") ?
"- Focus on positive experiences with new people\n- Allow observation time before interactions\n- Don't force interactions - respect cautious nature\n- Reward calm acceptance of strangers at a distance first"
: breedLC.includes("terrier") ?
"- Extra focus on impulse control around small animals\n- Structured interactions with other dogs\n- Clear boundaries and consistent expectations\n- Reward calm choices and self-control"
: breedLC.includes("hound") ?
"- Practice recall with gradually increasing scent distractions\n- Allow appropriate sniffing time on walks\n- Work on focus and attention in stimulating environments\n- Manage prey drive in appropriate contexts"
: weightNum < 20 ?
"- Protect from overwhelming dog interactions\n- Create positive associations with larger dogs at safe distances\n- Don't reinforce fearful behavior through coddling\n- Build confidence through success in controlled situations"
: "- Observe your dog's individual social preferences\n- Work with their natural tendencies rather than against them\n- Build on existing social strengths\n- Address specific challenges with gradual exposure"}

## 📝 Special Considerations
- ${ageNum < 1 ? 
   "Critical socialization window closing - focus on diverse, positive experiences" : 
   ageNum > 7 ? 
   "Senior dogs may be less tolerant - respect their social preferences" : 
   "Adult dogs can continue learning social skills with consistent practice"}
- ${activityLevel === "Low" ? 
   "Low energy dogs may be overwhelmed by exuberant dogs - choose social partners carefully" : 
   activityLevel === "High" || activityLevel === "Very High" ? 
   "Work on calm greetings and impulse control in exciting situations" : 
   "Match socialization intensity to your dog's energy level"}
- ${notes ? `Special socialization notes: ${notes}` : "No specific socialization challenges noted"}
- Always monitor body language and respect when your dog needs a break`;
  } 
  else if (petTypeLC === "cat") {
    // Socialization needs based on breed characteristics
    let socialCharacteristics = "";
    let socialApproach = "";
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("siamese") || breedLC.includes("abyssinian") || breedLC.includes("burmese")) {
      socialCharacteristics = "Typically social and interactive with people";
      socialApproach = "Often seeks interaction, may enjoy meeting new people";
    } else if (breedLC.includes("persian") || breedLC.includes("himalayan") || breedLC.includes("exotic")) {
      socialCharacteristics = "Often calm and reserved, may be selective with affection";
      socialApproach = "Prefers controlled, gentle introductions and quiet environments";
    } else if (breedLC.includes("maine") || breedLC.includes("ragdoll") || breedLC.includes("norwegian")) {
      socialCharacteristics = "Typically relaxed and tolerant, often people-oriented";
      socialApproach = "May be accepting of new people but needs proper introductions";
    } else if (breedLC.includes("bengal") || breedLC.includes("savannah")) {
      socialCharacteristics = "Often active and curious but may be selective with social bonds";
      socialApproach = "Needs engaging interaction and respect for boundaries";
    } else {
      socialCharacteristics = "Individual personality varies significantly";
      socialApproach = "Observe and respect your cat's unique social preferences";
    }
    
    return `# ${petEmoji} Personalized Socialization Plan for ${breed} Cat

## Pet Profile
- **Age:** ${ageNum} years (${ageCategory})
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
- **Social characteristics:** ${socialCharacteristics}
- **Social approach:** ${socialApproach}

## 📅 Daily Socialization Schedule

### 🌅 Morning (7:00-8:30 AM)
- Calm greeting ritual on cat's terms
- Respect choice to engage or observe
- Positive association with morning routine
- Interactive play if cat is receptive

### 🕛 Midday (12:00-2:00 PM)
- Quiet presence nearby during cat's rest period
- Offer optional interaction without pressure
- Fresh enrichment item to explore
- Respect choice for solitude

### 🌇 Afternoon (4:00-6:00 PM)
- Main socialization session (10-15 minutes)
  ${ageNum < 1 ? 
    "• Gentle handling of paws, ears, mouth\n  • Introduction to different textures and surfaces\n  • Positive exposure to carriers, grooming tools" : 
    ageNum > 10 ? 
    "• Calm, predictable interaction on cat's terms\n  • Comfortable resting places near family activity\n  • Gentle affection without overwhelming" :
    "• Interactive play with favorite toys\n  • Practice handling if tolerated\n  • Exposure to normal household activities"}
- Create positive associations with various situations
- Reward calm acceptance of handling

### 🌙 Evening (7:00-9:00 PM)
- Quiet bonding time in relaxed atmosphere
- Optional lap time or nearby resting
- Last play session if cat is active in evening
- Consistent bedtime routine

## 🏆 Weekly Socialization Goals

### People Socialization
- Positive experiences with household members
- ${ageNum < 1 ? 
    "Gradual introduction to visitors with treats and calm energy" : 
    socialCharacteristics.includes("social") ? 
    "Maintain positive visitor experiences with cat's preferred interaction style" :
    "Respect need for distance with visitors, provide hiding options"}
- Allow interaction on cat's terms without forcing
- Create positive associations with handling for medical/grooming needs

### Other Animal Socialization (if applicable)
- Maintain existing positive relationships
- Supervised interaction with clear escape routes
- ${ageNum < 1 && socialApproach.includes("seeks") ? 
    "Carefully managed introductions to friendly, cat-savvy pets" : 
    "Respect established boundaries with other household pets"}
- Never force interaction between animals

### Environmental Socialization
- ${ageNum < 1 ? 
    "Regular exposure to household sounds, activities, carrier" : 
    "Maintain comfort with normal household routines"}
- Create positive associations with travel carrier
- Provide safe observation points for household activity
- ${socialCharacteristics.includes("curious") ? 
    "Offer new exploration opportunities in safe contexts" : 
    "Ensure access to familiar, secure resting places"}

## 🧠 Breed-Specific Socialization Tips
${breedLC.includes("siamese") || breedLC.includes("abyssinian") || breedLC.includes("burmese") ? 
"- Provide ample social interaction opportunities\n- Engage with interactive toys and conversation\n- Mental stimulation through training and play\n- May enjoy meeting cat-savvy visitors"
: breedLC.includes("persian") || breedLC.includes("himalayan") ? 
"- Respect quiet nature and need for calm\n- Approach slowly and speak softly\n- Provide elevated retreats away from activity\n- Allow to observe social situations before participating"
: breedLC.includes("maine") || breedLC.includes("ragdoll") ? 
"- Often more accepting of handling than average cats\n- May enjoy gentle physical interaction\n- Typically tolerant but still respect boundaries\n- Often good with cat-savvy visitors"
: breedLC.includes("bengal") || breedLC.includes("savannah") ? 
"- Highly intelligent - provide mental challenges\n- May form strong bonds but be selective\n- Needs appropriate outlets for energy\n- May be more dog-like in social behavior"
: "- Observe your cat's individual social preferences\n- Work with their natural tendencies\n- Allow choice in all social interactions\n- Build trust through consistency and respect"}

## 📝 Special Considerations
- ${ageCategory === "kitten" ? 
   "Critical socialization window - focus on positive experiences with handling, carriers, and various people" : 
   ageNum > 10 ? 
   "Senior cats often prefer predictable, quiet social interactions" : 
   "Adult cats can continue building social confidence through positive experiences"}
- ${activityLevel === "Low" ? 
   "Respect lower energy - shorter, calmer social interactions" : 
   activityLevel === "High" || activityLevel === "Very High" ? 
   "Channel social energy through interactive play before handling" : 
   "Match socialization intensity to your cat's energy level"}
- ${notes ? `Special socialization notes: ${notes}` : "No specific socialization challenges noted"}
- Always provide hiding places and escape routes during social situations`;
  }
  else {
    return `# ${petEmoji} Personalized Socialization Plan for ${breed} ${petTypeLC}

## Pet Profile
- **Species:** ${petTypeLC}
- **Breed:** ${breed}
- **Age:** ${ageNum} years
- **Weight:** ${weightNum} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## Important Note
This is a generalized socialization plan. ${petTypeLC}s have highly specialized social needs that vary significantly by species. Many exotic pets do NOT benefit from the same socialization approaches used for dogs and cats. Consult with a veterinarian who specializes in exotic pets for species-appropriate recommendations.

## 📅 Socialization Considerations

### Understanding Natural Social Behavior
- Research whether your species is naturally solitary or social
- Respect species-typical social groupings
- Understand normal communication signals
- Never force interaction on naturally solitary species

### Human Interaction Guidelines
- Approach at or below the animal's eye level
- Move slowly and speak softly if interaction is appropriate
- Watch for stress signals and respect when the animal needs space
- Create positive associations through appropriate species rewards

### Environmental Socialization
- Gradually introduce to normal household sounds at safe distances
- Provide appropriate hiding places and secure retreats
- Create positive associations with necessary handling equipment
- Practice calm, brief handling sessions if appropriate for species

## 🧠 Species-Specific Considerations
- Many exotic species are naturally solitary and prefer minimal handling
- Some species may bond with humans but still need specific interaction approaches
- Others may be social with their own kind but stressed by human interaction
- Research your specific species' natural social structure

## 📝 Special Recommendations
- Focus on creating positive associations rather than forced handling
- Provide species-appropriate environmental enrichment
- Respect natural behaviors and social needs
- For social species, consider appropriate companionship of same species
- ${notes ? `Special notes: ${notes}` : "Consult exotic pet specialists for specific socialization recommendations"}`;
  }
}
