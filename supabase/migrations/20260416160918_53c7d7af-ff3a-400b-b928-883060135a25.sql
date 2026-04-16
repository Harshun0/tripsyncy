
-- Add read_at column for read receipts
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS read_at timestamptz DEFAULT NULL;

-- Allow participants to update read_at on messages sent to them
CREATE POLICY "Messages update read_at by recipient"
ON public.direct_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = direct_messages.conversation_id
    AND cp.user_id = auth.uid()
  )
  AND sender_id != auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = direct_messages.conversation_id
    AND cp.user_id = auth.uid()
  )
  AND sender_id != auth.uid()
);
