-- Fix infinite recursion in conversation_participants RLS by using a SECURITY DEFINER function

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id = _user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated;

-- Replace recursive policy on conversation_participants
DROP POLICY IF EXISTS "Participants visible to participants" ON public.conversation_participants;
CREATE POLICY "Participants visible to participants"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_conversation_participant(conversation_id, auth.uid())
);

-- Replace recursive policy on conversations
DROP POLICY IF EXISTS "Conversations visible to participants" ON public.conversations;
CREATE POLICY "Conversations visible to participants"
ON public.conversations
FOR SELECT
TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));

-- Replace policies on direct_messages that subquery conversation_participants
DROP POLICY IF EXISTS "Messages visible to participants" ON public.direct_messages;
CREATE POLICY "Messages visible to participants"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Messages insert by participant" ON public.direct_messages;
CREATE POLICY "Messages insert by participant"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
);

DROP POLICY IF EXISTS "Messages update read_at by recipient" ON public.direct_messages;
CREATE POLICY "Messages update read_at by recipient"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (
  sender_id <> auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
)
WITH CHECK (
  sender_id <> auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
);