import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Wallet, ArrowRight, Check, Clock, Send, Users, CreditCard, X, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ExpenseRow {
  id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_with: string[];
  status: string;
  created_at: string;
  upi_id: string | null;
  payment_method: string | null;
}

const ExpenseSection: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('Please settle pending trip expenses.');
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: '', splitWith: [] as string[] });
  const [upiForm, setUpiForm] = useState({ app: 'Google Pay', upiId: '', amount: '', note: 'Trip expense settlement' });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const loadData = async () => {
    if (!user) return;

    const { data: expenseRows } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const expenseData = (expenseRows || []) as ExpenseRow[];
    setExpenses(expenseData);

    const ids = new Set<string>([user.id]);
    expenseData.forEach((e) => {
      ids.add(e.paid_by);
      (e.split_with || []).forEach((id) => ids.add(id));
    });

    const { data: profiles } = await supabase.from('profiles').select('id,display_name').in('id', Array.from(ids));
    const names: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { names[p.id] = p.display_name; });
    setProfileNames(names);

    const { data: acceptedFollows } = await supabase
      .from('follows')
      .select('follower_id,following_id,status')
      .eq('status', 'accepted')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);

    const friendIds = [...new Set(((acceptedFollows || []) as any[]).map((f) => f.follower_id === user.id ? f.following_id : f.follower_id))];
    if (friendIds.length) {
      const { data: friendProfiles } = await supabase.from('profiles').select('id,display_name').in('id', friendIds);
      const friendRows = (friendProfiles || []).map((f: any) => ({ id: f.id, name: f.display_name }));
      setFriends(friendRows);
      if (!newExpense.paidBy) setNewExpense((p) => ({ ...p, paidBy: user.id }));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const totalExpense = useMemo(() => expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0), [expenses]);

  const youOwe = useMemo(() => {
    if (!user) return 0;
    return expenses
      .filter((e) => e.paid_by !== user.id && (e.split_with || []).includes(user.id))
      .reduce((sum, e) => sum + Number(e.amount || 0) / (Number((e.split_with || []).length) + 1), 0);
  }, [expenses, user]);

  const youAreOwed = useMemo(() => {
    if (!user) return 0;
    return expenses
      .filter((e) => e.paid_by === user.id)
      .reduce((sum, e) => sum + Number(e.amount || 0) - (Number(e.amount || 0) / (Number((e.split_with || []).length) + 1)), 0);
  }, [expenses, user]);

  const handleAddExpense = async () => {
    if (!user || !newExpense.title.trim() || !newExpense.amount || !newExpense.paidBy) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSubmittingExpense(true);
    const { error } = await supabase.from('expenses').insert({
      created_by: user.id,
      title: newExpense.title,
      amount: Number(newExpense.amount),
      paid_by: newExpense.paidBy,
      split_with: newExpense.splitWith,
      status: 'pending',
      payment_method: 'upi',
    });
    setSubmittingExpense(false);

    if (error) {
      toast({ title: 'Expense creation failed', description: error.message, variant: 'destructive' });
      return;
    }

    setNewExpense({ title: '', amount: '', paidBy: user.id, splitWith: [] });
    setShowAddExpense(false);
    toast({ title: 'Expense added! 💰' });
    await loadData();
  };

  const toggleFriend = (id: string) => {
    setNewExpense((prev) => ({
      ...prev,
      splitWith: prev.splitWith.includes(id) ? prev.splitWith.filter((f) => f !== id) : [...prev.splitWith, id],
    }));
  };

  const handlePayUPI = () => {
    setUpiForm((prev) => ({ ...prev, amount: Math.max(1, Math.round(youOwe)).toString() }));
    setShowUPIModal(true);
  };

  const handleUPIPayment = () => {
    if (!upiForm.upiId.trim()) {
      toast({ title: 'Enter UPI ID', variant: 'destructive' });
      return;
    }

    const amount = Number(upiForm.amount || 0);
    if (!amount || amount <= 0) {
      toast({ title: 'Enter valid amount', variant: 'destructive' });
      return;
    }

    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiForm.upiId)}&pn=${encodeURIComponent('TripSync Settlement')}&am=${amount}&cu=INR&tn=${encodeURIComponent(upiForm.note || 'Trip settlement')}`;
    window.location.href = upiUrl;
    setShowUPIModal(false);
    toast({ title: `Opening ${upiForm.app}`, description: 'UPI payment request initiated on your phone.' });
  };

  const handleSendReminders = async () => {
    if (!user) return;

    const targetIds = [...new Set(expenses.flatMap((e) => e.split_with || []).filter((id) => id !== user.id))];
    if (!targetIds.length) {
      toast({ title: 'No users to remind' });
      return;
    }

    const rows = targetIds.map((id) => ({
      user_id: id,
      actor_id: user.id,
      type: 'expense_reminder',
      title: 'Expense reminder',
      body: reminderMessage,
      entity_type: 'expense',
    }));

    const { error } = await supabase.from('notifications').insert(rows as any);
    if (error) {
      toast({ title: 'Reminder failed', description: error.message, variant: 'destructive' });
      return;
    }

    setShowReminder(false);
    toast({ title: 'Reminders sent 🔔' });
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-sm font-medium mb-6"><Wallet className="w-4 h-4" />Smart Expense Management</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">Group <span className="text-gradient">Expense Split</span></h2>
          <p className="text-lg text-muted-foreground">Track real expenses and settle with UPI.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-success/5">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="text-xl font-semibold text-foreground">Trip Expenses</h3><p className="text-muted-foreground">Shared among real users</p></div>
                <Button onClick={() => setShowAddExpense(true)} variant="outline" size="sm" className="rounded-full"><Plus className="w-4 h-4 mr-1" />Add Expense</Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-muted/50 rounded-2xl text-center"><p className="text-muted-foreground mb-1">Total Spent</p><p className="text-3xl font-bold text-foreground">₹{Math.round(totalExpense).toLocaleString()}</p></div>
                <div className="p-6 bg-destructive/10 rounded-2xl text-center"><p className="text-muted-foreground mb-1">You Owe</p><p className="text-3xl font-bold text-destructive">₹{Math.round(youOwe).toLocaleString()}</p></div>
                <div className="p-6 bg-success/10 rounded-2xl text-center"><p className="text-muted-foreground mb-1">You're Owed</p><p className="text-3xl font-bold text-success">₹{Math.round(youAreOwed).toLocaleString()}</p></div>
              </div>
            </div>

            <div className="travel-card p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Settlement Actions</h3>
              <div className="flex gap-4">
                <Button onClick={handlePayUPI} className="flex-1 h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow"><CreditCard className="w-5 h-5 mr-2" />Pay via UPI</Button>
                <Button onClick={() => setShowReminder(true)} variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary"><Send className="w-5 h-5 mr-2" />Send Reminders</Button>
              </div>
            </div>
          </div>

          <div className="travel-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Expenses</h3>
            <div className="space-y-4">
              {expenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses yet.</p> : expenses.map((expense) => (
                <div key={expense.id} className="p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expense.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'}`}>
                        {expense.status === 'paid' ? <Check className="w-5 h-5 text-success" /> : <Clock className="w-5 h-5 text-warning" />}
                      </div>
                      <div><h4 className="font-medium text-foreground text-sm">{expense.title}</h4><p className="text-xs text-muted-foreground">by {profileNames[expense.paid_by] || 'User'}</p></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />Split: {(expense.split_with?.length || 0) + 1}</div>
                    <div className="flex items-center gap-2"><span className="font-bold text-foreground">₹{Number(expense.amount).toLocaleString()}</span><span className={`text-xs px-2 py-0.5 rounded-full ${expense.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{expense.status === 'paid' ? 'Settled' : 'Pending'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border"><h2 className="text-lg font-bold text-foreground">Add Expense</h2><button onClick={() => setShowAddExpense(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-foreground mb-2">Expense Title</label><input type="text" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="e.g. Dinner" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Amount (₹)</label><input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0" className="input-field" /></div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Paid By</label>
                <div className="flex gap-2 flex-wrap">
                  {[{ id: user?.id || '', name: 'You' }, ...friends].map((f) => (
                    <button key={f.id} onClick={() => setNewExpense({ ...newExpense, paidBy: f.id })} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${newExpense.paidBy === f.id ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>{f.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Split With</label>
                <div className="flex gap-2 flex-wrap">
                  {friends.map((f) => (
                    <button key={f.id} onClick={() => toggleFriend(f.id)} className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${newExpense.splitWith.includes(f.id) ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}><UserPlus className="w-3 h-3" />{f.name}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold" disabled={submittingExpense}>{submittingExpense ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" />Add Expense</>}</Button>
            </div>
          </div>
        </div>
      )}

      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border"><h2 className="text-lg font-bold text-foreground">UPI Payment</h2><button onClick={() => setShowUPIModal(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-3">
              <select className="input-field" value={upiForm.app} onChange={(e) => setUpiForm((p) => ({ ...p, app: e.target.value }))}><option>Google Pay</option><option>PhonePe</option><option>Paytm</option><option>BHIM UPI</option><option>Amazon Pay</option></select>
              <input className="input-field" placeholder="Receiver UPI ID (e.g. name@upi)" value={upiForm.upiId} onChange={(e) => setUpiForm((p) => ({ ...p, upiId: e.target.value }))} />
              <input className="input-field" type="number" placeholder="Amount" value={upiForm.amount} onChange={(e) => setUpiForm((p) => ({ ...p, amount: e.target.value }))} />
              <input className="input-field" placeholder="Note" value={upiForm.note} onChange={(e) => setUpiForm((p) => ({ ...p, note: e.target.value }))} />
              <Button onClick={handleUPIPayment} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold"><ArrowRight className="w-4 h-4 mr-2" />Open {upiForm.app}</Button>
            </div>
          </div>
        </div>
      )}

      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border"><h2 className="text-lg font-bold text-foreground">Send Reminder</h2><button onClick={() => setShowReminder(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <textarea value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} rows={3} className="input-field resize-none" />
              <Button onClick={handleSendReminders} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold"><Send className="w-5 h-5 mr-2" />Send Reminder</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpenseSection;
