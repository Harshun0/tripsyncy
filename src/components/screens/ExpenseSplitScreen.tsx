import React from 'react';
import { ArrowLeft, Plus, Wallet, ArrowRight, Check, Clock, Send, Users } from 'lucide-react';
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
      <div className="gradient-primary px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">Group Expenses</h1>
        <button className="ml-auto p-2 text-white/80 hover:text-white transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Trip Summary */}
      <div className="px-4 py-4">
        <div className="travel-card bg-gradient-to-br from-card to-muted/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="You"
                className="w-10 h-10 rounded-full border-2 border-background object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                alt="Arjun"
                className="w-10 h-10 rounded-full border-2 border-background object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="Priya"
                className="w-10 h-10 rounded-full border-2 border-background object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Goa Trip 2024</h3>
              <p className="text-xs text-muted-foreground">3 members</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="font-bold text-foreground">₹{totalExpense.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">You Owe</p>
              <p className="font-bold text-destructive">₹{youOwe.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">You're Owed</p>
              <p className="font-bold text-success">₹{youAreOwed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Owes Whom */}
      <div className="px-4 mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">Who Owes Whom</h3>
        
        <div className="space-y-3">
          <div className="travel-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">You</span>
            </div>
            <div className="flex items-center gap-2 text-destructive">
              <ArrowRight className="w-5 h-5" />
              <span className="font-bold">₹2,800</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                alt="Arjun"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">Arjun</span>
            </div>
          </div>

          <div className="travel-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="Priya"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">Priya</span>
            </div>
            <div className="flex items-center gap-2 text-success">
              <ArrowRight className="w-5 h-5" />
              <span className="font-bold">₹1,100</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">All Expenses</h3>
        
        <div className="space-y-3">
          {dummyExpenses.map((expense) => (
            <div key={expense.id} className="travel-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    expense.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'
                  }`}>
                    {expense.status === 'paid' ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{expense.title}</h4>
                    <p className="text-xs text-muted-foreground">Paid by {expense.paidBy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₹{expense.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{expense.date}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  Split with: {expense.splitWith.join(', ')}
                </div>
                <span className={`chip text-xs ${
                  expense.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
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
        <Button className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow">
          <Wallet className="w-5 h-5 mr-2" />
          Pay via UPI
        </Button>
        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary">
          <Send className="w-5 h-5 mr-2" />
          Send Reminders
        </Button>
      </div>
    </div>
  );
};

export default ExpenseSplitScreen;
