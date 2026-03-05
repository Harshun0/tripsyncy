import React, { useState, useEffect } from 'react';
import { Plus, Wallet, Check, Clock, Send, Users, CreditCard, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

interface ExpenseRow {
  id: string;
  title: string;
  amount: number;
  status: 'paid' | 'pending';
  created_at: string;
  paid_by: string;
  split_with: string[];
  payment_method: string | null;
  upi_id: string | null;
  profiles?: { display_name: string };
}

interface Profile {
  id: string;
  display_name: string;
}

const ExpenseSection: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);
  const [paymentForm, setPaymentForm] = useState({ app: 'Google Pay', recipientUpi: '', note: 'Trip expense settlement' });

  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: '', splitWith: [] as string[] });

  const load = async () => {
    if (!user) return;
    const [{ data: expenseRows }, { data: people }] = await Promise.all([
      db
        .from('expenses')
        .select('id,title,amount,status,created_at,paid_by,split_with,payment_method,upi_id,profiles:paid_by(display_name)')
        .or(`created_by.eq.${user.id},paid_by.eq.${user.id},split_with.cs.{${user.id}}`)
        .order('created_at', { ascending: false }),
      db.from('profiles').select('id, display_name').limit(100),
    ]);

    setExpenses((expenseRows || []) as ExpenseRow[]);
    setProfiles((people || []) as Profile[]);
    setNewExpense((prev) => ({ ...prev, paidBy: prev.paidBy || user.id }));
  };

  useEffect(() => {
    load();
  }, [user]);

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const youOwe = expenses.reduce((sum, exp) => {
    if (!user) return sum;
    const participants = (exp.split_with?.length || 0) + 1;
    const share = Number(exp.amount || 0) / participants;
    if (exp.paid_by !== user.id && exp.split_with?.includes(user.id)) return sum + share;
    return sum;
  }, 0);

  const youAreOwed = expenses.reduce((sum, exp) => {
    if (!user) return sum;
    const participants = (exp.split_with?.length || 0) + 1;
    const share = Number(exp.amount || 0) / participants;
    if (exp.paid_by === user.id) return sum + share * (exp.split_with?.length || 0);
    return sum;
  }, 0);

  const handleAddExpense = async () => {
    if (!user || !newExpense.title.trim() || !newExpense.amount) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await db.from('expenses').insert({
      created_by: user.id,
      title: newExpense.title,
      amount: Number(newExpense.amount),
      paid_by: newExpense.paidBy || user.id,
      split_with: newExpense.splitWith,
      status: 'pending',
    });

    if (error) {
      toast({ title: 'Failed to add expense', description: error.message, variant: 'destructive' });
      return;
    }

    setShowAddExpense(false);
    setNewExpense({ title: '', amount: '', paidBy: user.id, splitWith: [] });
    toast({ title: 'Expense added! 💰' });
    load();
  };

  const toggleFriend = (id: string) => {
    setNewExpense((prev) => ({
      ...prev,
      splitWith: prev.splitWith.includes(id) ? prev.splitWith.filter((f) => f !== id) : [...prev.splitWith, id],
    }));
  };

  const startPayment = (expense: ExpenseRow) => {
    setSelectedExpense(expense);
    setPaymentForm({ app: 'Google Pay', recipientUpi: expense.upi_id || '', note: `Settlement for ${expense.title}` });
    setShowUPIModal(true);
  };

  const handleUPIPayment = async () => {
    if (!selectedExpense || !paymentForm.recipientUpi.trim()) {
      toast({ title: 'Enter recipient UPI ID', variant: 'destructive' });
      return;
    }

    const amount = Number(selectedExpense.amount || 0);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentForm.recipientUpi)}&pn=${encodeURIComponent('TripSync')}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentForm.note)}`;

    await db.from('expenses').update({ payment_method: paymentForm.app, upi_id: paymentForm.recipientUpi, payment_link: upiUrl }).eq('id', selectedExpense.id);

    window.location.href = upiUrl;
    toast({ title: `Opening ${paymentForm.app}` });
    setShowUPIModal(false);
  };

  const markPaid = async (expenseId: string) => {
    await db.from('expenses').update({ status: 'paid' }).eq('id', expenseId);
    toast({ title: 'Expense marked as paid ✅' });
    load();
  };

  const handleSendReminders = async () => {
    if (!user) return;
    const pendingMembers = profiles.filter((p) => p.id !== user.id);
    if (!reminderMessage.trim()) {
      toast({ title: 'Write a reminder message', variant: 'destructive' });
      return;
    }

    await Promise.all(
      pendingMembers.map((member) =>
        db.from('notifications').insert({ user_id: member.id, actor_id: user.id, type: 'expense', title: 'Expense reminder', body: reminderMessage })
      )
    );

    setShowReminder(false);
    setReminderMessage('');
    toast({ title: 'Reminders sent 🔔' });
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-sm font-medium mb-6"><Wallet className="w-4 h-4" />Smart Expense Management</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">Group <span className="text-gradient">Expense Split</span></h2>
          <p className="text-lg text-muted-foreground">Track expenses and settle through real UPI deep links.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-success/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Shared Wallet</h3>
                <Button onClick={() => setShowAddExpense(true)} variant="outline" size="sm" className="rounded-full"><Plus className="w-4 h-4 mr-1" />Add Expense</Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-muted/50 rounded-2xl text-center"><p className="text-muted-foreground mb-1">Total Spent</p><p className="text-3xl font-bold text-foreground">₹{totalExpense.toLocaleString()}</p></div>
                <div className="p-6 bg-destructive/10 rounded-2xl text-center"><p className="text-muted-foreground mb-1">You Owe</p><p className="text-3xl font-bold text-destructive">₹{Math.round(youOwe).toLocaleString()}</p></div>
                <div className="p-6 bg-success/10 rounded-2xl text-center"><p className="text-muted-foreground mb-1">You're Owed</p><p className="text-3xl font-bold text-success">₹{Math.round(youAreOwed).toLocaleString()}</p></div>
              </div>
            </div>

            <div className="travel-card p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Expenses</h3>
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-4 bg-muted/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expense.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'}`}>
                          {expense.status === 'paid' ? <Check className="w-5 h-5 text-success" /> : <Clock className="w-5 h-5 text-warning" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{expense.title}</h4>
                          <p className="text-xs text-muted-foreground">Paid by {expense.profiles?.display_name || 'Traveler'}</p>
                        </div>
                      </div>
                      <div className="text-right"><p className="font-bold text-foreground">₹{Number(expense.amount).toLocaleString()}</p><p className="text-xs text-muted-foreground">{new Date(expense.created_at).toLocaleDateString()}</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />Split: {(expense.split_with?.length || 0) + 1} people</div>
                      <div className="flex gap-2">
                        {expense.status === 'pending' && <Button onClick={() => startPayment(expense)} size="sm" className="h-8 gradient-primary text-white text-xs">Pay</Button>}
                        {expense.status === 'pending' && <Button onClick={() => markPaid(expense.id)} size="sm" variant="outline" className="h-8 text-xs">Mark Paid</Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <Button onClick={() => setShowUPIModal(true)} className="flex-1 h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow"><CreditCard className="w-5 h-5 mr-2" />Pay via UPI</Button>
                <Button onClick={() => setShowReminder(true)} variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary"><Send className="w-5 h-5 mr-2" />Send Reminders</Button>
              </div>
            </div>
          </div>

          <div className="travel-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Participants</h3>
            <div className="space-y-3">
              {profiles.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"><span className="text-sm font-medium text-foreground">{p.display_name}</span></div>
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
              <div><label className="block text-sm font-medium text-foreground mb-2">Expense Title</label><input type="text" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="Dinner" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Amount (₹)</label><input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Paid By</label><select value={newExpense.paidBy} onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })} className="input-field">{profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}</select></div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Split With</label>
                <div className="flex gap-2 flex-wrap">
                  {profiles.filter((p) => p.id !== newExpense.paidBy).map((p) => (
                    <button key={p.id} onClick={() => toggleFriend(p.id)} className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${newExpense.splitWith.includes(p.id) ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
                      <UserPlus className="w-3 h-3" />{p.display_name}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold"><Plus className="w-5 h-5 mr-2" />Add Expense</Button>
            </div>
          </div>
        </div>
      )}

      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border"><h2 className="text-lg font-bold text-foreground">UPI Payment</h2><button onClick={() => setShowUPIModal(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-3">
              <select value={paymentForm.app} onChange={(e) => setPaymentForm((p) => ({ ...p, app: e.target.value }))} className="input-field">
                <option>Google Pay</option><option>PhonePe</option><option>Paytm</option><option>BHIM UPI</option>
              </select>
              <input value={paymentForm.recipientUpi} onChange={(e) => setPaymentForm((p) => ({ ...p, recipientUpi: e.target.value }))} placeholder="Recipient UPI ID (example@upi)" className="input-field" />
              <input value={paymentForm.note} onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))} placeholder="Payment note" className="input-field" />
              <Button onClick={handleUPIPayment} className="w-full h-11 gradient-primary text-white">Proceed to Pay</Button>
            </div>
          </div>
        </div>
      )}

      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border"><h2 className="text-lg font-bold text-foreground">Send Reminder</h2><button onClick={() => setShowReminder(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <textarea value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} placeholder="Friendly reminder to settle expenses" rows={3} className="input-field resize-none" />
              <Button onClick={handleSendReminders} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold"><Send className="w-5 h-5 mr-2" />Send Reminder</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpenseSection;
