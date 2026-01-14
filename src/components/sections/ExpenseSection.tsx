import React from 'react';
import { Plus, Wallet, ArrowRight, Check, Clock, Send, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dummyExpenses } from '@/data/dummyProfiles';

const ExpenseSection: React.FC = () => {
  const totalExpense = dummyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const youOwe = 3800;
  const youAreOwed = 1200;

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-sm font-medium mb-6">
            <Wallet className="w-4 h-4" />
            Smart Expense Management
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Group <span className="text-gradient">Expense Split</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Easily split trip expenses, track payments, and settle up with UPI integration. Never worry about who owes whom.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Expense Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip Summary Card */}
            <div className="travel-card p-8 bg-gradient-to-br from-card to-success/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                      alt="You"
                      className="w-12 h-12 rounded-full border-3 border-background object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                      alt="Arjun"
                      className="w-12 h-12 rounded-full border-3 border-background object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face"
                      alt="Priya"
                      className="w-12 h-12 rounded-full border-3 border-background object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Goa Trip 2024</h3>
                    <p className="text-muted-foreground">3 members</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
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

            {/* Who Owes Whom */}
            <div className="travel-card p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Who Owes Whom</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                      alt="You"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium text-foreground">You</span>
                  </div>
                  <div className="flex items-center gap-3 text-destructive">
                    <ArrowRight className="w-6 h-6" />
                    <span className="text-xl font-bold">₹2,800</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                      alt="Arjun"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium text-foreground">Arjun</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face"
                      alt="Priya"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium text-foreground">Priya</span>
                  </div>
                  <div className="flex items-center gap-3 text-success">
                    <ArrowRight className="w-6 h-6" />
                    <span className="text-xl font-bold">₹1,100</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                      alt="You"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium text-foreground">You</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button className="flex-1 h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay via UPI
                </Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary">
                  <Send className="w-5 h-5 mr-2" />
                  Send Reminders
                </Button>
              </div>
            </div>
          </div>

          {/* Expenses List Sidebar */}
          <div className="travel-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Expenses</h3>
            
            <div className="space-y-4">
              {dummyExpenses.map((expense) => (
                <div key={expense.id} className="p-4 bg-muted/50 rounded-2xl">
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        expense.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
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
    </section>
  );
};

export default ExpenseSection;
