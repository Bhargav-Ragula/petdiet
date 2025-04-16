
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

    try {
      // Construct the prompts based on plan type
      const systemPrompt = getSystemPrompt(planType);
      const userPrompt = getUserPrompt(planType, petType, breed, age, weight, activityLevel, notes);

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
        const fallbackCarePlan = generateFallbackCarePlan(planType, petType, breed, age, weight, activityLevel, notes);
        
        return new Response(
          JSON.stringify({ 
            carePlan: fallbackCarePlan,
            metadata: { petType, breed, age, weight, activityLevel },
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
          metadata: { petType, breed, age, weight, activityLevel }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error('Error in OpenAI API call:', error);
      // Generate a fallback response
      const fallbackCarePlan = generateFallbackCarePlan(planType, petType, breed, age, weight, activityLevel, notes);
      
      return new Response(
        JSON.stringify({ 
          carePlan: fallbackCarePlan,
          metadata: { petType, breed, age, weight, activityLevel },
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

// Get system prompt based on plan type
function getSystemPrompt(planType: string): string {
  const basePrompt = `You are a professional pet care specialist. Create a detailed, personalized ${planType} plan for pets based on the information provided.
  Include:
  1. Daily schedule with specific times (morning 6-9am, midday 11am-1pm, afternoon 3-5pm, evening 6-8pm, night 9-11pm)
  2. Activities and recommendations tailored to the pet's breed, weight, age and activity level
  3. Specific pet type and breed-specific recommendations
  4. Special considerations based on breed-specific needs
  
  Format your response in clear sections with emoji icons where appropriate. ALWAYS include the schedule with morning, midday, afternoon, evening, and night sections, each with their respective emoji (🌅 for morning, 🕛 for midday, 🌇 for afternoon, 🌙 for evening, 🌠 for night).`;

  const planSpecificPrompts: Record<string, string> = {
    nutrition: `${basePrompt}
    
    For nutrition plans, include:
    - Portion sizes tailored to the pet's weight and activity level
    - Recommended foods with specific brands if applicable
    - Supplement recommendations
    - Hydration guidance
    - Breed-specific dietary needs
    - Age-appropriate diet recommendations`,
    
    training: `${basePrompt}
    
    For training plans, include:
    - Age-appropriate training techniques
    - Breed-specific training challenges and solutions
    - Positive reinforcement methods
    - Consistency and routine recommendations
    - Specific commands and how to teach them
    - Training progression timeline`,
    
    health: `${basePrompt}
    
    For health plans, include:
    - Preventative care recommendations
    - Vaccination schedule
    - Parasite prevention
    - Dental care routine
    - Regular check-up schedule
    - Common health issues to watch for based on breed
    - Exercise recommendations for optimal health`,
    
    activities: `${basePrompt}
    
    For activity plans, include:
    - Age and breed-appropriate exercise recommendations
    - Mental stimulation activities
    - Play and enrichment ideas
    - Weather considerations
    - Indoor vs outdoor activities
    - Exercise duration recommendations based on breed and age
    - Signs of over-exertion to watch for`,
    
    grooming: `${basePrompt}
    
    For grooming plans, include:
    - Coat-specific grooming techniques
    - Bathing frequency recommendations
    - Nail trimming schedule
    - Ear cleaning guidance
    - Dental hygiene routine
    - Tools and products recommended for the specific breed
    - Professional vs at-home grooming balance`,
    
    social: `${basePrompt}
    
    For socialization plans, include:
    - Age-appropriate socialization techniques
    - Exposure recommendations to different environments
    - Introduction protocols to other animals
    - Human socialization strategies
    - Signs of stress or anxiety to watch for
    - Breed-specific social tendencies and how to work with them
    - Training for social situations`
  };

  return planSpecificPrompts[planType] || basePrompt;
}

// Get user prompt based on plan type and pet information
function getUserPrompt(planType: string, petType: string, breed: string, age: string, weight: string, activityLevel: string, notes?: string): string {
  let prompt = `Create a ${planType} plan for a ${age} year old ${breed} ${petType} that weighs ${weight} pounds with ${activityLevel} activity level.`;
  
  if (notes && notes.trim() !== '') {
    prompt += ` Note these special considerations: ${notes}.`;
  }

  // Add pet type specific considerations
  if (petType.toLowerCase() === 'dog') {
    prompt += ` For dogs, consider their need for socialization, training, and exercise based on breed characteristics.`;
    
    // Add breed-specific considerations for dogs
    const smallBreeds = ['chihuahua', 'yorkshire terrier', 'pomeranian', 'shih tzu', 'maltese', 'papillon', 'pug'];
    const largeBreeds = ['german shepherd', 'labrador', 'golden retriever', 'doberman', 'rottweiler', 'great dane'];
    const breedLowerCase = breed.toLowerCase();
    
    if (smallBreeds.some(b => breedLowerCase.includes(b))) {
      prompt += ` As a small breed dog, consider their faster metabolism, potential for hypoglycemia, and dental health concerns.`;
    } else if (largeBreeds.some(b => breedLowerCase.includes(b))) {
      prompt += ` As a large breed dog, consider their joint health, slower metabolism, and potential for bloat.`;
    }
    
    if (breedLowerCase.includes('bulldog') || breedLowerCase.includes('pug') || breedLowerCase.includes('boxer') || breedLowerCase.includes('shih tzu')) {
      prompt += ` As a brachycephalic (flat-faced) breed, consider their breathing limitations and heat sensitivity.`;
    }
  } else if (petType.toLowerCase() === 'cat') {
    prompt += ` For cats, consider their independence, territorial nature, and need for environmental enrichment.`;
    
    // Add breed-specific considerations for cats
    const breedLowerCase = breed.toLowerCase();
    if (breedLowerCase.includes('persian') || breedLowerCase.includes('himalayan')) {
      prompt += ` As a long-haired breed with a flat face, consider their grooming needs and potential breathing issues.`;
    } else if (breedLowerCase.includes('siamese') || breedLowerCase.includes('oriental')) {
      prompt += ` As an active and vocal breed, consider their high energy and social needs.`;
    } else if (breedLowerCase.includes('maine coon') || breedLowerCase.includes('ragdoll')) {
      prompt += ` As a large breed cat, consider their specific nutritional needs and potential for joint issues.`;
    }
  } else if (petType.toLowerCase() === 'bird') {
    prompt += ` For birds, consider their need for mental stimulation, social interaction, and proper nutrition.`;
  } else if (petType.toLowerCase() === 'rabbit') {
    prompt += ` For rabbits, consider their need for hay, dental health, and socialization.`;
  } else if (petType.toLowerCase() === 'hamster') {
    prompt += ` For hamsters, consider their nocturnal nature, need for exercise, and proper habitat setup.`;
  } else if (petType.toLowerCase() === 'fish') {
    prompt += ` For fish, consider their specific water parameters, tank size needs, and compatible tank mates.`;
  } else if (petType.toLowerCase() === 'reptile') {
    prompt += ` For reptiles, consider their specific temperature, lighting, and habitat requirements.`;
  }

  return prompt;
}

// Fallback pet care plan generator function with improved formatting and personalization
function generateFallbackCarePlan(planType: string, petType: string, breed: string, age: string, weight: string, activityLevel: string, notes?: string): string {
  const petTypeLC = petType.toLowerCase();
  const ageNum = parseInt(age) || 1;
  const weightNum = parseInt(weight) || 10;
  
  // Pet type specific emoji
  const petEmoji = petTypeLC === "dog" ? "🐕" : 
                  petTypeLC === "cat" ? "🐱" : 
                  petTypeLC === "bird" ? "🐦" : 
                  petTypeLC === "fish" ? "🐠" : 
                  petTypeLC === "rabbit" ? "🐰" : 
                  petTypeLC === "hamster" ? "🐹" : 
                  petTypeLC === "reptile" ? "🦎" : "🐾";
  
  // Activity level emoji
  const activityEmoji = activityLevel === "High" || activityLevel === "Very High" ? "🏃" : 
                       activityLevel === "Low" ? "😴" : "🚶";
  
  // Age category
  const ageCategory = petTypeLC === "dog" ? 
                     (ageNum < 1 ? "puppy" : ageNum > 7 ? "senior dog" : "adult dog") :
                     petTypeLC === "cat" ? 
                     (ageNum < 1 ? "kitten" : ageNum > 10 ? "senior cat" : "adult cat") :
                     "pet";
  
  // Plan type emoji
  const planEmoji = planType === "nutrition" ? "🍽️" : 
                   planType === "training" ? "🎓" : 
                   planType === "health" ? "❤️" : 
                   planType === "activities" ? "🎯" : 
                   planType === "grooming" ? "💅" : 
                   planType === "social" ? "👋" : "📝";
  
  // Breed-specific recommendations
  let breedSpecific = "";
  
  if (petTypeLC === "dog") {
    const largeBreeds = ["german shepherd", "labrador", "golden retriever", "rottweiler", "husky", "great dane"];
    const smallBreeds = ["chihuahua", "pomeranian", "shih tzu", "yorkshire terrier", "dachshund", "pug"];
    
    const breedLC = breed.toLowerCase();
    
    if (largeBreeds.some(b => breedLC.includes(b))) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Large breed recommendations tailored to their size and needs\n- Consider joint health support, especially as they age\n- Watch for signs of bloat - feed smaller, more frequent meals\n- Ensure appropriate exercise for their energy level`;
    } else if (smallBreeds.some(b => breedLC.includes(b))) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Small breed recommendations suited to their size\n- Pay special attention to dental health with regular care\n- More frequent meals may be beneficial due to faster metabolism\n- Careful with jumps from furniture to protect joints`;
    }
    
    // Add breed-specific traits
    if (breedLC.includes("husky") || breedLC.includes("malamute")) {
      breedSpecific += "\n- Arctic breeds often need more exercise than average\n- May have strong prey drive requiring secure environments\n- Often thrive with engaging mental challenges";
    } else if (breedLC.includes("bulldog") || breedLC.includes("pug")) {
      breedSpecific += "\n- Brachycephalic breeds need special attention to breathing\n- Extra care needed in warm weather to prevent overheating\n- Moderate exercise with plenty of rest periods";
    } else if (breedLC.includes("retriever") || breedLC.includes("labrador")) {
      breedSpecific += "\n- Retrievers often benefit from water activities\n- Interactive toys to keep their minds engaged\n- Watch portion control as they tend to gain weight easily";
    }
  }
  
  if (petTypeLC === "cat") {
    const breedLC = breed.toLowerCase();
    
    if (breedLC.includes("persian") || breedLC.includes("himalayan")) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Daily grooming needed for long coat maintenance\n- Special attention to facial cleaning for flat-faced breeds\n- May prefer elevated feeding dishes\n- Watch for signs of breathing difficulty or overheating`;
    } else if (breedLC.includes("maine coon") || breedLC.includes("ragdoll")) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Larger cat breeds need more space for comfort\n- Regular joint health monitoring recommended\n- Interactive play to keep their minds engaged\n- May develop heart conditions - regular vet checks advised`;
    } else if (breedLC.includes("siamese") || breedLC.includes("abyssinian")) {
      breedSpecific = `## ${breed}-Specific Considerations 🧬\n- Higher energy breeds needing regular play sessions\n- Puzzle toys to satisfy their intelligence\n- May be more vocal - ensure they have outlets for communication\n- Thrive with consistent interaction and attention`;
    }
  }

  // Generate care plan based on plan type
  let carePlan = "";
  
  // Common plan header
  carePlan = `# ${petEmoji} ${planEmoji} Personalized ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan for ${breed} ${petType}

## Pet Profile
- **Age:** ${age} years (${ageCategory})
- **Weight:** ${weight} lbs
- **Activity Level:** ${activityLevel} ${activityEmoji}
${notes ? `- **Special Notes:** ${notes}` : ""}

## 📅 Daily ${planType.charAt(0).toUpperCase() + planType.slice(1)} Schedule

`;

  // Add daily schedule sections with appropriate content based on plan type
  carePlan += `### 🌅 Morning (6:00-9:00 AM)
${getMorningActivities(planType, petTypeLC, ageCategory, weightNum, activityLevel)}

### 🕛 Midday (11:00 AM-1:00 PM)
${getMiddayActivities(planType, petTypeLC, ageCategory, weightNum, activityLevel)}

### 🌇 Afternoon (3:00-5:00 PM)
${getAfternoonActivities(planType, petTypeLC, ageCategory, weightNum, activityLevel)}

### 🌙 Evening (6:00-8:00 PM)
${getEveningActivities(planType, petTypeLC, ageCategory, weightNum, activityLevel)}

### 🌠 Night (8:30-11:00 PM)
${getNightActivities(planType, petTypeLC, ageCategory, weightNum, activityLevel)}

`;

  // Add plan-specific sections
  switch (planType) {
    case "nutrition":
      carePlan += `## 🍽️ Recommended Foods

- ${getRecommendedFoods(petTypeLC, ageCategory, weightNum, activityLevel)}

## 💧 Hydration

- ${getHydrationTips(petTypeLC, ageCategory)}

## 💊 Supplements

- ${getSupplementRecommendations(petTypeLC, ageCategory, weightNum)}

`;
      break;
    case "training":
      carePlan += `## 🎯 Key Training Goals

- ${getTrainingGoals(petTypeLC, ageCategory)}

## 📝 Training Methods

- ${getTrainingMethods(petTypeLC, ageCategory)}

## 🔄 Consistency Tips

- ${getConsistencyTips(petTypeLC)}

`;
      break;
    case "health":
      carePlan += `## 🩺 Preventative Care

- ${getPreventativeCare(petTypeLC, ageCategory)}

## 💉 Vaccination Schedule

- ${getVaccinationSchedule(petTypeLC, ageCategory)}

## 🦷 Dental Care

- ${getDentalCare(petTypeLC, ageCategory)}

`;
      break;
    case "activities":
      carePlan += `## 🏃 Exercise Recommendations

- ${getExerciseRecommendations(petTypeLC, ageCategory, weightNum, activityLevel)}

## 🧩 Mental Stimulation

- ${getMentalStimulation(petTypeLC, ageCategory)}

## 🌦️ Weather Considerations

- ${getWeatherConsiderations(petTypeLC)}

`;
      break;
    case "grooming":
      carePlan += `## 🛁 Bathing & Coat Care

- ${getBathingAndCoatCare(petTypeLC, breed)}

## ✂️ Nail & Paw Care

- ${getNailAndPawCare(petTypeLC)}

## 👂 Ear & Eye Care

- ${getEarAndEyeCare(petTypeLC)}

`;
      break;
    case "social":
      carePlan += `## 🐾 Pet-to-Pet Socialization

- ${getPetToPetSocialization(petTypeLC, ageCategory)}

## 👪 Human Socialization

- ${getHumanSocialization(petTypeLC, ageCategory)}

## 🚶 Environmental Exposure

- ${getEnvironmentalExposure(petTypeLC, ageCategory)}

`;
      break;
    default:
      // General care information as fallback
      carePlan += `## 📝 General Care Notes

- Regular veterinary check-ups are important for all pets
- Consistent routines help pets feel secure and happy
- Monitor for any changes in behavior, appetite, or energy levels
- Adjust care as your pet ages to accommodate changing needs

`;
  }

  // Add breed specific recommendations if available
  if (breedSpecific) {
    carePlan += `${breedSpecific}\n\n`;
  }

  carePlan += `## 📌 Additional Tips
- ${activityLevel === "High" || activityLevel === "Very High" ? 
     `Given your pet's high activity level, ensure they have plenty of outlets for their energy` : 
     activityLevel === "Low" ? 
     `With a lower activity level, focus on quality over quantity for exercise and enrichment` : 
     `Maintain a balanced routine of activity and rest appropriate for your pet's needs`}
- ${ageCategory.includes("puppy") || ageCategory.includes("kitten") ? 
     `Young pets need more frequent attention and training sessions but in shorter durations` : 
     ageCategory.includes("senior") ? 
     `Senior pets benefit from gentler, more consistent care routines with attention to comfort` : 
     `Adult pets thrive with established routines and regular enrichment`}
- ${notes ? `Special consideration for your notes: ${notes}` : "Monitor your pet's response to this plan and adjust as needed"}\n`;

  return carePlan;
}

// Helper functions for generating specific sections of fallback care plans

function getMorningActivities(planType: string, petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  switch (planType) {
    case "nutrition":
      if (petType === "dog") {
        return `- First meal: ${Math.round(weight * 0.01 * (activityLevel === "High" ? 1.2 : 1))} cups of high-quality ${ageCategory.includes("puppy") ? "puppy" : ageCategory.includes("senior") ? "senior" : "adult"} food
- Fresh water refresh
- Optional: Add probiotic supplement to breakfast
- Brief post-breakfast bathroom walk`;
      } else if (petType === "cat") {
        return `- First meal: ${Math.round(weight * 0.005 * (activityLevel === "High" ? 1.2 : 1))} cups of premium ${ageCategory.includes("kitten") ? "kitten" : ageCategory.includes("senior") ? "senior" : "adult"} cat food
- Mix of wet and dry food for hydration
- Fresh water refresh
- Allow time for grooming after eating`;
      } else {
        return `- Morning feeding with appropriate food for your ${petType}
- Fresh water provision
- Check for any leftover food and clean feeding area`;
      }
    case "training":
      if (petType === "dog") {
        return `- 5-10 minute training session focusing on ${ageCategory.includes("puppy") ? "basic commands like sit and stay" : "reinforcing established commands"}
- Use high-value treats for motivation in the morning
- Practice leash manners during morning bathroom walk
- Incorporate commands into daily routine (sit before feeding, etc.)`;
      } else if (petType === "cat") {
        return `- Short clicker training session (2-3 minutes) while cat is alert
- Target training with wand toy to encourage stretching
- Reward for using scratching post instead of furniture
- Practice handling exercises for grooming preparation`;
      } else {
        return `- Morning handling and interaction time
- Gentle approach to avoid startling your ${petType}
- Positive reinforcement for desired behaviors
- Keep sessions brief but consistent`;
      }
    case "health":
      return `- Quick health check: eyes, ears, energy level
- Administer any morning medications
- Dental care: ${petType === "dog" || petType === "cat" ? "teeth brushing or dental treat" : "appropriate dental care for your pet type"}
- Brief health-supporting exercise ${petType === "dog" ? "walk" : petType === "cat" ? "play session" : "activity"}`;
    case "activities":
      if (petType === "dog") {
        return `- ${activityLevel === "High" || activityLevel === "Very High" ? "20-30 minute brisk walk" : "15 minute leisurely walk"} before day gets hot
- Brief sniff exploration time for mental stimulation
- Practice recall in enclosed area
- Introduce new toy or rotate existing toys`;
      } else if (petType === "cat") {
        return `- Interactive play session with wand toy (5-10 minutes)
- Window watching time with bird feeder if possible
- Puzzle feeder for mental stimulation
- Rotate toys to maintain interest`;
      } else {
        return `- Morning exercise appropriate to your ${petType}'s species needs
- Provide fresh enrichment items
- Ensure habitat is clean and stimulating
- Morning socialization if appropriate for species`;
      }
    case "grooming":
      return `- Quick coat check and ${petType === "dog" || petType === "cat" ? "brush through" : "appropriate grooming"}
- Check and clean eyes if needed
- Inspect paws/feet for any issues
- Morning dental care routine`;
    case "social":
      return `- Calm greeting routine to start the day
- ${petType === "dog" ? "Brief neighborhood walk to see people/other dogs" : petType === "cat" ? "Window time to watch outdoor activity" : "Gentle interaction appropriate for your pet type"}
- Practice calm behavior around breakfast activities
- Morning cuddle time for bonding`;
    default:
      return `- Morning care routine for your ${petType}
- Feeding and fresh water
- Brief health check
- Morning exercise or playtime`;
  }
}

function getMiddayActivities(planType: string, petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  switch (planType) {
    case "nutrition":
      if (petType === "dog" && (ageCategory.includes("puppy") || weight < 15)) {
        return `- Mid-day small meal: ${Math.round(weight * 0.005 * (activityLevel === "High" ? 1.2 : 1))} cups of food
- Fresh water refresh
- Small training treats can be used during brief sessions
- Avoid exercise right after feeding`;
      } else if (petType === "cat" && ageCategory.includes("kitten")) {
        return `- Small meal for kitten: ${Math.round(weight * 0.003 * (activityLevel === "High" ? 1.2 : 1))} cups of premium kitten food
- Fresh water refresh
- Wet food recommended for extra hydration
- Allow quiet digestion time after eating`;
      } else {
        return `- Fresh water refresh
- Small healthy treat or snack if appropriate for your pet
- Check for any food-seeking behavior that might indicate hunger
- Ensure food storage remains secure and fresh`;
      }
    case "training":
      return `- 5-minute reinforcement of morning training
- Practice "settle" or "place" command during typical rest time
- Use lower value treats due to lower motivation mid-day
- Focus on calm behavior and impulse control`;
    case "health":
      return `- Mid-day stretch or light activity for joint health
- Check water intake is adequate
- Administer any mid-day medications
- Brief health scan for any changes since morning`;
    case "activities":
      if (activityLevel === "High" || activityLevel === "Very High") {
        return `- Interactive play or puzzle toy to prevent boredom
- Brief outdoor time for bathroom and fresh air
- Mental stimulation game to tire the mind
- If home alone, rotate accessible toys`;
      } else {
        return `- Quiet enrichment activity appropriate to species
- Check if habitat/resting area is comfortable
- Provide fresh water
- Allow for natural rest period`;
      }
    case "grooming":
      return `- Quick check for any debris in coat or paws
- Wipe down if needed after outdoor time
- Clean water bowl during refresh
- Check ears and eyes if prone to issues`;
    case "social":
      return `- If home, quiet interaction time
- If alone, leave audio stimulation (radio, TV)
- Provide safe viewing area for outside world
- Set up interactive toy if appropriate`;
    default:
      return `- Mid-day check-in with your pet
- Fresh water provision
- Brief activity or play session
- Allow for appropriate rest time`;
  }
}

function getAfternoonActivities(planType: string, petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  switch (planType) {
    case "nutrition":
      if (petType === "dog" && ageCategory.includes("puppy")) {
        return `- Afternoon small meal for puppy: ${Math.round(weight * 0.005 * (activityLevel === "High" ? 1.2 : 1))} cups of puppy food
- Fresh water refresh
- Small healthy treat during training
- Monitor for proper digestion`;
      } else {
        return `- Fresh water refresh
- ${petType === "cat" && ageCategory.includes("kitten") ? "Small meal for kitten" : "Small healthy treat if appropriate"}
- Monitor hydration, especially during warmer days
- Prepare evening meal ingredients`;
      }
    case "training":
      if (petType === "dog") {
        return `- 10-15 minute training session when energy levels rise again
- Practice loose-leash walking or recall in yard
- Work on a new trick or command
- Use play as reward for good training performance`;
      } else if (petType === "cat") {
        return `- Target training with wand (3-5 minutes)
- Practice come when called with treats
- Encourage use of cat furniture/appropriate scratching surfaces
- Reward calm behavior around high-activity household times`;
      } else {
        return `- Brief training session appropriate for species
- Focus on enrichment and positive behavior
- Use species-appropriate rewards
- Keep sessions short and positive`;
      }
    case "health":
      return `- ${activityLevel === "High" || activityLevel === "Very High" ? "More active exercise session" : "Moderate activity"} for physical health
- Mental stimulation for cognitive health
- Check for adequate water intake throughout day
- Monitor bathroom habits for any changes`;
    case "activities":
      if (petType === "dog") {
        return `- ${activityLevel === "High" || activityLevel === "Very High" ? "30-minute active play or training session" : "15-20 minute moderate walk or play"}
- Introduce scent work or tracking games
- Practice skills like fetch or agility elements
- Allow exploration time in safe area`;
      } else if (petType === "cat") {
        return `- Interactive play when cat becomes more active
- Rotate toys to prevent boredom
- Set up hunting game with treats or toys
- Provide climbing and exploration opportunities`;
      } else {
        return `- Afternoon enrichment activities
- Species-appropriate play or exercise
- Environmental enrichment rotation
- Supervised out-of-habitat time if appropriate`;
      }
    case "grooming":
      return `- More thorough brushing session
- Check and clean ears if needed
- Inspect for any skin issues or parasites
- Clean facial folds/eyes if applicable`;
    case "social":
      return `- More active social interaction time
- ${petType === "dog" ? "Visit to park or pet-friendly location if possible" : "Interactive play that mimics social behaviors"}
- Practice calm greetings with household members returning home
- Reward calm behavior during higher activity household times`;
    default:
      return `- Afternoon care routine
- Check for any needs or issues
- Interactive time with your pet
- Prepare for evening activities`;
  }
}

function getEveningActivities(planType: string, petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  switch (planType) {
    case "nutrition":
      if (petType === "dog") {
        return `- Main evening meal: ${Math.round(weight * 0.012 * (activityLevel === "High" ? 1.2 : 1))} cups of high-quality food
- Add any evening supplements like fish oil
- Fresh water refresh
- Allow 1-2 hours digestion before bedtime`;
      } else if (petType === "cat") {
        return `- Larger evening meal when naturally more active: ${Math.round(weight * 0.006 * (activityLevel === "High" ? 1.2 : 1))} cups of premium food
- Mix of wet and dry food for hydration and dental health
- Fresh water refresh
- Monitor eating habits and preferences`;
      } else {
        return `- Evening feeding appropriate for your ${petType}
- Fresh water provision
- Monitor eating patterns and appetite
- Clean feeding area before night`;
      }
    case "training":
      return `- Review day's training progress with short session
- Practice settling behaviors for evening routine
- Use lower energy training appropriate for end of day
- Reinforce calm behavior in the home`;
    case "health":
      return `- Evening medications if prescribed
- Gentle massage or physical check for any issues
- Dental care routine before bed
- Wind-down activity for mental health`;
    case "activities":
      if (activityLevel === "High" || activityLevel === "Very High") {
        return `- Longer evening exercise to tire before night: ${petType === "dog" ? "30-45 minute walk or play session" : "15-20 minute interactive play"}
- Focus on physical activities that burn energy
- Incorporate training into play
- Allow cool-down period before bedtime routine`;
      } else {
        return `- Moderate evening activity
- Calm interactive play
- Bonding time with gentle engagement
- Begin settling routine for night`;
      }
    case "grooming":
      return `- More thorough grooming session when both pet and owner are relaxed
- Check paws and clean if needed after day's activities
- Dental care if not done in morning
- Address any mats or tangles in coat`;
    case "social":
      return `- Quality family time with positive interaction
- Calm and structured engagement before bedtime
- Practice settled behavior around evening home activities
- Reward calm social behaviors`;
    default:
      return `- Evening care routine
- Main meal if appropriate for species
- Check for any issues from the day
- Begin settling for night`;
  }
}

function getNightActivities(planType: string, petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  switch (planType) {
    case "nutrition":
      if ((petType === "dog" && (ageCategory.includes("puppy") || ageCategory.includes("senior"))) || 
          (petType === "cat" && ageCategory.includes("kitten"))) {
        return `- Small bedtime snack for ${ageCategory}: ${Math.round(weight * 0.003)} oz of easily digestible food
- Fresh water available through night
- No treats after this point
- Ensure food storage is secure overnight`;
      } else {
        return `- Fresh water for overnight
- No food recommended late at night unless medically needed
- Ensure all food is stored securely
- Clean feeding areas before bedtime`;
      }
    case "training":
      return `- Practice bedtime settling routine
- Reward calm behavior and going to bed/crate willingly
- Keep interactions calm and minimal
- Reinforce "place" or bedtime location command`;
    case "health":
      return `- Final bathroom opportunity
- Check for any health concerns before bed
- Administer any nighttime medications
- Ensure sleeping area is comfortable and appropriate temperature`;
    case "activities":
      return `- Very calm activities only, like gentle petting
- Short, gentle stretch for physical comfort
- Ensure evening exercise was adequate for good sleep
- Prepare sleeping area and comfort items`;
    case "grooming":
      return `- Quick check and wipe down if needed
- Final bathroom needs and clean-up
- Prepare grooming tools for morning
- Ensure sleeping area is clean and comfortable`;
    case "social":
      return `- Calming bedtime routine that's consistent
- Minimal stimulation to signal sleep time
- Brief loving interaction before sleep
- Secure and comfortable sleeping arrangement`;
    default:
      return `- Nighttime care routine
- Settling for sleep
- Final check on comfort and needs
- Secure home environment for overnight`;
  }
}

function getRecommendedFoods(petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  if (petType === "dog") {
    return `High-quality commercial dog food appropriate for ${ageCategory.replace("dog", "")} stage
- Premium brands like Royal Canin, Hill's Science Diet, or Purina Pro Plan
- Protein content: ${activityLevel === "High" || activityLevel === "Very High" ? "28-30%" : "22-26%"} for your dog's activity level
- Safe fruits and vegetables as occasional treats: carrots, blueberries, apple slices (no seeds)
- Avoid: chocolate, grapes/raisins, onions, xylitol-containing foods`;
  } else if (petType === "cat") {
    return `High-quality cat food with animal protein as first ingredient
- Mix of wet and dry food for hydration and dental health
- Age-appropriate formula for ${ageCategory.replace("cat", "")} stage
- Quality brands like Royal Canin, Hill's Science Diet, or Purina Pro Plan
- Avoid: dairy, tuna as regular food, dog food, raw fish`;
  } else if (petType === "bird") {
    return `Species-appropriate commercial bird food mix as base diet
- Fresh vegetables: kale, carrots, broccoli in small amounts
- Limited fresh fruits as treats: berries, apple pieces (no seeds)
- Avian supplements as recommended by vet
- Avoid: avocado, chocolate, caffeine, high-salt or high-sugar foods`;
  } else if (petType === "rabbit") {
    return `Unlimited fresh hay (Timothy, orchard grass, etc.) as primary diet
- Limited pellets based on weight: ${Math.round(weight * 0.25)} tablespoons per day
- Fresh leafy greens: romaine, cilantro, parsley, etc.
- Limited treats: small pieces of carrot, apple, or berries
- Avoid: iceberg lettuce, potatoes, beans, seeds, nuts, corn`;
  } else if (petType === "fish") {
    return `Species-appropriate fish food (flakes, pellets, etc.)
- Variety of foods to ensure complete nutrition
- Consider live or frozen foods for certain species
- Feed small amounts multiple times rather than one large feeding
- Remove uneaten food promptly to maintain water quality`;
  } else {
    return `Research species-specific nutritional needs for your ${petType}
- Consult with exotic vet for detailed dietary recommendations
- Ensure proper balance of commercial food and fresh additions if appropriate
- Follow feeding schedules appropriate for species
- Monitor weight and adjust portions accordingly`;
  }
}

function getHydrationTips(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    return `Always provide access to fresh, clean water
- Change water at least twice daily
- Consider a pet fountain to encourage drinking
- Average requirement: 1 ounce of water per pound of body weight daily
- ${ageCategory.includes("senior") ? "Monitor intake more closely as kidney function may change with age" : "Increase water provision during hot weather or exercise"}`;
  } else if (petType === "cat") {
    return `Cats often have low thirst drive - incorporate wet food in diet
- Place multiple water bowls throughout the home
- Use wide, shallow dishes as many cats dislike their whiskers touching sides
- Consider a cat fountain as moving water attracts cats
- Add ice cubes in summer for cooling interest`;
  } else {
    return `Research specific hydration needs for your pet species
- Provide water in species-appropriate containers
- For some pets, misting or humidity may be more important than drinking water
- Monitor consumption patterns and note changes
- Clean water containers thoroughly at each change`;
  }
}

function getSupplementRecommendations(petType: string, ageCategory: string, weight: number): string {
  if (petType === "dog") {
    let supplements = `Consult with vet before starting any supplements\n- `;
    
    if (ageCategory.includes("puppy")) {
      supplements += "Generally balanced puppy food meets nutritional needs without supplements\n- Consider puppy-specific multivitamin only if recommended by vet";
    } else if (ageCategory.includes("senior")) {
      supplements += "Glucosamine/chondroitin for joint health: 20mg per pound of body weight daily\n- Omega-3 fatty acids for coat and inflammation: 20mg EPA/DHA per pound daily\n- Probiotics for digestive health\n- Possibly CoQ10 for heart health";
    } else {
      supplements += "Omega-3 fatty acids for coat and skin: 20mg EPA/DHA per pound daily\n- Probiotics if digestive issues occur\n- Multivitamin only if recommended by vet";
    }
    
    return supplements;
  } else if (petType === "cat") {
    let supplements = `Always consult with vet before adding supplements\n- `;
    
    if (ageCategory.includes("kitten")) {
      supplements += "Quality kitten food typically meets all nutritional needs\n- Supplements generally not needed unless medically indicated";
    } else if (ageCategory.includes("senior")) {
      supplements += "Omega-3 fatty acids for inflammation and coat health\n- Joint supplements with glucosamine for mobility\n- Probiotics for digestive health\n- Possibly taurine if diet is insufficient";
    } else {
      supplements += "Omega-3 fatty acids if coat appears dry or dull\n- Probiotics if digestive issues occur\n- Indoor cat vitamins if strictly indoor";
    }
    
    return supplements;
  } else {
    return `Species-specific supplements only as recommended by specialized vet
- Research accurate dosing for your pet's size and species
- Monitor for any adverse reactions when introducing supplements
- Prefer food-based nutrition over supplements when possible
- Consider professional nutritional consultation for specialized diets`;
  }
}

function getTrainingGoals(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    if (ageCategory.includes("puppy")) {
      return `House training and crate training
- Basic commands: sit, stay, come, leave it
- Leash manners and walking without pulling
- Socialization with people and other animals
- Handling and grooming acceptance`;
    } else if (ageCategory.includes("senior")) {
      return `Maintain existing trained behaviors
- Adapt commands for physical limitations
- Mental stimulation exercises to keep mind sharp
- Calm behavior and relaxation training
- Any medical alert behaviors if needed for conditions`;
    } else {
      return `Refresh and reinforce basic obedience
- Address any specific behavioral issues
- Advanced training like tricks or specialized skills
- Off-leash reliability if appropriate
- Impulse control in various environments`;
    }
  } else if (petType === "cat") {
    return `Litter box reliability
- Coming when called for safety
- Target training for handling and vet care
- Scratch post usage instead of furniture
- Carrier training for stress-free travel`;
  } else {
    return `Species-appropriate behavioral training
- Handling tolerance for health checks and care
- Simple commands relevant to species
- Trust building through positive reinforcement
- Habitat-specific behaviors like target training`;
  }
}

function getTrainingMethods(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    return `Positive reinforcement with treats, praise, and play
- Clicker training for precise marker timing
- Short sessions (${ageCategory.includes("puppy") || ageCategory.includes("senior") ? "3-5 minutes" : "10-15 minutes"}) multiple times daily
- Consistent cues and reward timing
- Environmental management to prevent unwanted behaviors`;
  } else if (petType === "cat") {
    return `Clicker training for precise marking of desired behaviors
- Very short sessions (1-3 minutes) when cat is engaged
- High-value treats like freeze-dried meat
- Never use punishment or force
- Target stick training for movement-based behaviors`;
  } else {
    return `Research species-specific training techniques
- Use positive reinforcement appropriate to species
- Keep sessions very short and positive
- Consider natural behaviors when setting expectations
- Consult with specialist trainers for exotic pets`;
  }
}

function getConsistencyTips(petType: string): string {
  if (petType === "dog") {
    return `Use same command words among all family members
- Create a written list of commands and responses for household consistency
- Maintain regular training schedule even if brief
- Follow through with requested behaviors every time
- Ensure all family members reinforce same rules`;
  } else if (petType === "cat") {
    return `Keep training cues and sessions similar each time
- Train at similar times when cat is naturally active
- Use consistent rewards that truly motivate
- Be patient and adaptable to cat's changing moods
- Create predictable environment for security`;
  } else {
    return `Establish and maintain consistent daily routines
- Use same cues and signals for requested behaviors
- Create consistent environment and habitat setup
- Regular handling in same manner if appropriate
- Predictable feeding and care schedule`;
  }
}

function getPreventativeCare(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    return `Annual wellness exams, twice yearly for ${ageCategory.includes("senior") ? "seniors" : "puppies"}
- Regular parasite prevention for fleas, ticks, heartworm
- Dental cleaning schedule as recommended by vet
- Weight management and appropriate diet
- Regular exercise appropriate for age and breed`;
  } else if (petType === "cat") {
    return `Annual wellness exams, twice yearly for ${ageCategory.includes("senior") ? "seniors" : "kittens"}
- Indoor living to prevent accidents and disease exposure
- Parasite prevention as recommended by vet
- Dental health monitoring and home care
- Weight management through diet and play`;
  } else {
    return `Species-appropriate veterinary care with exotic specialist
- Research specific preventative needs for your pet type
- Habitat maintenance and proper parameters
- Diet management for optimal health
- Regular observation for early problem detection`;
  }
}

function getVaccinationSchedule(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    if (ageCategory.includes("puppy")) {
      return `Core vaccines at 8, 12, and 16 weeks: DHPP (distemper, hepatitis, parainfluenza, parvo)
- Rabies vaccine typically at 16 weeks
- Optional vaccines based on lifestyle and risk: Bordetella, Leptospirosis, Lyme
- Follow up with 1-year boosters
- Consult vet for specific regional recommendations`;
    } else {
      return `DHPP booster every 1-3 years based on titer testing or vet recommendation
- Rabies every 1-3 years as required by law
- Optional vaccines based on risk factors and lifestyle
- Senior dogs may need adjusted protocols based on health status
- Keep vaccination records easily accessible`;
    }
  } else if (petType === "cat") {
    if (ageCategory.includes("kitten")) {
      return `Core vaccines at 8, 12, and 16 weeks: FVRCP (feline viral rhinotracheitis, calicivirus, panleukopenia)
- Rabies typically at 16 weeks
- FeLV (feline leukemia) recommended for outdoor or multi-cat homes
- Follow up with 1-year boosters
- Indoor-only status may affect recommended schedule`;
    } else {
      return `FVRCP booster every 1-3 years based on risk factors
- Rabies every 1-3 years as required by law
- FeLV for outdoor cats or multi-cat households
- Senior cats may need adjusted protocols based on health
- Discuss indoor-only vaccination protocols with vet`;
    }
  } else {
    return `Research species-specific vaccination needs
- Consult with a veterinarian specializing in your pet type
- Some exotic pets may not need traditional vaccines
- Keep detailed health records
- Stay informed about emerging disease risks for your species`;
  }
}

function getDentalCare(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    return `Daily tooth brushing with dog-safe toothpaste
- Dental chews or toys appropriate for size and chewing style
- Regular inspection of teeth and gums
- Professional cleaning as recommended by vet (typically yearly)
- Address any signs of dental disease immediately`;
  } else if (petType === "cat") {
    return `Brush teeth with cat toothpaste 2-3 times weekly if tolerated
- Dental treats formulated for tartar reduction
- Dental diet option if recommended by vet
- Regular inspection of teeth and gums for problems
- Professional cleaning when recommended under anesthesia`;
  } else {
    return `Research species-specific dental needs
- Some species require specific items to wear down teeth naturally
- Monitor for overgrowth in species with continuously growing teeth
- Watch eating habits for signs of dental pain
- Consult exotic vet for appropriate dental care`;
  }
}

function getExerciseRecommendations(petType: string, ageCategory: string, weight: number, activityLevel: string): string {
  if (petType === "dog") {
    let baseTime = 30;
    if (activityLevel === "Low") baseTime = 20;
    if (activityLevel === "High") baseTime = 45;
    if (activityLevel === "Very High") baseTime = 60;
    
    if (ageCategory.includes("puppy")) {
      return `Follow the 5-minute rule: 5 minutes per month of age, twice daily
- Focus on mental stimulation alongside physical exercise
- Avoid high-impact activities until growth plates close
- Include socialization as part of exercise routine
- Allow plenty of rest between activity sessions`;
    } else if (ageCategory.includes("senior")) {
      return `${Math.round(baseTime * 0.7)} minutes of gentle exercise daily, divided into multiple sessions
- Low-impact activities like leisurely walks
- Swimming if available and enjoyed
- Mental stimulation to keep mind active
- Monitor for signs of discomfort or fatigue`;
    } else {
      return `${baseTime}-${baseTime + 15} minutes of active exercise daily
- Mix of walks, play, and training activities
- Include mental challenges alongside physical exercise
- Weekend longer adventures if appropriate
- Adjust based on weather conditions and health status`;
    }
  } else if (petType === "cat") {
    return `Interactive play sessions 2-3 times daily, 10-15 minutes each
- Provide climbing opportunities with cat trees
- Rotate toys to maintain interest
- Use food puzzles for mental stimulation
- Create vertical space for natural climbing and jumping`;
  } else {
    return `Research species-appropriate exercise needs
- Provide enrichment that encourages natural movement patterns
- Ensure habitat is large enough for proper exercise
- Supervised out-of-habitat time if appropriate and safe
- Create opportunities for natural behaviors`;
  }
}

function getMentalStimulation(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    return `Puzzle toys with hidden treats or food
- Scent work games to engage natural sniffing instincts
- Training new tricks and commands
- Rotating toys to prevent boredom
- Social interactions with other dogs if sociable`;
  } else if (petType === "cat") {
    return `Food puzzles to engage hunting instincts
- Bird watching stations near windows
- New toys rotated weekly to maintain interest
- Clicker training for mental engagement
- Exploration of new safe spaces or objects`;
  } else {
    return `Species-appropriate enrichment activities
- Novel objects and textures to explore
- Food-based puzzles if appropriate
- Changes in habitat layout or features
- Training appropriate to species capabilities`;
  }
}

function getWeatherConsiderations(petType: string): string {
  if (petType === "dog") {
    return `Hot weather: Exercise during cooler parts of day, check pavement temperature
- Cold weather: Consider coat type for duration, possible boots and coat
- Rain: Shorter walks, dry thoroughly after
- Snow: Check for ice balls in paw pads, watch for salt on roads
- Always provide adequate water after exercise`;
  } else if (petType === "cat") {
    return `Indoor cats: Ensure home temperature remains comfortable year-round
- Outdoor access cats: Provide sheltered options in extreme weather
- Create sunny resting spots in winter and cool retreats in summer
- Monitor outdoor time during extreme temperatures
- Ensure water doesn't freeze in winter if outside`;
  } else {
    return `Maintain appropriate habitat temperature for species
- Monitor humidity requirements carefully
- Adjust lighting schedules as needed seasonally
- Protect habitat from drafts or direct sun
- Have backup plans for power outages`;
  }
}

function getBathingAndCoatCare(petType: string, breed: string): string {
  if (petType === "dog") {
    const breedLC = breed.toLowerCase();
    if (breedLC.includes("poodle") || breedLC.includes("bichon") || breedLC.includes("shih tzu")) {
      return `Professional grooming every 4-6 weeks for haircuts
- Brushing 3-4 times weekly to prevent mats
- Bathing every 3-4 weeks with dog-safe shampoo
- Regular ear cleaning due to hair growth in ear canal
- Special attention to facial hair cleaning daily`;
    } else if (breedLC.includes("retriever") || breedLC.includes("shepherd") || breedLC.includes("husky")) {
      return `Seasonal heavy shedding requires daily brushing during shed
- Bathing every 6-8 weeks or when dirty
- Undercoat rake during shedding seasons
- Regular brushing 1-2 times weekly between seasons
- Consider professional grooming quarterly`;
    } else if (breedLC.includes("bulldog") || breedLC.includes("pug") || breedLC.includes("boxer")) {
      return `Regular cleaning of skin folds with vet-recommended wipes
- Bathing every 4-6 weeks with gentle dog shampoo
- Pay special attention to facial wrinkles and tail pocket if applicable
- Quick-drying is essential to prevent skin issues
- Weekly coat wipe down with pet-safe wipes`;
    } else {
      return `Bathing every 4-8 weeks depending on activity level
- Brushing 1-3 times weekly based on coat type
- Use appropriate dog-safe shampoo and conditioner
- Check for skin issues during grooming sessions
- Consider professional grooming if needed`;
    }
  } else if (petType === "cat") {
    const breedLC = breed.toLowerCase();
    if (breedLC.includes("persian") || breedLC.includes("himalayan") || breedLC.includes("maine coon")) {
      return `Daily gentle brushing to prevent mats and hairballs
- Professional grooming every 6-8 weeks if coat management is difficult
- Occasional bathing (every 2-3 months) with cat-safe shampoo
- Special attention to areas prone to matting (behind ears, armpits)
- Check for debris caught in long coat daily`;
    } else {
      return `Weekly brushing to remove loose hair and reduce hairballs
- Cats typically self-groom effectively
- Bathing rarely needed unless specific situation requires it
- Provide opportunities for natural grooming behaviors
- Monitor for excessive grooming that could indicate skin issues`;
    }
  } else {
    return `Research species-specific grooming requirements
- Consult specialist for rare or exotic pets
- Some species require specific humidity or bathing protocols
- Habitat cleanliness contributes to coat health
- Monitor for any changes in appearance that could indicate health issues`;
  }
}

function getNailAndPawCare(petType: string): string {
  if (petType === "dog") {
    return `Trim nails every 3-4 weeks or as needed
- Check between paw pads for debris after walks
- Trim fur between pads if overgrown
- Consider paw balm for dry or cracked pads
- Monitor for signs of allergies affecting paws`;
  } else if (petType === "cat") {
    return `Provide appropriate scratching surfaces for natural nail maintenance
- Trim tips of nails every 2-3 weeks if cat allows
- Monitor for any limping or excessive licking of paws
- Check between toes for debris or matted fur
- Consider soft nail caps if scratching is a problem`;
  } else {
    return `Research appropriate nail or claw care for your species
- Some pets require specific surfaces for natural wear
- Monitor growth patterns for abnormalities
- Consider professional help for first nail trimming lesson
- Establish regular schedule based on growth rate`;
  }
}

function getEarAndEyeCare(petType: string): string {
  if (petType === "dog") {
    return `Check ears weekly for redness, odor, or discharge
- Clean with vet-recommended solution as needed
- Dogs with floppy ears need more frequent checks
- Wipe eye area with damp cloth to remove discharge
- Watch for excessive tearing or redness`;
  } else if (petType === "cat") {
    return `Check ears monthly for cleanliness and signs of mites
- Minimal cleaning usually needed for most cats
- Wipe eye area with soft damp cloth if discharge present
- Persian and similar breeds need daily eye wiping
- Monitor for squinting or eye changes`;
  } else {
    return `Research species-specific ear and eye care
- Some species should never have ears cleaned internally
- Monitor for changes in appearance or behavior
- Keep habitat clean to prevent eye irritants
- Consult exotic pet specialist for proper techniques`;
  }
}

function getPetToPetSocialization(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    if (ageCategory.includes("puppy")) {
      return `Controlled puppy play dates with vaccinated dogs
- Puppy socialization classes with professional oversight
- Positive exposure to different sizes, breeds, and play styles
- Monitor for appropriate play and intervene if needed
- Focus on quality interactions, not quantity`;
    } else {
      return `Regular playdates with compatible dogs if enjoyed
- Learn to read your dog's body language during interactions
- Respect if your dog prefers certain dogs or play styles
- Don't force interaction if signs of stress are present
- Create positive associations with other animals`;
    }
  } else if (petType === "cat") {
    return `Early socialization for kittens (2-7 weeks) is most effective
- Slow, controlled introductions to resident pets
- Provide separate resources (food, water, litter) for each cat
- Allow for vertical space to create territory options
- Some cats prefer being only pets - respect preferences`;
  } else {
    return `Research whether your species is naturally social or solitary
- Introduce same-species companions carefully if appropriate
- Monitor for stress or aggression during introductions
- Provide multiple resources if housing together
- Some species should never be housed with others`;
  }
}

function getHumanSocialization(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    return `Expose to different people: varying ages, genders, appearances
- Practice calm greetings with visitors
- Teach appropriate behaviors around children
- Create positive associations with handling and contact
- Allow choice in social interactions when possible`;
  } else if (petType === "cat") {
    return `Respect cat's choice in seeking interaction
- Provide positive experiences with different people
- Use treats and play to create positive associations
- Never force handling or petting
- Create safe spaces where cat won't be disturbed`;
  } else {
    return `Research handling recommendations for your species
- Introduce to handling gradually with positive reinforcement
- Consider normal social structures for your species
- Some species may never enjoy extensive handling
- Focus on creating trust and positive associations`;
  }
}

function getEnvironmentalExposure(petType: string, ageCategory: string): string {
  if (petType === "dog") {
    if (ageCategory.includes("puppy")) {
      return `Critical socialization period (before 16 weeks): expose to many environments
- Urban areas with different sounds, sights, surfaces
- Rural settings with natural elements
- Various vehicles, noises, and experiences
- Always make exposures positive with treats and praise`;
    } else {
      return `Continue exposure to various environments throughout life
- Visit different locations: parks, pet stores, outdoor cafes
- Experience different weather and ground surfaces
- Create positive associations with new experiences
- Monitor for stress and adjust exposure accordingly`;
    }
  } else if (petType === "cat") {
    return `Indoor enrichment to satisfy environmental needs safely
- Secure outdoor experiences: harness walks, catios, secure windows
- New textures, sounds, and toys rotated regularly
- Visual stimulation through windows or videos
- Respect if cat is fearful of certain environments`;
  } else {
    return `Research natural habitat of your species for enrichment ideas
- Create species-appropriate environmental variation
- Consider safe, supervised exploration outside habitat if appropriate
- Introduce new elements gradually to prevent stress
- Monitor for signs of comfort or discomfort with changes`;
  }
}

