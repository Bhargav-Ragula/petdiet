
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
      // Create a system prompt based on the plan type
      const systemPrompt = getSystemPrompt(planType);
      
      const userPrompt = `Create a ${planType} plan for a ${age} year old ${breed} ${petType} that weighs ${weight} pounds with ${activityLevel} activity level. ${notes ? `Additional notes: ${notes}.` : ''}`;

      console.log(`Generating ${planType} plan for ${breed} ${petType}`);

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
        const fallbackPlan = generateFallbackPlan(planType, petType, breed, age, weight, activityLevel, notes);
        
        return new Response(
          JSON.stringify({ 
            carePlan: fallbackPlan,
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
      console.error(`Error in ${planType} plan generation:`, error);
      // Generate a fallback response
      const fallbackPlan = generateFallbackPlan(planType, petType, breed, age, weight, activityLevel, notes);
      
      return new Response(
        JSON.stringify({ 
          carePlan: fallbackPlan,
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

// Get system prompt based on plan type
function getSystemPrompt(planType: string): string {
  const prompts: Record<string, string> = {
    nutrition: `You are a professional pet nutritionist. Create a detailed, personalized diet plan for pets based on the information provided. Include daily feeding schedules, portion sizes, recommended foods, and any supplements if needed. Format your response with clear sections using markdown.`,
    
    training: `You are a certified pet trainer. Create a personalized training plan for the pet described. Include basic commands, behavior correction techniques, and advanced tricks appropriate for their age and breed. Provide a weekly schedule and clear instructions. Format your response with clear sections using markdown.`,
    
    health: `You are a veterinary health specialist. Create a comprehensive healthcare plan for the pet described. Include preventative care, vaccination schedules, common health issues for this breed, and wellness check recommendations. Format your response with clear sections using markdown.`,
    
    activities: `You are a pet activities and exercise expert. Create a personalized exercise and enrichment plan for the pet described. Include daily exercise recommendations, playtime ideas, mental stimulation activities, and ways to keep the pet engaged. Format your response with clear sections using markdown.`,
    
    grooming: `You are a professional pet groomer. Create a detailed grooming plan for the pet described. Include bathing frequency, coat care, nail trimming, ear cleaning, dental care, and any breed-specific grooming needs. Format your response with clear sections using markdown.`,
    
    social: `You are a pet behavior and socialization expert. Create a detailed socialization plan for the pet described. Include recommendations for interactions with other animals, people, and new environments. Address common social challenges and provide techniques for positive socialization experiences. Format your response with clear sections using markdown.`
  };
  
  return prompts[planType] || `You are a certified pet care professional. Create a comprehensive care plan for the pet described, focusing on ${planType}. Format your response with clear sections using markdown.`;
}

// Fallback plan generator function
function generateFallbackPlan(planType: string, petType: string, breed: string, age: string, weight: string, activityLevel: string, notes?: string): string {
  const petTypeLC = petType.toLowerCase();
  const ageNum = parseInt(age) || 1;
  const weightNum = parseInt(weight) || 10;
  const petSize = getPetSize(petTypeLC, weightNum);
  
  // Select template based on plan type
  switch (planType) {
    case "nutrition":
      return generateNutritionPlan(petTypeLC, breed, ageNum, weightNum, activityLevel, notes);
    case "training":
      return generateTrainingPlan(petTypeLC, breed, ageNum, activityLevel, notes);
    case "health":
      return generateHealthPlan(petTypeLC, breed, ageNum, weightNum, notes);
    case "activities":
      return generateActivitiesPlan(petTypeLC, breed, ageNum, activityLevel, notes);
    case "grooming":
      return generateGroomingPlan(petTypeLC, breed, ageNum, notes);
    case "social":
      return generateSocializationPlan(petTypeLC, breed, ageNum, notes);
    default:
      return generateGenericPlan(planType, petTypeLC, breed, ageNum, weightNum, activityLevel, notes);
  }
}

function getPetSize(petType: string, weight: number): string {
  if (petType === "dog") {
    if (weight < 10) return "small";
    if (weight < 30) return "medium";
    if (weight < 70) return "large";
    return "extra large";
  }
  
  if (petType === "cat") {
    if (weight < 5) return "small";
    if (weight < 10) return "medium";
    if (weight < 15) return "large";
    return "extra large";
  }
  
  return "medium"; // default for other pets
}

function generateNutritionPlan(petType: string, breed: string, age: number, weight: number, activityLevel: string, notes?: string): string {
  if (petType === "dog") {
    return `# Nutrition Plan for ${breed} Dog (${age} years, ${weight} lbs)

## Daily Feeding Schedule
- **Morning (7-9 AM):** Main meal - ${Math.round(weight * 0.15)} oz of high-quality dog food
- **Evening (5-7 PM):** Second meal - ${Math.round(weight * 0.15)} oz of high-quality dog food

## Recommended Foods
- Premium kibble appropriate for ${age < 2 ? "puppies" : age > 7 ? "senior dogs" : "adult dogs"}
- Lean protein sources (chicken, turkey, fish)
- Vegetables (carrots, green beans, sweet potatoes)
- Healthy fats (fish oil supplement)

## Hydration
- Always provide access to fresh, clean water
- Change water at least twice daily

## Portion Guidelines
- Base portion: ${Math.round(weight * 0.3)} oz daily total (adjust based on activity)
- ${activityLevel === "High" || activityLevel === "Very High" ? "Increase portions by 15-20% for your dog's high activity level" : activityLevel === "Low" ? "Decrease portions by 10-15% for your dog's lower activity level" : "Standard portions appropriate for moderate activity"}

## Considerations
- Monitor weight and adjust portions accordingly
- Split food into at least two meals per day
- ${notes ? `Note your dog's special considerations: ${notes}` : "No specific dietary restrictions noted"}`;
  } 
  else if (petType === "cat") {
    return `# Nutrition Plan for ${breed} Cat (${age} years, ${weight} lbs)

## Daily Feeding Schedule
- **Morning (7-9 AM):** First meal - ${Math.round(weight * 0.1)} oz of high-quality cat food
- **Evening (5-7 PM):** Second meal - ${Math.round(weight * 0.1)} oz of high-quality cat food
- Optional small portion at midday for younger or more active cats

## Recommended Foods
- Premium wet cat food (higher moisture content)
- High-quality dry food as a supplement
- Occasional plain cooked chicken or fish as treats

## Hydration
- Always provide access to fresh, clean water
- Consider a cat water fountain to encourage drinking

## Portion Guidelines
- Base portion: ${Math.round(weight * 0.2)} oz daily total
- ${activityLevel === "High" || activityLevel === "Very High" ? "Increase portions by 10-15% for your cat's high activity level" : activityLevel === "Low" ? "Decrease portions by 10% for your cat's lower activity level" : "Standard portions appropriate for moderate activity"}

## Considerations
- Cats prefer multiple small meals throughout the day
- Monitor weight closely and adjust food accordingly
- ${notes ? `Note your cat's special considerations: ${notes}` : "No specific dietary restrictions noted"}`;
  }
  else {
    return `# Nutrition Plan for ${breed} ${petType} (${age} years, ${weight} lbs)

## General Guidelines
- Research specific nutritional needs for your particular ${petType}
- Consult with a veterinarian specialized in exotic or small pets
- Provide a balanced diet appropriate for your pet's species

## Considerations
- Activity level: ${activityLevel}
- Age: ${age} years
- Weight: ${weight} lbs
- ${notes ? `Special considerations: ${notes}` : "No specific dietary restrictions noted"}

## Feeding Schedule
Establish a consistent feeding schedule appropriate for your ${petType}'s needs.

## Hydration
Always ensure access to fresh, clean water appropriate for your pet's species.

## Important Note
This is a generic guideline. Please consult with a veterinarian who specializes in your specific type of pet for a more detailed and appropriate diet plan.`;
  }
}

function generateTrainingPlan(petType: string, breed: string, age: number, activityLevel: string, notes?: string): string {
  if (petType === "dog") {
    return `# Training Plan for ${breed} Dog (${age} years)

## Basic Commands to Master
- **Sit:** Foundation command for all other training
- **Stay:** Important for safety and control
- **Come:** Critical recall command for safety
- **Down:** Useful for settling your dog
- **Leave it:** Helps prevent ingesting harmful items

## Weekly Schedule
- **Monday:** 10-15 minutes on basic commands
- **Wednesday:** 10-15 minutes on leash training
- **Friday:** 10-15 minutes on new tricks
- **Weekend:** Practice in different environments

## Training Techniques
- Positive reinforcement with treats and praise
- Short, frequent sessions (5-15 minutes)
- Consistency in commands and expectations
- Age-appropriate expectations (${age < 1 ? "puppy basics" : age < 3 ? "intermediate skills" : "advanced training as appropriate"})

## Behavior Considerations
- ${activityLevel === "High" || activityLevel === "Very High" ? "Channel high energy with plenty of exercise before training sessions" : activityLevel === "Low" ? "Keep training sessions engaging but brief to maintain interest" : "Balance training with appropriate exercise"}
- Focus on consistency and patience
- ${age > 7 ? "Adjust expectations for senior dog capabilities and comfort" : ""}

## Advanced Skills (Once Basics Are Mastered)
- Heel command for controlled walking
- Place/bed command for settling in specific locations
- Advanced tricks based on dog's abilities and interests

${notes ? `## Special Considerations\n${notes}` : ""}`;
  } 
  else if (petType === "cat") {
    return `# Training Plan for ${breed} Cat (${age} years)

## Trainable Behaviors
- Litter box use (reinforcement of proper habits)
- Coming when called (name recognition)
- Target training with a wand or finger
- Simple tricks like sitting or high five
- Crate or carrier training

## Approach to Cat Training
- Very short sessions (2-5 minutes maximum)
- High-value treats as rewards (small pieces)
- Clicker training can be highly effective
- Always end on a positive note

## Weekly Schedule
- **Daily:** 2-3 minutes of clicker/target training
- **2-3 times weekly:** Practice name recognition and recall
- **Weekly:** Carrier/crate familiarization

## Environmental Considerations
- Train in quiet, distraction-free environments
- Respect the cat's mood and willingness to participate
- Never force training when the cat is uninterested

## Behavior Management
- Redirect unwanted behaviors to appropriate alternatives
- Provide adequate scratching posts and toys
- Use environmental modifications rather than punishment

${notes ? `## Special Considerations\n${notes}` : ""}`;
  }
  else {
    return `# Training Plan for ${breed} ${petType} (${age} years)

## General Guidelines
- Research specific training approaches for your particular ${petType}
- Consult with a specialist in ${petType} behavior
- Use species-appropriate positive reinforcement techniques

## Considerations
- Respect your pet's natural behavior patterns
- Keep training sessions short and positive
- Be consistent with commands and expectations

## Basic Training Goals
- Create a list of simple behaviors appropriate for your ${petType}
- Focus on safety-related training first
- Build positive associations with handling

## Resources
- Find books or videos specific to ${petType} training
- Consider joining online communities of ${petType} owners

${notes ? `## Special Considerations\n${notes}` : ""}

## Important Note
This is a generic guideline. Please consult with a specialist who focuses on your specific type of pet for appropriate training techniques.`;
  }
}

function generateHealthPlan(petType: string, breed: string, age: number, weight: number, notes?: string): string {
  if (petType === "dog") {
    return `# Health Care Plan for ${breed} Dog (${age} years, ${weight} lbs)

## Veterinary Visit Schedule
- **Annual wellness exam:** Complete physical examination
- **Vaccinations:** Rabies, DHPP, Bordetella as recommended by your vet
- **Parasite prevention:** Monthly heartworm, flea, and tick preventatives
- **Dental check:** Annual dental examination, professional cleaning as needed

## Home Health Monitoring
- **Weekly:** Check ears, eyes, teeth, and coat condition
- **Monthly:** Check weight and body condition
- **Ongoing:** Monitor food and water intake, energy levels, and bathroom habits

## Preventative Care
- Dental care: Daily tooth brushing with dog-safe toothpaste
- Regular grooming and coat care
- Nail trimming every 3-4 weeks
- ${age > 7 ? "Senior blood work panel annually" : "Baseline blood work during annual exam"}

## Common Health Concerns for ${breed} Dogs
- Research breed-specific health issues and discuss with your veterinarian
- Watch for signs of joint issues, especially in larger breeds
- Monitor for allergies and skin conditions

## Emergency Preparedness
- Keep first aid supplies on hand
- Save emergency vet contact information
- Know the location of the nearest 24-hour veterinary hospital

${notes ? `## Special Considerations\n${notes}` : ""}`;
  } 
  else if (petType === "cat") {
    return `# Health Care Plan for ${breed} Cat (${age} years, ${weight} lbs)

## Veterinary Visit Schedule
- **Annual wellness exam:** Complete physical examination
- **Vaccinations:** Rabies, FVRCP as recommended by your vet
- **Parasite prevention:** Monthly flea preventative, deworming as needed
- **Dental check:** Annual dental examination, professional cleaning as needed

## Home Health Monitoring
- **Weekly:** Check ears, eyes, teeth, and coat condition
- **Monthly:** Check weight and body condition
- **Ongoing:** Monitor litter box habits, food and water intake, energy levels

## Preventative Care
- Regular brushing to reduce hairballs
- Dental care options (dental treats, water additives)
- Provide opportunities for exercise and mental stimulation
- ${age > 10 ? "Senior blood work panel annually" : "Baseline blood work during annual exam"}

## Common Health Concerns for Cats
- Watch for signs of urinary tract issues (straining in litter box, frequent urination)
- Monitor dental health and eating habits
- Check for weight changes that might indicate health problems

## Emergency Preparedness
- Keep cat carrier easily accessible
- Save emergency vet contact information
- Know the location of the nearest 24-hour veterinary hospital

${notes ? `## Special Considerations\n${notes}` : ""}`;
  }
  else {
    return `# Health Care Plan for ${breed} ${petType} (${age} years, ${weight} lbs)

## General Guidelines
- Research specific health needs for your particular ${petType}
- Find a veterinarian experienced with ${petType}s or exotic pets
- Establish a baseline of normal behavior and appearance

## Preventative Care
- Schedule appropriate veterinary check-ups
- Maintain proper habitat and environmental conditions
- Provide species-appropriate nutrition

## Health Monitoring
- Document your pet's normal appearance and behaviors
- Monitor weight regularly
- Watch for changes in eating, activity, or waste production

## Resources
- Connect with reputable ${petType} health resources online
- Consider joining groups dedicated to ${petType} care

${notes ? `## Special Considerations\n${notes}` : ""}

## Important Note
This is a generic guideline. Please consult with a veterinarian who specializes in your specific type of pet for a more detailed and appropriate health care plan.`;
  }
}

function generateActivitiesPlan(petType: string, breed: string, age: number, activityLevel: string, notes?: string): string {
  if (petType === "dog") {
    return `# Activities Plan for ${breed} Dog (${age} years)

## Daily Exercise Needs
- **Morning:** ${activityLevel === "High" || activityLevel === "Very High" ? "30-45 minute walk or jog" : "15-20 minute walk"}
- **Evening:** ${activityLevel === "High" || activityLevel === "Very High" ? "30 minute play session or second walk" : "15 minute play session"}
- **Throughout day:** Short play breaks and mental stimulation activities

## Weekly Activity Schedule
- **Monday, Wednesday, Friday:** Longer walks or hikes
- **Tuesday, Thursday:** Focus on training and mental games
- **Weekend:** New locations, dog park visits, or special activities

## Enrichment Ideas
- Puzzle toys and food dispensers
- Scent games and nose work
- Training new tricks
- Rotating toy selection to maintain interest

## Social Activities
- Supervised playdates with compatible dogs
- Dog park visits if appropriate for your dog's temperament
- Family play sessions and bonding time

## Age and Breed Considerations
- ${age < 2 ? "Puppy energy needs outlets, but avoid excessive jumping or high-impact activities until fully grown" : age > 7 ? "Senior dog activities focused on low-impact exercise and mental stimulation" : "Adult dog with fully developed joints can engage in more varied activities"}
- ${breed}-specific activities that align with breed tendencies and strengths

${notes ? `## Special Considerations\n${notes}` : ""}`;
  } 
  else if (petType === "cat") {
    return `# Activities Plan for ${breed} Cat (${age} years)

## Daily Play Sessions
- **Morning:** 5-10 minutes of interactive play
- **Evening:** 10-15 minutes of active play before feeding
- **Throughout day:** Access to self-play toys and climbing opportunities

## Environmental Enrichment
- Window perches for bird and outdoor watching
- Cat trees and vertical spaces for climbing
- Rotating toy selection to prevent boredom
- Scratching posts of different materials and orientations

## Mental Stimulation
- Puzzle feeders and food dispensing toys
- Hiding treats for "hunting" activities
- Training sessions for clicker training or simple tricks
- New objects or boxes to explore periodically

## Interactive Play Ideas
- Wand toys that mimic prey movement
- Laser pointers (used responsibly with a physical reward at the end)
- Fetch games for retrieving-oriented cats
- Catnip toys for cats who respond to catnip

## Activity Considerations
- ${age < 2 ? "Kitten energy needs multiple play sessions throughout the day" : age > 10 ? "Senior cat activities focused on gentle movement and mental engagement" : "Adult cat with established preferences and activity patterns"}
- ${activityLevel === "High" || activityLevel === "Very High" ? "High energy cat needs more frequent play sessions and challenging activities" : activityLevel === "Low" ? "Low energy cat may prefer shorter, less intense play periods" : "Moderate energy cat benefits from regular play sessions"}

${notes ? `## Special Considerations\n${notes}` : ""}`;
  }
  else {
    return `# Activities Plan for ${breed} ${petType} (${age} years)

## General Guidelines
- Research specific activity needs for your particular ${petType}
- Provide species-appropriate environmental enrichment
- Balance activity with appropriate rest periods

## Activity Recommendations
- Create a safe space for exploration and exercise
- Rotate toys and enrichment items to maintain interest
- Consider natural behaviors when selecting activities

## Environmental Enrichment
- Provide hiding places and exploration opportunities
- Include a variety of textures and surfaces
- Consider natural foraging behaviors in activity planning

## Schedule Considerations
- Observe your pet's natural active periods
- Provide enrichment aligned with natural behaviors
- Ensure adequate rest opportunities

${notes ? `## Special Considerations\n${notes}` : ""}

## Important Note
This is a generic guideline. Please research the specific activity needs of your ${petType} for more appropriate recommendations.`;
  }
}

function generateGroomingPlan(petType: string, breed: string, age: number, notes?: string): string {
  if (petType === "dog") {
    return `# Grooming Plan for ${breed} Dog (${age} years)

## Brushing Schedule
- **Short coat:** 1-2 times weekly
- **Medium coat:** 2-3 times weekly
- **Long coat:** Daily
- **Double coat:** 3-4 times weekly, more during seasonal shedding

## Bathing Schedule
- Every 4-6 weeks with dog-specific shampoo
- Adjust based on activity level and coat type
- Always dry completely, especially in skin folds if present

## Nail Care
- Trim every 3-4 weeks
- Watch for signs of too-long nails (clicking on floor)
- Use appropriate dog nail trimmers or grinder

## Ear Care
- Check weekly for dirt, redness, or odor
- Clean as needed with veterinarian-approved cleaner
- Never insert anything into the ear canal

## Dental Care
- Daily tooth brushing with dog-safe toothpaste
- Dental chews or toys as supplements, not replacements
- Watch for signs of dental issues (bad breath, difficulty eating)

## Additional Care
- Eye area: Wipe gently with damp cloth as needed
- Paw pads: Check for cracks or foreign objects regularly
- Coat: Check for parasites, mats, or skin issues during grooming

${notes ? `## Special Considerations\n${notes}` : ""}`;
  } 
  else if (petType === "cat") {
    return `# Grooming Plan for ${breed} Cat (${age} years)

## Brushing Schedule
- **Short coat:** 1 time weekly
- **Medium coat:** 2-3 times weekly
- **Long coat:** Daily
- **All cats:** More frequent during shedding seasons

## Bathing Considerations
- Most cats rarely need baths
- If necessary, use cat-specific shampoo
- Consider professional grooming for difficult cases

## Nail Care
- Trim every 2-3 weeks
- Use cat-specific nail trimmers
- Introduce gradually with positive reinforcement

## Ear Care
- Check weekly for dirt, redness, or odor
- Clean outer ear only, if needed, with veterinarian-approved cleaner
- Never insert anything into the ear canal

## Dental Care
- Brush teeth with cat-safe toothpaste if tolerated
- Dental treats or toys as supplements
- Annual dental check at veterinary visits

## Additional Care
- Eye area: Wipe gently with damp cloth if discharge present
- Hairball prevention: Regular brushing, specialized food or treats if needed
- Coat: Check for parasites or skin issues during grooming

${notes ? `## Special Considerations\n${notes}` : ""}`;
  }
  else {
    return `# Grooming Plan for ${breed} ${petType} (${age} years)

## General Guidelines
- Research specific grooming needs for your particular ${petType}
- Introduce grooming gradually with positive associations
- Observe for any signs of stress during grooming

## Basic Care Recommendations
- Determine appropriate bathing requirements, if any
- Research appropriate nail or claw maintenance
- Learn about coat care specific to your pet's species

## Health Monitoring During Grooming
- Use grooming time to check for any abnormalities
- Monitor skin condition and coat quality
- Document any concerns to discuss with a veterinarian

## Schedule Considerations
- Establish a regular grooming routine
- Keep sessions short and positive, especially initially
- Consider professional help for specialized needs

${notes ? `## Special Considerations\n${notes}` : ""}

## Important Note
This is a generic guideline. Please research the specific grooming needs of your ${petType} for more appropriate recommendations.`;
  }
}

function generateSocializationPlan(petType: string, breed: string, age: number, notes?: string): string {
  if (petType === "dog") {
    return `# Socialization Plan for ${breed} Dog (${age} years)

## People Socialization
- Introduce to different types of people (varied ages, appearances, etc.)
- Practice calm greetings and appropriate behavior
- Teach boundary respect with new people

## Dog Socialization
- Organized playdates with known, compatible dogs
- Structured on-leash greetings during walks
- Supervised dog park visits if appropriate for temperament

## Environmental Socialization
- Weekly exposure to new environments
- Practice with different surfaces, sounds, and situations
- Gradually increase environmental challenges

## Training for Social Settings
- Practice basic commands in increasingly distracting environments
- Teach "leave it" and "focus" for managing social situations
- Reward calm behavior around new stimuli

## Age Considerations
- ${age < 1 ? "Critical socialization period - focus on positive experiences with many new stimuli" : age < 3 ? "Young adult refinement - work on social manners and reliability" : age > 7 ? "Senior socialization - focus on maintaining positive associations and managing any emerging sensitivities" : "Adult socialization - maintain social skills and continue exposing to new experiences"}

${notes ? `## Special Considerations\n${notes}` : ""}`;
  } 
  else if (petType === "cat") {
    return `# Socialization Plan for ${breed} Cat (${age} years)

## People Socialization
- Positive interactions with household members daily
- Gradual introduction to visitors
- Respect for the cat's choice to engage or retreat

## Pet Socialization
- If applicable, careful introduction to other household pets
- Allow safe spaces for retreat during interactions
- Never force interactions with other animals

## Environmental Socialization
- Provide safe exploration opportunities within the home
- Introduce new objects gradually
- Consider carrier training for veterinary visits

## Building Confidence
- Use treats and play to create positive associations
- Allow hiding places throughout the home
- Respect individual personality and preferences

## Age Considerations
- ${age < 1 ? "Kitten socialization period - gentle exposure to many positive experiences" : age < 3 ? "Young adult - continue building positive associations" : age > 10 ? "Senior cat - focus on maintaining comfort with familiar people and situations" : "Adult cat - maintain socialization with respect for established preferences"}

${notes ? `## Special Considerations\n${notes}` : ""}`;
  }
  else {
    return `# Socialization Plan for ${breed} ${petType} (${age} years)

## General Guidelines
- Research specific social needs for your particular ${petType}
- Understand species-appropriate social behaviors
- Respect natural tendencies toward or away from socialization

## Handling and Interaction
- Establish positive associations with gentle handling
- Learn proper handling techniques for your specific pet
- Introduce new people gradually if appropriate

## Environmental Comfort
- Create a secure home environment
- Provide appropriate hiding and observation spaces
- Consider natural habitat preferences in setup

## Stress Reduction
- Learn to recognize signs of stress in your pet
- Provide appropriate retreat options
- Never force interactions

${notes ? `## Special Considerations\n${notes}` : ""}

## Important Note
This is a generic guideline. Please research the specific socialization needs of your ${petType} for more appropriate recommendations.`;
  }
}

function generateGenericPlan(planType: string, petType: string, breed: string, age: number, weight: number, activityLevel: string, notes?: string): string {
  return `# ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan for ${breed} ${petType} (${age} years, ${weight} lbs)

## General Guidelines
- Research specific ${planType} needs for your particular ${petType}
- Consult with a professional specialized in ${petType} care
- Develop a routine appropriate for your pet's age and health status

## Key Considerations
- Activity level: ${activityLevel}
- Age: ${age} years
- Weight: ${weight} lbs
- ${notes ? `Special notes: ${notes}` : "No specific considerations noted"}

## Recommended Schedule
Create a regular schedule that works for both you and your pet.

## Professional Consultation
Consider consulting with a professional who specializes in ${petType} ${planType} for more tailored advice.

## Important Note
This is a generic guideline. Please research the specific ${planType} needs of your ${petType} for more appropriate recommendations.`;
}
