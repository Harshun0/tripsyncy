
-- Expense groups table
CREATE TABLE public.expense_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;

-- Members of expense groups
CREATE TABLE public.expense_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.expense_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.expense_group_members ENABLE ROW LEVEL SECURITY;

-- RLS: Group creator can do everything, members can read
CREATE POLICY "Group owner full access" ON public.expense_groups FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group members can view" ON public.expense_groups FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.expense_group_members gm WHERE gm.group_id = expense_groups.id AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Group owner manages members" ON public.expense_group_members FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.expense_groups g WHERE g.id = expense_group_members.group_id AND g.created_by = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.expense_groups g WHERE g.id = expense_group_members.group_id AND g.created_by = auth.uid()
  ));

CREATE POLICY "Members can view group members" ON public.expense_group_members FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.expense_group_members gm2 WHERE gm2.group_id = expense_group_members.group_id AND gm2.user_id = auth.uid()
  ));

-- Add group_id to expenses table (optional link)
ALTER TABLE public.expenses ADD COLUMN group_id uuid REFERENCES public.expense_groups(id) ON DELETE SET NULL;
