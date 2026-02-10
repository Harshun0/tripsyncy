import React, { useState } from 'react';
import { Plus, Wallet, ArrowRight, Check, Clock, Send, Users, CreditCard, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dummyExpenses } from '@/data/dummyProfiles';
import { toast } from '@/hooks/use-toast';

const ExpenseSection: React.FC = () => {
  const [expenses, setExpenses] = useState(dummyExpenses);
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const youOwe = 3800;
  const youAreOwed = 1200;

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: 'You', splitWith: [] as string[] });

  const friendsList = ['Arjun', 'Priya', 'Ananya', 'Rahul', 'Sneha'];

  const handleAddExpense = () => {
    if (!newExpense.title.trim() || !newExpense.amount) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    const expense = {
      id: Date.now().toString(),
      title: newExpense.title,
      amount: parseInt(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitWith: newExpense.splitWith,
      status: 'pending' as const,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
    setExpenses(prev => [expense, ...prev]);
    setNewExpense({ title: '', amount: '', paidBy: 'You', splitWith: [] });
    setShowAddExpense(false);
    toast({ title: 'Expense added! 💰', description: `₹${expense.amount.toLocaleString()} for ${expense.title}` });
  };

  const toggleFriend = (name: string) => {
    setNewExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(name)
        ? prev.splitWith.filter(f => f !== name)
        : [...prev.splitWith, name],
    }));
  };

  const handlePayUPI = () => {
    setShowUPIModal(true);
  };

  const handleUPIPayment = (app: string) => {
    const upiUrl = `upi://pay?pa=tripsync@upi&pn=TripSync&am=${youOwe}&cu=INR&tn=Trip%20Expense%20Settlement`;
    const link = document.createElement('a');
    link.href = upiUrl;
    link.click();
    setShowUPIModal(false);
    toast({ title: `Opening ${app} 💳`, description: `Initiating payment of ₹${youOwe.toLocaleString()} via ${app}.` });
  };

  const handleSendReminders = () => {
    if (!reminderMessage.trim()) {
      setShowReminder(true);
      return;
    }
    setShowReminder(false);
    setReminderMessage('');
    toast({ title: 'Reminders Sent! 🔔', description: `Message sent to group: "${reminderMessage}"` });
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-sm font-medium mb-6">
            <Wallet className="w-4 h-4" />
            Smart Expense Management
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Group <span className="text-gradient">Expense Split</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Easily split trip expenses, track payments, and settle up with UPI integration.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-success/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face" alt="You" className="w-12 h-12 rounded-full border-3 border-background object-cover" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" alt="Arjun" className="w-12 h-12 rounded-full border-3 border-background object-cover" />
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face" alt="Priya" className="w-12 h-12 rounded-full border-3 border-background object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Goa Trip 2024</h3>
                    <p className="text-muted-foreground">3 members</p>
                  </div>
                </div>
                <Button onClick={() => setShowAddExpense(true)} variant="outline" size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Expense
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-muted/50 rounded-2xl text-center">
                  <p className="text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-foreground">₹{totalExpense.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-destructive/10 rounded-2xl text-center">
                  <p className="text-muted-foreground mb-1">You Owe</p>
                  <p className="text-3xl font-bold text-destructive">₹{youOwe.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-success/10 rounded-2xl text-center">
                  <p className="text-muted-foreground mb-1">You're Owed</p>
                  <p className="text-3xl font-bold text-success">₹{youAreOwed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="travel-card p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Who Owes Whom</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face" alt="You" className="w-12 h-12 rounded-full object-cover" />
                    <span className="font-medium text-foreground">You</span>
                  </div>
                  <div className="flex items-center gap-3 text-destructive">
                    <ArrowRight className="w-6 h-6" />
                    <span className="text-xl font-bold">₹2,800</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" alt="Arjun" className="w-12 h-12 rounded-full object-cover" />
                    <span className="font-medium text-foreground">Arjun</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face" alt="Priya" className="w-12 h-12 rounded-full object-cover" />
                    <span className="font-medium text-foreground">Priya</span>
                  </div>
                  <div className="flex items-center gap-3 text-success">
                    <ArrowRight className="w-6 h-6" />
                    <span className="text-xl font-bold">₹1,100</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face" alt="You" className="w-12 h-12 rounded-full object-cover" />
                    <span className="font-medium text-foreground">You</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button onClick={handlePayUPI} className="flex-1 h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay via UPI
                </Button>
                <Button onClick={() => setShowReminder(true)} variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary">
                  <Send className="w-5 h-5 mr-2" />
                  Send Reminders
                </Button>
              </div>
            </div>
          </div>

          <div className="travel-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Expenses</h3>
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
                        <p className="text-xs text-muted-foreground">by {expense.paidBy}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      Split: {expense.splitWith.length + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{expense.amount.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${expense.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {expense.status === 'paid' ? 'Settled' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expense Title</label>
                <input type="text" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="e.g. Dinner at Beach Shack" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount (₹)</label>
                <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Paid By</label>
                <div className="flex gap-2 flex-wrap">
                  {['You', ...friendsList.slice(0, 3)].map(name => (
                    <button key={name} onClick={() => setNewExpense({ ...newExpense, paidBy: name })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${newExpense.paidBy === name ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Split With</label>
                <div className="flex gap-2 flex-wrap">
                  {friendsList.map(name => (
                    <button key={name} onClick={() => toggleFriend(name)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${newExpense.splitWith.includes(name) ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      <UserPlus className="w-3 h-3" />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Pay ₹{youOwe.toLocaleString()}</h2>
              <button onClick={() => setShowUPIModal(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Choose your UPI app to complete the payment</p>
              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Amazon Pay'].map(app => (
                <button key={app} onClick={() => handleUPIPayment(app)}
                  className="w-full p-4 bg-muted/50 rounded-2xl flex items-center gap-4 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground">{app}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Send Reminder</h2>
              <button onClick={() => setShowReminder(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Send a payment reminder to the Goa Trip 2024 group</p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Hey! Just a friendly reminder to settle the pending expenses 💰"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">Sending to:</p>
                <div className="flex gap-2">
                  {['Arjun', 'Priya'].map(name => (
                    <span key={name} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">{name}</span>
                  ))}
                </div>
              </div>
              <Button onClick={() => { handleSendReminders(); }} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                <Send className="w-5 h-5 mr-2" />
                Send Reminder
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpenseSection;
