
-- Allow group owner to delete members (the ALL policy already covers this via USING, but let's ensure DELETE is explicitly allowed)
-- The existing "Group owner manages members" policy with FOR ALL should cover DELETE.
-- Let's also add a DELETE policy for the expense_groups table for the owner
CREATE POLICY "Group owner can delete" ON public.expense_groups FOR DELETE TO authenticated
  USING (created_by = auth.uid());
