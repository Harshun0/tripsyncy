
-- Drop recursive policies
DROP POLICY IF EXISTS "Group owner manages members" ON public.expense_group_members;
DROP POLICY IF EXISTS "Members can view group members" ON public.expense_group_members;

-- Recreate without recursion: owner can manage members (check group table directly, no subquery on same table)
CREATE POLICY "Group owner manages members" ON public.expense_group_members FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.expense_groups g WHERE g.id = expense_group_members.group_id AND g.created_by = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.expense_groups g WHERE g.id = expense_group_members.group_id AND g.created_by = auth.uid()
  ));

-- Members can view: use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_expense_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.expense_group_members
    WHERE group_id = _group_id AND user_id = _user_id
  )
$$;

CREATE POLICY "Members can view group members" ON public.expense_group_members FOR SELECT TO authenticated
  USING (public.is_expense_group_member(group_id, auth.uid()));
