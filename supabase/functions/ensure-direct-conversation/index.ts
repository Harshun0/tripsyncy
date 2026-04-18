import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) throw new Error("Not authenticated");

    const { otherUserId } = await req.json();

    if (!otherUserId || typeof otherUserId !== "string") {
      throw new Error("Missing other user id");
    }

    if (otherUserId === user.id) {
      throw new Error("Cannot create a conversation with yourself");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: acceptedFollow, error: followError } = await adminClient
      .from("follows")
      .select("id")
      .eq("status", "accepted")
      .or(`and(follower_id.eq.${user.id},following_id.eq.${otherUserId}),and(follower_id.eq.${otherUserId},following_id.eq.${user.id})`)
      .limit(1)
      .maybeSingle();

    if (followError) throw followError;
    if (!acceptedFollow) {
      return new Response(JSON.stringify({ error: "Connect first" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: myParticipants, error: myParticipantsError } = await adminClient
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (myParticipantsError) throw myParticipantsError;

    const myConversationIds = (myParticipants || []).map((row) => row.conversation_id);

    if (myConversationIds.length > 0) {
      const { data: existingParticipant, error: existingError } = await adminClient
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", myConversationIds)
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingParticipant?.conversation_id) {
        return new Response(JSON.stringify({ conversationId: existingParticipant.conversation_id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: conversation, error: conversationError } = await adminClient
      .from("conversations")
      .insert({ created_by: user.id })
      .select("id")
      .single();

    if (conversationError) throw conversationError;

    const conversationId = conversation.id;

    const { error: participantError } = await adminClient
      .from("conversation_participants")
      .insert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: otherUserId },
      ]);

    if (participantError) {
      await adminClient.from("conversations").delete().eq("id", conversationId);
      throw participantError;
    }

    return new Response(JSON.stringify({ conversationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ensure-direct-conversation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});