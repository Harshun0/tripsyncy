
-- Create a security definer function to check if a user can view another user's posts
-- Returns true if: post owner has public profile, or viewer is the post owner, or viewer has accepted follow
CREATE OR REPLACE FUNCTION public.can_view_user_posts(_viewer_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    -- Own posts always visible
    _viewer_id = _owner_id
    OR
    -- Public profiles: posts visible to all authenticated
    (SELECT profile_visibility FROM public.profiles WHERE id = _owner_id) = 'public'
    OR
    -- Private/friends profiles: only if accepted follow exists
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = _viewer_id
        AND following_id = _owner_id
        AND status = 'accepted'
    )
$$;

-- Update the posts SELECT policy to use the new function
DROP POLICY IF EXISTS "Posts readable by authenticated" ON public.posts;
CREATE POLICY "Posts readable by authenticated"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    can_view_user_posts(auth.uid(), user_id)
  );
