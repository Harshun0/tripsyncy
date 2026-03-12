import React from 'react';
import { ArrowLeft, Plus, Wallet, ArrowRight, Check, Clock, Send, Users, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dummyExpenses } from '@/data/dummyProfiles';

interface ExpenseSplitScreenProps {
  onBack: () => void;
}

const ExpenseSplitScreen: React.FC<ExpenseSplitScreenProps> = ({ onBack }) => {
  const totalExpense = dummyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const youOwe = 3800;
  const youAreOwed = 1200;

  return (
    <div className="h-full bg-background pb-4">
      {/* Header */}
      <div className="gradient-primary px-4 py-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <button onClick={onBack} className="p-2 -ml-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors relative z-10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Receipt className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-primary-foreground font-display">Group Expenses</h1>
        </div>
        <button className="ml-auto p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors relative z-10 w-9 h-9 bg-primary-foreground/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Trip Summary */}
      <div className="px-4 py-4">
        <div className="travel-card-nature bg-gradient-to-br from-card to-muted/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="You"
                className="w-11 h-11 rounded-xl border-[2.5px] border-background object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                alt="Arjun"
                className="w-11 h-11 rounded-xl border-[2.5px] border-background object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="Priya"
                className="w-11 h-11 rounded-xl border-[2.5px] border-background object-cover shadow-sm"
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground font-display">Goa Trip 2024</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> 3 members</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-muted/40 rounded-2xl border border-border/30">
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-medium">Total</p>
              <p className="font-bold text-foreground text-lg">₹{totalExpense.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-destructive/8 rounded-2xl border border-destructive/15">
              <p className="text-[10px] text-destructive/80 mb-1 uppercase tracking-wide font-medium">You Owe</p>
              <p className="font-bold text-destructive text-lg">₹{youOwe.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-success/8 rounded-2xl border border-success/15">
              <p className="text-[10px] text-success/80 mb-1 uppercase tracking-wide font-medium">You're Owed</p>
              <p className="font-bold text-success text-lg">₹{youAreOwed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Owes Whom */}
      <div className="px-4 mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-3 font-display">Who Owes Whom</h3>
        
        <div className="space-y-3">
          <div className="travel-card-nature flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-[2px] gradient-sunset rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                  alt="You"
                  className="w-10 h-10 rounded-[10px] object-cover border-2 border-background"
                />
              </div>
              <span className="font-medium text-sm">You</span>
            </div>
            <div className="flex items-center gap-2 text-destructive">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="font-bold">₹2,800</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                alt="Arjun"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="font-medium text-sm">Arjun</span>
            </div>
          </div>

          <div className="travel-card-nature flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-[2px] gradient-primary rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                  alt="Priya"
                  className="w-10 h-10 rounded-[10px] object-cover border-2 border-background"
                />
              </div>
              <span className="font-medium text-sm">Priya</span>
            </div>
            <div className="flex items-center gap-2 text-success">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="font-bold">₹1,100</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="You"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="font-medium text-sm">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-foreground mb-3 font-display">All Expenses</h3>
        
        <div className="space-y-3">
          {dummyExpenses.map((expense, idx) => (
            <div key={expense.id} className="travel-card-nature animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    expense.status === 'paid' ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'
                  }`}>
                    {expense.status === 'paid' ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{expense.title}</h4>
                    <p className="text-xs text-muted-foreground">Paid by {expense.paidBy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₹{expense.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">{expense.date}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2.5 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  Split with: {expense.splitWith.join(', ')}
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${
                  expense.status === 'paid' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
                }`}>
                  {expense.status === 'paid' ? 'Settled' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 space-y-3">
        <Button className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-xl transition-shadow">
          <Wallet className="w-5 h-5 mr-2" />
          Pay via UPI
        </Button>
        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-colors">
          <Send className="w-5 h-5 mr-2" />
          Send Reminders
        </Button>
      </div>
    </div>
  );
};

export default ExpenseSplitScreen;
