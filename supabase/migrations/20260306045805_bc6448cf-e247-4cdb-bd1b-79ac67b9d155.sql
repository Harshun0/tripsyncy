-- Allow conversation creator to add participants (required for DMs between accepted followers)

drop policy if exists "Participants insert if self" on public.conversation_participants;
create policy "Participants insert if self or conversation creator"
on public.conversation_participants
for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.conversations c
    where c.id = conversation_participants.conversation_id
      and c.created_by = auth.uid()
  )
);