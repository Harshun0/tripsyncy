-- 1) Extend conversations table to support groups
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS is_group boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS title text;

-- 2) Index for fast participant lookups (groups will scan more)
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
  ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv
  ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conv_created
  ON public.direct_messages(conversation_id, created_at DESC);

-- 3) Allow conversation creator (group owner) to update title and to delete the conversation
DROP POLICY IF EXISTS "Group creator can update conversation" ON public.conversations;
CREATE POLICY "Group creator can update conversation"
ON public.conversations
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR is_conversation_participant(id, auth.uid()))
WITH CHECK (created_by = auth.uid() OR is_conversation_participant(id, auth.uid()));

DROP POLICY IF EXISTS "Group creator can delete conversation" ON public.conversations;
CREATE POLICY "Group creator can delete conversation"
ON public.conversations
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- 4) Allow group creator to add/remove participants, and any participant to leave (delete self)
DROP POLICY IF EXISTS "Participants insert if self or conversation creator" ON public.conversation_participants;
CREATE POLICY "Participants insert by self or group creator"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_participants.conversation_id
      AND c.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Participants delete by self or group creator" ON public.conversation_participants;
CREATE POLICY "Participants delete by self or group creator"
ON public.conversation_participants
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_participants.conversation_id
      AND c.created_by = auth.uid()
  )
);
