import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Wallet, ArrowRight, Check, Clock, Send, Users, CreditCard, X, UserPlus, Loader2, CheckCircle2, TrendingUp, TrendingDown, Scale, UsersRound, Pencil, Trash2, UserMinus } from 'lucide-react';
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
  group_id: string | null;
}

interface ExpenseGroup {
  id: string;
  name: string;
  created_by: string;
  members: string[];
}

const ExpenseSection: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState('Please settle pending trip expenses.');
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: user?.id || '', splitWith: [] as string[] });
  const [upiForm, setUpiForm] = useState({ app: 'Google Pay', upiId: '', amount: '', note: 'Trip expense settlement' });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupMembers, setEditGroupMembers] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);

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

    const { data: acceptedFollows } = await supabase
      .from('follows')
      .select('follower_id,following_id,status')
      .eq('status', 'accepted')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);

    const friendIds = [...new Set(((acceptedFollows || []) as any[]).map((f) => f.follower_id === user.id ? f.following_id : f.follower_id))];
    friendIds.forEach((id) => ids.add(id));

    const { data: profiles } = await supabase.from('profiles').select('id,display_name').in('id', Array.from(ids));
    const names: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { names[p.id] = p.display_name; });
    setProfileNames(names);

    if (friendIds.length) {
      setFriends(friendIds.map((id) => ({ id, name: names[id] || 'User' })));
    }

    const { data: groupRows } = await supabase
      .from('expense_groups')
      .select('id,name,created_by')
      .order('created_at', { ascending: false });

    if (groupRows && groupRows.length > 0) {
      const groupIds = groupRows.map((g: any) => g.id);
      const { data: memberRows } = await supabase
        .from('expense_group_members')
        .select('group_id,user_id')
        .in('group_id', groupIds);

      setGroups(groupRows.map((g: any) => ({
        id: g.id,
        name: g.name,
        created_by: g.created_by,
        members: (memberRows || []).filter((m: any) => m.group_id === g.id).map((m: any) => m.user_id),
      })));
    } else {
      setGroups([]);
    }

    setNewExpense((p) => ({ ...p, paidBy: p.paidBy || user.id }));
  };

  useEffect(() => { loadData(); }, [user]);

  const activeGroup = useMemo(() => groups.find((g) => g.id === activeGroupId), [groups, activeGroupId]);
  const isGroupOwner = activeGroup?.created_by === user?.id;

  const filteredExpenses = useMemo(() => {
    if (!activeGroupId) return expenses;
    return expenses.filter((e) => e.group_id === activeGroupId);
  }, [expenses, activeGroupId]);

  const totalExpense = useMemo(() => filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0), [filteredExpenses]);

  const youOwe = useMemo(() => {
    if (!user) return 0;
    return filteredExpenses
      .filter((e) => e.status !== 'paid' && e.paid_by !== user.id && (e.split_with || []).includes(user.id))
      .reduce((sum, e) => sum + Number(e.amount || 0) / ((e.split_with || []).length + 1), 0);
  }, [filteredExpenses, user]);

  const youAreOwed = useMemo(() => {
    if (!user) return 0;
    return filteredExpenses
      .filter((e) => e.status !== 'paid' && e.paid_by === user.id && (e.split_with || []).length > 0)
      .reduce((sum, e) => {
        const splitCount = (e.split_with || []).length + 1;
        return sum + Number(e.amount || 0) * ((e.split_with || []).length / splitCount);
      }, 0);
  }, [filteredExpenses, user]);

  const netBalance = useMemo(() => youAreOwed - youOwe, [youAreOwed, youOwe]);

  const activeGroupMembers = useMemo(() => {
    if (!activeGroupId || !activeGroup) return friends;
    return activeGroup.members
      .filter((id) => id !== user?.id)
      .map((id) => ({ id, name: profileNames[id] || 'User' }));
  }, [activeGroupId, activeGroup, friends, profileNames, user]);

  // --- Handlers ---

  const handleSettle = async (expenseId: string) => {
    setSettlingId(expenseId);
    const { error } = await supabase.from('expenses').update({ status: 'paid' }).eq('id', expenseId);
    setSettlingId(null);
    if (error) { toast({ title: 'Failed to settle', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Expense settled! ✅' });
    await loadData();
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) { toast({ title: 'Enter a group name', variant: 'destructive' }); return; }
    if (newGroupMembers.length === 0) { toast({ title: 'Select at least one member', variant: 'destructive' }); return; }
    setCreatingGroup(true);
    const { data: groupData, error: groupErr } = await supabase
      .from('expense_groups')
      .insert({ name: newGroupName.trim(), created_by: user.id })
      .select('id')
      .single();
    if (groupErr || !groupData) { setCreatingGroup(false); toast({ title: 'Failed to create group', description: groupErr?.message, variant: 'destructive' }); return; }
    const { error: memberErr } = await supabase
      .from('expense_group_members')
      .insert([user.id, ...newGroupMembers].map((uid) => ({ group_id: groupData.id, user_id: uid })));
    setCreatingGroup(false);
    if (memberErr) { toast({ title: 'Group created but failed to add members', description: memberErr.message, variant: 'destructive' }); }
    else { toast({ title: `Group "${newGroupName}" created! 🎉` }); }
    setNewGroupName(''); setNewGroupMembers([]); setShowCreateGroup(false);
    await loadData();
    setActiveGroupId(groupData.id);
  };

  const openEditGroup = () => {
    if (!activeGroup) return;
    setEditGroupName(activeGroup.name);
    setEditGroupMembers(activeGroup.members.filter((id) => id !== user?.id));
    setShowEditGroup(true);
  };

  const handleSaveEditGroup = async () => {
    if (!user || !activeGroup) return;
    if (!editGroupName.trim()) { toast({ title: 'Enter a group name', variant: 'destructive' }); return; }
    setSavingEdit(true);

    // Update name
    if (editGroupName.trim() !== activeGroup.name) {
      const { error } = await supabase.from('expense_groups').update({ name: editGroupName.trim() }).eq('id', activeGroup.id);
      if (error) { setSavingEdit(false); toast({ title: 'Failed to update name', description: error.message, variant: 'destructive' }); return; }
    }

    // Sync members: figure out adds and removes
    const currentMembers = activeGroup.members.filter((id) => id !== user.id);
    const toAdd = editGroupMembers.filter((id) => !currentMembers.includes(id));
    const toRemove = currentMembers.filter((id) => !editGroupMembers.includes(id));

    if (toRemove.length > 0) {
      const { error } = await supabase
        .from('expense_group_members')
        .delete()
        .eq('group_id', activeGroup.id)
        .in('user_id', toRemove);
      if (error) { toast({ title: 'Failed to remove members', description: error.message, variant: 'destructive' }); }
    }

    if (toAdd.length > 0) {
      const { error } = await supabase
        .from('expense_group_members')
        .insert(toAdd.map((uid) => ({ group_id: activeGroup.id, user_id: uid })));
      if (error) { toast({ title: 'Failed to add members', description: error.message, variant: 'destructive' }); }
    }

    setSavingEdit(false);
    setShowEditGroup(false);
    toast({ title: 'Group updated! ✏️' });
    await loadData();
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    setDeletingGroup(true);
    const { error } = await supabase.from('expense_groups').delete().eq('id', activeGroup.id);
    setDeletingGroup(false);
    if (error) { toast({ title: 'Failed to delete group', description: error.message, variant: 'destructive' }); return; }
    setShowDeleteConfirm(false);
    setActiveGroupId(null);
    toast({ title: 'Group deleted 🗑️' });
    await loadData();
  };

  const toggleGroupMember = (id: string) => setNewGroupMembers((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  const toggleEditMember = (id: string) => setEditGroupMembers((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const handleAddExpense = async () => {
    if (!user || !newExpense.title.trim() || !newExpense.amount || !newExpense.paidBy) { toast({ title: 'Please fill all required fields', variant: 'destructive' }); return; }
    setSubmittingExpense(true);
    const { error } = await supabase.from('expenses').insert({
      created_by: user.id, title: newExpense.title, amount: Number(newExpense.amount),
      paid_by: newExpense.paidBy, split_with: newExpense.splitWith, status: 'pending',
      payment_method: 'upi', group_id: activeGroupId || null,
    });
    setSubmittingExpense(false);
    if (error) { toast({ title: 'Expense creation failed', description: error.message, variant: 'destructive' }); return; }
    setNewExpense({ title: '', amount: '', paidBy: user.id, splitWith: [] });
    setShowAddExpense(false);
    toast({ title: 'Expense added! 💰' });
    await loadData();
  };

  const toggleFriend = (id: string) => setNewExpense((prev) => ({ ...prev, splitWith: prev.splitWith.includes(id) ? prev.splitWith.filter((f) => f !== id) : [...prev.splitWith, id] }));

  const openAddExpense = () => {
    const memberIds = activeGroup ? activeGroup.members.filter((id) => id !== user?.id) : [];
    setNewExpense({ title: '', amount: '', paidBy: user?.id || '', splitWith: memberIds });
    setShowAddExpense(true);
  };

  const handlePayUPI = () => { setUpiForm((prev) => ({ ...prev, amount: Math.max(1, Math.round(youOwe)).toString() })); setShowUPIModal(true); };

  const handleUPIPayment = () => {
    if (!upiForm.upiId.trim()) { toast({ title: 'Enter UPI ID', variant: 'destructive' }); return; }
    const amount = Number(upiForm.amount || 0);
    if (!amount || amount <= 0) { toast({ title: 'Enter valid amount', variant: 'destructive' }); return; }
    window.location.href = `upi://pay?pa=${encodeURIComponent(upiForm.upiId)}&pn=${encodeURIComponent('TripSync Settlement')}&am=${amount}&cu=INR&tn=${encodeURIComponent(upiForm.note || 'Trip settlement')}`;
    setShowUPIModal(false);
    toast({ title: `Opening ${upiForm.app}`, description: 'UPI payment request initiated.' });
  };

  const handleSendReminders = async () => {
    if (!user) return;
    const targetIds = [...new Set(filteredExpenses.flatMap((e) => e.split_with || []).filter((id) => id !== user.id))];
    if (!targetIds.length) { toast({ title: 'No users to remind' }); return; }
    try {
      const { error } = await supabase.functions.invoke('send-reminders', { body: { target_ids: targetIds, message: reminderMessage } });
      if (error) throw error;
      setShowReminder(false);
      toast({ title: 'Reminders sent 🔔' });
    } catch (err: any) { toast({ title: 'Reminder failed', description: err?.message || 'Try again', variant: 'destructive' }); }
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-sm font-medium mb-6"><Wallet className="w-4 h-4" />Smart Expense Management</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">Group <span className="text-gradient">Expense Split</span></h2>
          <p className="text-lg text-muted-foreground">Form groups with your followers and split expenses easily.</p>
        </div>

        {/* Group Selector */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <button onClick={() => setActiveGroupId(null)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeGroupId ? 'gradient-primary text-white shadow-glow' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>All Expenses</button>
          {groups.map((g) => (
            <button key={g.id} onClick={() => setActiveGroupId(g.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeGroupId === g.id ? 'gradient-primary text-white shadow-glow' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
              <UsersRound className="w-3.5 h-3.5" />{g.name}<span className="text-xs opacity-70">({g.members.length})</span>
            </button>
          ))}
          <button onClick={() => setShowCreateGroup(true)} className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-dashed border-primary/30">
            <Plus className="w-3.5 h-3.5" />New Group
          </button>
        </div>

        {/* Active Group Info with Edit/Delete */}
        {activeGroupId && activeGroup && (
          <div className="mb-6 p-4 travel-card bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"><UsersRound className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="font-semibold text-foreground">{activeGroup.name}</h3>
                <p className="text-xs text-muted-foreground">{activeGroup.members.map((id) => id === user?.id ? 'You' : (profileNames[id] || 'User')).join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">{activeGroup.members.length} members</span>
              {isGroupOwner && (
                <>
                  <button onClick={openEditGroup} className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors" title="Edit Group"><Pencil className="w-4 h-4 text-foreground" /></button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors" title="Delete Group"><Trash2 className="w-4 h-4 text-destructive" /></button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-success/5">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="text-xl font-semibold text-foreground">{activeGroup ? activeGroup.name + ' Expenses' : 'Trip Expenses'}</h3><p className="text-muted-foreground">Shared among {activeGroupId ? 'group members' : 'real users'}</p></div>
                <Button onClick={openAddExpense} variant="outline" size="sm" className="rounded-full"><Plus className="w-4 h-4 mr-1" />Add Expense</Button>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-6 bg-muted/50 rounded-2xl text-center"><p className="text-muted-foreground mb-1">Total Spent</p><p className="text-3xl font-bold text-foreground">₹{Math.round(totalExpense).toLocaleString()}</p></div>
                <div className="p-6 bg-destructive/10 rounded-2xl text-center"><p className="text-muted-foreground mb-1 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" />You Owe</p><p className="text-3xl font-bold text-destructive">₹{Math.round(youOwe).toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">pending only</p></div>
                <div className="p-6 bg-success/10 rounded-2xl text-center"><p className="text-muted-foreground mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />You're Owed</p><p className="text-3xl font-bold text-success">₹{Math.round(youAreOwed).toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">pending only</p></div>
                <div className={`p-6 rounded-2xl text-center ${netBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}><p className="text-muted-foreground mb-1 flex items-center justify-center gap-1"><Scale className="w-3 h-3" />Net Balance</p><p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>{netBalance >= 0 ? '+' : '-'}₹{Math.abs(Math.round(netBalance)).toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">{netBalance >= 0 ? "you're ahead" : 'you owe more'}</p></div>
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
              {filteredExpenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses yet.{activeGroupId ? ' Add one for this group!' : ''}</p> : filteredExpenses.map((expense) => (
                <div key={expense.id} className="p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expense.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'}`}>
                        {expense.status === 'paid' ? <Check className="w-5 h-5 text-success" /> : <Clock className="w-5 h-5 text-warning" />}
                      </div>
                      <div><h4 className="font-medium text-foreground text-sm">{expense.title}</h4><p className="text-xs text-muted-foreground">by {profileNames[expense.paid_by] || 'User'}</p></div>
                    </div>
                    <span className="font-bold text-foreground">₹{Number(expense.amount).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Your share: ₹{Math.round(Number(expense.amount) / ((expense.split_with?.length || 0) + 1)).toLocaleString()}
                    {user && expense.paid_by !== user.id && (expense.split_with || []).includes(user.id) && expense.status !== 'paid' && <span className="text-destructive ml-1">(you owe this)</span>}
                    {user && expense.paid_by === user.id && (expense.split_with || []).length > 0 && expense.status !== 'paid' && <span className="text-success ml-1">(others owe you ₹{Math.round(Number(expense.amount) * (expense.split_with.length / ((expense.split_with.length || 0) + 1))).toLocaleString()})</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />Split: {(expense.split_with?.length || 0) + 1}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${expense.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{expense.status === 'paid' ? 'Settled' : 'Pending'}</span>
                      {expense.status !== 'paid' && user && (expense.paid_by === user.id || expense.split_with?.includes(user.id)) && (
                        <button onClick={() => handleSettle(expense.id)} disabled={settlingId === expense.id} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/20 text-success hover:bg-success/30 transition-colors disabled:opacity-50">
                          {settlingId === expense.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}Settle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><UsersRound className="w-5 h-5 text-primary" />Create Expense Group</h2>
              <button onClick={() => setShowCreateGroup(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="block text-sm font-medium text-foreground mb-2">Group Name</label><input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g. Goa Trip 2025" className="input-field" /></div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Add Members (from followers)</label>
                {friends.length === 0 ? <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-xl">You need accepted followers to create a group.</p> : (
                  <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto p-1">
                    {friends.map((f) => (
                      <button key={f.id} onClick={() => toggleGroupMember(f.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${newGroupMembers.includes(f.id) ? 'gradient-primary text-white shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                        {newGroupMembers.includes(f.id) ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}{f.name}
                      </button>
                    ))}
                  </div>
                )}
                {newGroupMembers.length > 0 && <p className="text-xs text-muted-foreground mt-2">{newGroupMembers.length + 1} members (including you)</p>}
              </div>
              <Button onClick={handleCreateGroup} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold" disabled={creatingGroup || !newGroupName.trim() || newGroupMembers.length === 0}>
                {creatingGroup ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UsersRound className="w-5 h-5 mr-2" />Create Group</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroup && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" />Edit Group</h2>
              <button onClick={() => setShowEditGroup(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="block text-sm font-medium text-foreground mb-2">Group Name</label><input type="text" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="input-field" /></div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Members</label>
                <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto p-1">
                  {friends.map((f) => (
                    <button key={f.id} onClick={() => toggleEditMember(f.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${editGroupMembers.includes(f.id) ? 'gradient-primary text-white shadow-md' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                      {editGroupMembers.includes(f.id) ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}{f.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{editGroupMembers.length + 1} members (including you)</p>
              </div>
              <Button onClick={handleSaveEditGroup} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold" disabled={savingEdit || !editGroupName.trim()}>
                {savingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 mr-2" />Save Changes</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirm */}
      {showDeleteConfirm && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-3"><Trash2 className="w-7 h-7 text-destructive" /></div>
              <h3 className="text-lg font-bold text-foreground">Delete "{activeGroup.name}"?</h3>
              <p className="text-sm text-muted-foreground mt-1">This will remove the group. Expenses linked to it will remain but won't be grouped.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleDeleteGroup} className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deletingGroup}>
                {deletingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border"><h2 className="text-lg font-bold text-foreground">Add Expense</h2><button onClick={() => setShowAddExpense(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              {activeGroupId && activeGroup && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl text-sm text-primary"><UsersRound className="w-4 h-4" />Adding to: {activeGroup.name}</div>
              )}
              <div><label className="block text-sm font-medium text-foreground mb-2">Expense Title</label><input type="text" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="e.g. Dinner" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-2">Amount (₹)</label><input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0" className="input-field" /></div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Paid By</label>
                <div className="flex gap-2 flex-wrap">
                  {[{ id: user?.id || '', name: 'You' }, ...activeGroupMembers].map((f) => (
                    <button key={f.id} onClick={() => setNewExpense({ ...newExpense, paidBy: f.id })} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${newExpense.paidBy === f.id ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>{f.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Split With {activeGroupId && <span className="text-xs text-muted-foreground">(group members pre-selected)</span>}</label>
                <div className="flex gap-2 flex-wrap">
                  {activeGroupMembers.map((f) => (
                    <button key={f.id} onClick={() => toggleFriend(f.id)} className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${newExpense.splitWith.includes(f.id) ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}><UserPlus className="w-3 h-3" />{f.name}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold" disabled={submittingExpense}>{submittingExpense ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-2" />Add Expense</>}</Button>
            </div>
          </div>
        </div>
      )}

      {/* UPI Modal */}
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

      {/* Reminder Modal */}
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
