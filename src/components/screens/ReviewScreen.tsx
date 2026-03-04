import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const db = supabase as any;

interface ReviewScreenProps {
  revieweeId: string;
  revieweeName: string;
  tripId?: string;
  onClose: () => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ revieweeId, revieweeName, tripId, onClose }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const { data } = await db.from('reviews').select('*').eq('reviewee_id', revieweeId).order('created_at', { ascending: false });
      if (data) setReviews(data);
    };
    loadReviews();
  }, [revieweeId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) { toast({ title: 'Please select a rating', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await db.from('reviews').insert({ reviewer_id: user.id, reviewee_id: revieweeId, trip_id: tripId || null, rating, content });
    setLoading(false);
    if (error) { toast({ title: 'Review failed', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Review submitted! ⭐' }); onClose(); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-foreground mb-2">Rate {revieweeName}</h2>
        <p className="text-sm text-muted-foreground mb-6">Average: {avgRating} ⭐ ({reviews.length} reviews)</p>
        <div className="flex gap-2 mb-6 justify-center">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}>
              <Star className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= s ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
            </button>
          ))}
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your experience..." className="input-field min-h-[100px] resize-none mb-4" />
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 h-12 rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0} className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" />Submit</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
