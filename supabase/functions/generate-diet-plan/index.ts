
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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate diet plan', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dietPlan = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        dietPlan,
        metadata: { petType, breed, age, weight, activityLevel }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-diet-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
