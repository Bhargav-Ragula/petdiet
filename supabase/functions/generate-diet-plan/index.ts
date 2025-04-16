
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
      const systemPrompt = `You are a professional pet nutritionist. Create a detailed, personalized diet plan for pets based on the information provided. Include daily feeding schedules, portion sizes, recommended foods, and any supplements if needed. Format your response with clear sections.`;
      
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

// Fallback diet plan generator function
function generateFallbackDietPlan(petType: string, breed: string, age: string, weight: string, activityLevel: string, dietaryRestrictions?: string): string {
  const petTypeLC = petType.toLowerCase();
  const ageNum = parseInt(age) || 1;
  const weightNum = parseInt(weight) || 10;
  
  // Basic diet plans by pet type
  let dietPlan = "";
  
  if (petTypeLC === "dog") {
    dietPlan = `# Diet Plan for ${breed} Dog (${age} years, ${weight} lbs)

## Daily Feeding Schedule
- **Morning (7-9 AM):** Main meal - ${Math.round(weightNum * 0.15)} oz of high-quality dog food
- **Evening (5-7 PM):** Second meal - ${Math.round(weightNum * 0.15)} oz of high-quality dog food

## Recommended Foods
- Premium kibble appropriate for ${ageNum < 2 ? "puppies" : ageNum > 7 ? "senior dogs" : "adult dogs"}
- Lean protein sources (chicken, turkey, fish)
- Vegetables (carrots, green beans, sweet potatoes)
- Healthy fats (fish oil supplement)

## Hydration
- Always provide access to fresh, clean water
- Change water at least twice daily

## Portion Guidelines
- Base portion: ${Math.round(weightNum * 0.3)} oz daily total (adjust based on activity)
- ${activityLevel === "High" || activityLevel === "Very High" ? "Increase portions by 15-20% for your dog's high activity level" : activityLevel === "Low" ? "Decrease portions by 10-15% for your dog's lower activity level" : "Standard portions appropriate for moderate activity"}

## Considerations
- Monitor weight and adjust portions accordingly
- Split food into at least two meals per day
- ${dietaryRestrictions ? `Note your dog's dietary restrictions: ${dietaryRestrictions}` : "No specific dietary restrictions noted"}`;
  } 
  else if (petTypeLC === "cat") {
    dietPlan = `# Diet Plan for ${breed} Cat (${age} years, ${weight} lbs)

## Daily Feeding Schedule
- **Morning (7-9 AM):** First meal - ${Math.round(weightNum * 0.1)} oz of high-quality cat food
- **Evening (5-7 PM):** Second meal - ${Math.round(weightNum * 0.1)} oz of high-quality cat food
- Optional small portion at midday for younger or more active cats

## Recommended Foods
- Premium wet cat food (higher moisture content)
- High-quality dry food as a supplement
- Occasional plain cooked chicken or fish as treats

## Hydration
- Always provide access to fresh, clean water
- Consider a cat water fountain to encourage drinking

## Portion Guidelines
- Base portion: ${Math.round(weightNum * 0.2)} oz daily total
- ${activityLevel === "High" || activityLevel === "Very High" ? "Increase portions by 10-15% for your cat's high activity level" : activityLevel === "Low" ? "Decrease portions by 10% for your cat's lower activity level" : "Standard portions appropriate for moderate activity"}

## Considerations
- Cats prefer multiple small meals throughout the day
- Monitor weight closely and adjust food accordingly
- ${dietaryRestrictions ? `Note your cat's dietary restrictions: ${dietaryRestrictions}` : "No specific dietary restrictions noted"}`;
  }
  else {
    dietPlan = `# Diet Plan for ${petType} (${breed}, ${age} years, ${weight} lbs)

## General Guidelines
- Research specific nutritional needs for your particular ${petType}
- Consult with a veterinarian specialized in exotic or small pets
- Provide a balanced diet appropriate for your pet's species

## Considerations
- Activity level: ${activityLevel}
- Age: ${age} years
- Weight: ${weight} lbs
- ${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions}` : "No specific dietary restrictions noted"}

## Feeding Schedule
Establish a consistent feeding schedule appropriate for your ${petType}'s needs.

## Hydration
Always ensure access to fresh, clean water appropriate for your pet's species.

## Important Note
This is a generic guideline. Please consult with a veterinarian who specializes in your specific type of pet for a more detailed and appropriate diet plan.`;
  }
  
  return dietPlan;
}
