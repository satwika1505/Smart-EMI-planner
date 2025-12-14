import React, { useState } from 'react';
import { Loan, Reminder } from '../types';
import { 
  ArrowLeft, Circle, CheckCircle, Lock 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

interface LoanDetailsProps {
  loan: Loan;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  onBack: () => void;
}

const LoanDetails: React.FC<LoanDetailsProps> = ({ 
  loan, reminders, setReminders, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');
  
  // Derived Data
  const loanReminders = reminders.filter(r => r.loanId === loan.id);
  const completedPayments = loanReminders.filter(r => r.loanId === loan.id && r.isPaid && r.type === 'payment');
  const allPayments = loanReminders.filter(r => r.loanId === loan.id && r.type === 'payment').sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const totalPaidAmount = completedPayments.length * loan.emi;
  const totalPayable = loan.emi * loan.tenureMonths;
  const progressPercentage = (completedPayments.length / loan.tenureMonths) * 100;

  const markAsPaid = (id: string) => {
    setReminders(prev => prev.map(r => {
        // Only allow marking as paid if it's not already paid (No Undo)
        if (r.id === id && !r.isPaid) { 
            return { 
                ...r, 
                isPaid: true,
                paidAt: new Date().toISOString()
            }; 
        } 
        return r;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{loan.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold">{loan.type}</span>
            <span>Started {new Date(loan.startDate).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Outstanding Balance</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            ₹{(totalPayable - totalPaidAmount).toLocaleString('en-IN')}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">{progressPercentage.toFixed(1)}% Paid</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Monthly EMI</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">₹{loan.emi.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-2">Next due date: {
            loanReminders.filter(r => !r.isPaid && r.type === 'payment')
            .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || 'Completed'
          }</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Tenure Remaining</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            {Math.max(0, loan.tenureMonths - completedPayments.length)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Months</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6">
        {['overview', 'schedule'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab 
                ? 'text-primary' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'schedule' ? 'EMI Schedule' : tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Payment Distribution</h3>
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Paid', value: totalPaidAmount },
                          { name: 'Remaining', value: totalPayable - totalPaidAmount }
                        ]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#4f46e5" />
                        <Cell fill="#e2e8f0" />
                      </Pie>
                      <ReTooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                    </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                   <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Paid (₹{totalPaidAmount.toLocaleString('en-IN')})</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Remaining</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
               <h3 className="font-bold text-slate-800 dark:text-white">Tips</h3>
               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                 <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    💡 <strong>Pro Tip:</strong> Paying just one extra EMI every year can reduce your loan tenure by up to 20%! Check the schedule tab to track your regular payments.
                 </p>
               </div>
             </div>
          </div>
        )}

        {/* SCHEDULE / HISTORY TAB */}
        {activeTab === 'schedule' && (
          <div className="max-w-2xl mx-auto pt-4">
             <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-6 py-4">
                {/* Future Start Point */}
                <div className="relative pl-8">
                   <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800"></div>
                   <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 pt-0.5">Loan Started: {new Date(loan.startDate).toLocaleDateString()}</p>
                </div>

                {allPayments.length === 0 ? (
                   <div className="pl-8 text-slate-400 italic">No payments generated.</div>
                ) : (
                  allPayments.map((payment, idx) => {
                      const isPastDue = !payment.isPaid && new Date(payment.dueDate) < new Date();
                      // Logic to prevent skipping: 
                      // 1. Current payment is NOT paid
                      // 2. Previous payment exists and is NOT paid
                      const isLocked = !payment.isPaid && idx > 0 && !allPayments[idx - 1].isPaid;
                      
                      return (
                        <div key={payment.id} className="relative pl-8 group">
                        <div className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm transition-colors ${
                            payment.isPaid ? 'bg-green-500' : isPastDue ? 'bg-red-400' : 'bg-slate-200 dark:bg-slate-700'
                        }`}></div>
                        
                        <div className={`
                            p-4 rounded-xl border shadow-sm flex justify-between items-center transition-all duration-300
                            ${payment.isPaid 
                                ? 'bg-white dark:bg-slate-800 border-green-100 dark:border-green-900/30' 
                                : isLocked
                                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-75'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900'}
                        `}>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => !payment.isPaid && !isLocked && markAsPaid(payment.id)}
                                    disabled={payment.isPaid || isLocked}
                                    className={`p-1 rounded-full transition-colors flex items-center justify-center ${
                                        payment.isPaid 
                                            ? 'text-green-500 cursor-default opacity-90' 
                                            : isLocked
                                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                : 'text-slate-300 hover:text-primary cursor-pointer'
                                    }`}
                                    title={isLocked ? "Complete previous EMIs first" : "Mark as paid"}
                                >
                                    {payment.isPaid ? <CheckCircle size={24} /> : (isLocked ? <Lock size={18} /> : <Circle size={24} />)}
                                </button>
                                <div>
                                    <p className={`font-bold ${payment.isPaid ? 'text-slate-600 dark:text-slate-400' : isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>{payment.title}</p>
                                    <p className={`text-xs ${isPastDue ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {isPastDue ? 'Overdue since ' : 'Due on '} {new Date(payment.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${payment.isPaid ? 'text-green-600 dark:text-green-400' : isLocked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-white'}`}>₹{loan.emi.toLocaleString('en-IN')}</p>
                                {payment.isPaid ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">Paid</span>
                                        {payment.paidAt && (
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">
                                                {new Date(payment.paidAt).toLocaleString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                        {isLocked ? 'Locked' : 'Pending'}
                                    </span>
                                )}
                            </div>
                        </div>
                        </div>
                      )
                  })
                )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoanDetails;