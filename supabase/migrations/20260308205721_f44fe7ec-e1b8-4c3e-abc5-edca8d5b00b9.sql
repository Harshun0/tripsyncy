
-- Fix expense_groups: drop the recursive member-view policy
DROP POLICY IF EXISTS "Group members can view" ON public.expense_groups;

-- Use security definer function (already created) to check membership without recursion
CREATE POLICY "Group members can view" ON public.expense_groups FOR SELECT TO authenticated
  USING (public.is_expense_group_member(id, auth.uid()));
