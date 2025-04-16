
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
    const { petType, breed, age, weight, activityLevel, dietaryRestrictions } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Construct the prompt for OpenAI
      const systemPrompt = `You are a professional pet nutritionist. Create a detailed, personalized diet plan for pets based on the information provided. 
      Include:
      1. Daily feeding schedule with specific times (morning 6-9am, midday 11am-1pm, afternoon 3-5pm, evening 6-8pm, night 9-11pm)
      2. Portion sizes tailored to the pet's weight and activity level
      3. Recommended foods with specific brands if applicable
      4. Supplement recommendations
      5. Hydration guidance
      6. Special considerations based on breed-specific needs
      
      Format your response in clear sections with emoji icons where appropriate.`;
      
      const userPrompt = `Create a diet plan for a ${age} year old ${breed} ${petType} that weighs ${weight} pounds with ${activityLevel} activity level. ${dietaryRestrictions ? `Note these dietary restrictions: ${dietaryRestrictions}.` : ''}`;

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
        const fallbackDietPlan = generateFallbackDietPlan(petType, breed, age, weight, activityLevel, dietaryRestrictions);
        
        return new Response(
          JSON.stringify({ 
            dietPlan: fallbackDietPlan,
            metadata: { petType, breed, age, weight, activityLevel },
            generatedBy: "fallback" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const dietPlan = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ 
          dietPlan,
          metadata: { petType, breed, age, weight, activityLevel }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error('Error in OpenAI API call:', error);
      // Generate a fallback response
      const fallbackDietPlan = generateFallbackDietPlan(petType, breed, age, weight, activityLevel, dietaryRestrictions);
      
      return new Response(
        JSON.stringify({ 
          dietPlan: fallbackDietPlan,
          metadata: { petType, breed, age, weight, activityLevel },
          generatedBy: "fallback" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-diet-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback diet plan generator function with improved formatting and personalization
function generateFallbackDietPlan(petType: string, breed: string, age: string, weight: string, activityLevel: string, dietaryRestrictions?: string): string {
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
  
  // Breed-specific recommendations
  let breedSpecific = "";
  
  if (petTypeLC === "dog") {
    const largeBreeds = ["german shepherd", "labrador", "golden retriever", "rottweiler", "husky", "great dane"];
    const smallBreeds = ["chihuahua", "pomeranian", "shih tzu", "yorkshire terrier", "dachshund", "pug"];
    
    const breedLC = breed.toLowerCase();
    
    if (largeBreeds.some(b => breedLC.includes(b))) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Large breed formula recommended to support joint health\n- Consider glucosamine supplements for joint support\n- Watch for signs of bloat - feed smaller, more frequent meals\n- Avoid rapid weight gain especially during growth phases`;
    } else if (smallBreeds.some(b => breedLC.includes(b))) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Small breed formula with smaller kibble size recommended\n- Higher calorie density food may be needed due to faster metabolism\n- More frequent meals to prevent hypoglycemia\n- Dental health is especially important - consider dental treats`;
    }
    
    // Add breed-specific traits
    if (breedLC.includes("husky") || breedLC.includes("malamute")) {
      breedSpecific += "\n- Arctic breeds often have efficient metabolisms - monitor portions carefully\n- May benefit from higher protein food due to active nature";
    } else if (breedLC.includes("bulldog") || breedLC.includes("pug")) {
      breedSpecific += "\n- Brachycephalic breeds may benefit from elevated feeding dishes\n- Prone to obesity - strict portion control recommended";
    }
  }
  
  if (petTypeLC === "cat") {
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("persian") || breedLC.includes("himalayan")) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Consider moistened food or pâté textures to prevent dehydration\n- Kibble shape that promotes oral health due to facial structure\n- May benefit from hairball formula foods\n- Monitor for difficulty eating due to facial structure`;
    } else if (breedLC.includes("maine coon") || breedLC.includes("ragdoll")) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Larger breed cats need more calories during growth phases\n- Joint support supplements recommended as they age\n- Higher protein requirements than average cats\n- Larger kibble size may be preferred`;
    } else if (breedLC.includes("siamese") || breedLC.includes("abyssinian")) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Higher energy breeds may need more calories\n- Benefit from interactive feeding toys due to high intelligence\n- Prone to dental issues - crunchy food recommended\n- May need protein-rich diet to support muscle tone`;
    }
  }

  // Calculate calorie needs based on weight and activity
  const baseCalories = petTypeLC === "dog" 
    ? Math.round(weightNum * 30 * (activityLevel === "Low" ? 0.8 : activityLevel === "High" || activityLevel === "Very High" ? 1.2 : 1))
    : petTypeLC === "cat" 
    ? Math.round(weightNum * 20 * (activityLevel === "Low" ? 0.8 : activityLevel === "High" || activityLevel === "Very High" ? 1.2 : 1))
    : 0;
  
  // Basic diet plans by pet type
  let dietPlan = "";
  
  if (petTypeLC === "dog") {
    dietPlan = `# ${petEmoji} Personalized Diet Plan for ${breed} Dog

## Pet Profile
- **Age:** ${age} years (${ageCategory})
- **Weight:** ${weight} lbs
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
- ${dietaryRestrictions ? `Special consideration for dietary restrictions: ${dietaryRestrictions}` : "No specific dietary restrictions noted"}\n`;
  } 
  else if (petTypeLC === "cat") {
    dietPlan = `# ${petEmoji} Personalized Diet Plan for ${breed} Cat

## Pet Profile
- **Age:** ${age} years (${ageCategory})
- **Weight:** ${weight} lbs
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

${breedSpecific || ""}

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
- ${dietaryRestrictions ? `Special consideration for dietary restrictions: ${dietaryRestrictions}` : "No specific dietary restrictions noted"}\n`;
  }
  else {
    dietPlan = `# ${petEmoji} Personalized Diet Plan for ${breed} ${petType}

## Pet Profile
- **Species:** ${petType}
- **Breed:** ${breed}
- **Age:** ${age} years
- **Weight:** ${weight} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}

## 📅 Daily Care Schedule

### 🌅 Morning (7:00-9:00 AM)
- First feeding with fresh food appropriate for your ${petType}
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
- Research specific nutritional needs for your ${petType} species
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
- ${petType}s have unique care requirements that may differ significantly from common pets
- Regular visits to a specialized veterinarian are recommended
- ${dietaryRestrictions ? `Special consideration for dietary restrictions: ${dietaryRestrictions}` : "Research specific dietary needs for your pet's species"}
- Consult species-specific care guides for detailed information\n`;
  }
  
  return dietPlan;
}
