import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, days, budget, interests, type, people, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let messages: { role: string; content: string }[] = [];

    if (type === "itinerary") {
      systemPrompt = `You are TripSync AI, an expert travel planner. Generate detailed, practical travel itineraries in JSON format.
      
Your response MUST be a valid JSON object with this exact structure:
{
  "destination": "string",
  "duration": "string",
  "totalBudget": number,
  "currency": "₹",
  "summary": "string",
  "days": [
    {
      "day": number,
      "title": "string",
      "activities": [
        {
          "time": "string",
          "activity": "string",
          "cost": number,
          "tips": "string"
        }
      ]
    }
  ],
  "tips": ["string"]
}

Make the itinerary practical, fun, and aligned with the user's budget and interests. Include estimated costs for each activity in INR (₹). 
The budget is per person. The total should match the budget constraint.
IMPORTANT: Do NOT use markdown formatting like ** or *** in any text fields. Use plain text only.`;

      const userPrompt = `Create a ${days}-day travel itinerary for ${destination} for a single person with a budget of ₹${budget}.
      
User interests: ${interests?.join(", ") || "general sightseeing"}

Provide a complete day-by-day plan with specific timings, activities, estimated costs, and helpful tips. Make sure the total cost stays within the budget.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
    } else {
      systemPrompt = `You are TripSync AI, a friendly and knowledgeable travel assistant. You help users with:
- Planning trips and itineraries
- Finding travel companions
- Budget planning and expense tracking
- Safety tips and emergency information
- Local recommendations and hidden gems

IMPORTANT: You have access to the full conversation history. Use it to maintain context.
If the user previously discussed a destination, remember it and build on it.
If they asked about hotels after discussing a trip plan, recommend hotels for THAT destination.
Be conversational, helpful, and enthusiastic about travel.
Use markdown formatting for readability (bold, bullet points, headers).
Provide actionable advice with specific details.`;

      messages = [{ role: "system", content: systemPrompt }];

      // Add conversation history for context
      if (history && Array.isArray(history) && history.length > 0) {
        for (const msg of history) {
          messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
        }
      } else {
        messages.push({ role: "user", content: destination });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    if (type === "itinerary") {
      try {
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonContent = jsonMatch[1].trim();
        const parsedItinerary = JSON.parse(jsonContent);
        return new Response(JSON.stringify({ type: "itinerary", data: parsedItinerary }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (parseError) {
        console.error("Failed to parse itinerary JSON:", parseError);
        return new Response(JSON.stringify({ type: "text", content }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ type: "text", content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in ai-travel function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
