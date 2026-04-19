import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import { LOCATION_SUGGESTIONS } from '@/lib/locations';
import { Plus, MapPin, Phone, User, CheckCircle2, X, Loader2, Camera, Trash2 } from 'lucide-react';

interface LostFoundItem {
  id: string;
  user_id: string;
  type: 'lost' | 'found';
  title: string;
  description: string | null;
  location: string | null;
  contact_phone: string | null;
  finder_name: string | null;
  media_url: string | null;
  status: 'open' | 'resolved';
  created_at: string;
}

const RedStar: React.FC = () => <span className="text-destructive">*</span>;

const LostFoundSection: React.FC = () => {
  const { user } = useAuth();
  // Default landing tab is "found" (showing all open lost posts so finders can browse).
  const [tab, setTab] = useState<'lost' | 'found'>('found');
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    contact_phone: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  const loadItems = async () => {
    setLoading(true);
    // Always load lost items (these are the posts users browse on the Found page).
    const { data, error } = await supabase
      .from('lost_found_items')
      .select('*')
      .eq('type', 'lost')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load', description: error.message, variant: 'destructive' });
    }
    setItems((data || []) as LostFoundItem[]);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
    const channel = supabase
      .channel('lost-found-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_found_items' }, () => loadItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', location: '', contact_phone: '' });
    setPhoto(null);
    setPhotoPreview(null);
    setLocationSuggestions([]);
  };

  const handleLocationChange = (val: string) => {
    setForm((p) => ({ ...p, location: val }));
    if (val.length >= 2) {
      setLocationSuggestions(
        LOCATION_SUGGESTIONS.filter((l) => l.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
      );
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleCreate = async () => {
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }
    if (!form.title.trim()) { toast({ title: 'Item name is required', variant: 'destructive' }); return; }
    if (!form.location.trim()) { toast({ title: 'Location is required', variant: 'destructive' }); return; }
    if (!form.contact_phone.trim()) { toast({ title: 'Contact phone is required', variant: 'destructive' }); return; }

    setSubmitting(true);
    try {
      let mediaUrl: string | null = null;
      if (photo) {
        const compressed = await compressImage(photo);
        const ext = compressed.name.split('.').pop() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('lost-found-media').upload(path, compressed, { upsert: false, cacheControl: '3600' });
        if (upErr) throw upErr;
        mediaUrl = supabase.storage.from('lost-found-media').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('lost_found_items').insert({
        user_id: user.id,
        type: 'lost',
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim(),
        contact_phone: form.contact_phone.trim(),
        media_url: mediaUrl,
      });
      if (error) throw error;

      toast({ title: 'Lost item posted' });
      resetForm();
      setShowCreate(false);
      loadItems();
    } catch (e: any) {
      toast({ title: 'Failed to post', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    const { error } = await supabase
      .from('lost_found_items')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { toast({ title: 'Failed to close', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Marked as resolved 🎉' });
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
    if (error) { toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' });
    loadItems();
  };

  const visibleItems = useMemo(() => items.filter((i) => i.status === 'open'), [items]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gradient font-display">Lost &amp; Found</h1>
          <p className="text-sm text-muted-foreground mt-1">Help travelers reunite with their lost items.</p>
        </div>
        {/* Only the Lost tab can create a post — the Found tab is purely a browsing feed. */}
        {tab === 'lost' && (
          <Button onClick={() => setShowCreate(true)} className="gradient-primary text-primary-foreground rounded-xl shadow-glow">
            <Plus className="w-4 h-4 mr-1" /> Post lost item
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-full max-w-md">
        {(['found', 'lost'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'gradient-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'found' ? 'Found items' : 'Lost items'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">
            {tab === 'lost' ? 'No lost items posted yet.' : 'No lost items to browse yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleItems.map((item) => (
            <article key={item.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {item.media_url && (
                <img src={item.media_url} alt={item.title} className="w-full h-44 object-cover" loading="lazy" />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    LOST
                  </span>
                </div>
                {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {item.location && (
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span>{item.location}</span></div>
                  )}
                  {item.contact_phone && (
                    <a href={`tel:${item.contact_phone}`} className="flex items-center gap-1.5 text-primary font-medium hover:underline">
                      <Phone className="w-3.5 h-3.5" /><span>{item.contact_phone}</span>
                    </a>
                  )}
                </div>
                {item.user_id === user?.id && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <Button size="sm" onClick={() => handleResolve(item.id)} className="flex-1 gradient-primary text-primary-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark resolved
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && tab === 'lost' && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Post a lost item</h2>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="w-full h-40 border border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setPhoto(f); setPhotoPreview(URL.createObjectURL(f)); }
              }} />
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center gap-2 text-sm text-muted-foreground"><Camera className="w-4 h-4" />Add a photo (optional)</span>
              )}
            </label>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Item name <RedStar /></label>
              <Input placeholder="e.g. Black wallet, iPhone 14" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea placeholder="Color, brand, distinguishing marks..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>

            <div className="space-y-1 relative">
              <label className="text-xs font-medium text-muted-foreground">Where you lost it <RedStar /></label>
              <Input placeholder="Start typing a location..." value={form.location} onChange={(e) => handleLocationChange(e.target.value)} />
              {locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {locationSuggestions.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { setForm((p) => ({ ...p, location: loc })); setLocationSuggestions([]); }}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-3 h-3 text-muted-foreground" />{loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Contact phone <RedStar /></label>
              <Input type="tel" placeholder="e.g. +91 98765 43210" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
            </div>

            <Button onClick={handleCreate} disabled={submitting} className="w-full h-11 gradient-primary text-primary-foreground">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundSection;
