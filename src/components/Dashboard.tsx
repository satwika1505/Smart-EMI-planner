import React from 'react';
import EMICalculator from './EMICalculator';
import { Loan, Reminder } from '../types';
import { CreditCard, TrendingUp, Calendar, Trash2, Clock, ChevronRight, CheckCircle2, Bell, Check, Database } from 'lucide-react';

interface DashboardProps {
  loans: Loan[];
  onAddLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onCloseLoan: (id: string) => void;
  onViewLoan: (loan: Loan) => void;
  reminders: Reminder[];
  onEnableNotifications: () => void;
  onLoadDemoData?: () => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  loans, 
  onAddLoan, 
  reminders, 
  onDeleteLoan, 
  onViewLoan, 
  onCloseLoan,
  onEnableNotifications,
  onLoadDemoData,
  userName
}) => {
  
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "default"
  );

  const totalPrincipal = loans.reduce((acc, loan) => acc + loan.principal, 0);
  const totalMonthlyEMI = loans.reduce((acc, loan) => acc + loan.emi, 0);
  
  const handleNotificationClick = () => {
    onEnableNotifications();
    // Small delay to allow prompt to close and permission to update
    setTimeout(() => {
        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);
        }
    }, 1000);
  };

  const getRemainingTime = (startDateStr: string, months: number) => {
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setMonth(start.getMonth() + months);
    const now = new Date();
    
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); 
    
    if (end < now) return "Ended";
    if (diffMonths > 12) return `${(diffMonths / 12).toFixed(1)} years left`;
    return `${diffMonths} months left`;
  };

  const getNextPaymentDate = (loanId: string) => {
    // Filter strictly for payments
    const loanReminders = reminders.filter(r => r.loanId === loanId && !r.isPaid && r.type === 'payment');
    if (loanReminders.length === 0) return null;
    // Sort by date to find the soonest
    const next = loanReminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    return new Date(next.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getLastPaymentInfo = (loanId: string) => {
    const paidReminders = reminders.filter(r => r.loanId === loanId && r.isPaid && r.type === 'payment' && r.paidAt);
    if (paidReminders.length === 0) return null;
    
    // Sort descending by paidAt
    const lastPaid = paidReminders.sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())[0];
    return new Date(lastPaid.paidAt!).toLocaleString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    });
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <header className="mb-8 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight uppercase">
            HELLO, {userName}!!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
            Your wealth health at a glance
          </p>
        </div>
        
        {notificationPermission === 'default' && (
             <button 
                id="tour-notifications"
                onClick={handleNotificationClick} 
                className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors shadow-sm"
             >
                <Bell size={18} /> Enable Alerts
             </button>
        )}
      </header>

      {/* Hero Stats Row - Modern Gradient Cards */}
      <div id="tour-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Total Debt Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30">
           {/* Abstract Decoration */}
           <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
           <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-24 h-24 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
           
           <div className="relative z-10 flex items-center space-x-4">
             <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
               <CreditCard size={28} className="text-white" />
             </div>
             <div>
               <p className="text-blue-100 text-sm font-medium mb-1 tracking-wide uppercase opacity-90">Total Principal</p>
               <h3 className="text-3xl font-bold tracking-tight">₹{totalPrincipal.toLocaleString('en-IN')}</h3>
             </div>
           </div>
        </div>

        {/* Monthly EMI Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-700 rounded-2xl p-6 text-white shadow-lg shadow-fuchsia-200 dark:shadow-none transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/30">
           <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
           
           <div className="relative z-10 flex items-center space-x-4">
             <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
               <TrendingUp size={28} className="text-white" />
             </div>
             <div>
               <p className="text-violet-100 text-sm font-medium mb-1 tracking-wide uppercase opacity-90">Monthly EMI</p>
               <h3 className="text-3xl font-bold tracking-tight">₹{totalMonthlyEMI.toLocaleString('en-IN')}</h3>
             </div>
           </div>
        </div>

        {/* Pending EMIs Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-300 opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
           
           <div className="relative z-10 flex items-center space-x-4">
             <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
               <Calendar size={28} className="text-white" />
             </div>
             <div>
               <p className="text-amber-100 text-sm font-medium mb-1 tracking-wide uppercase opacity-90">Pending EMIs</p>
               <h3 className="text-3xl font-bold tracking-tight">{reminders.filter(r => !r.isPaid && r.type === 'payment').length}</h3>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: EMI Calculator */}
        <div id="tour-calculator" className="lg:col-span-2">
          <div className="transition-all duration-700 ease-out transform translate-y-0 opacity-100">
             <EMICalculator onSaveLoan={onAddLoan} />
          </div>
        </div>

        {/* Right Column: Loan List Summary */}
        <div className="space-y-8">
          
          {/* Active Loans Summary Card */}
          <div id="tour-active-loans" className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/60 group">
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Active Loans
              </h3>
              <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                {loans.length} Active
              </span>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {loans.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 mx-2">
                  <p className="font-medium">No active loans.</p>
                  <p className="text-xs mt-1 mb-4">Add one using the calculator.</p>
                  {onLoadDemoData && (
                      <button 
                        onClick={onLoadDemoData}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                      >
                         <Database size={14} /> Load Demo Data
                      </button>
                  )}
                </div>
              ) : (
                loans.map((loan, idx) => {
                  const nextPayment = getNextPaymentDate(loan.id);
                  const lastPaymentTimestamp = getLastPaymentInfo(loan.id);
                  return (
                    <div 
                      key={loan.id} 
                      onClick={() => onViewLoan(loan)}
                      className="relative flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300 hover:shadow-md cursor-pointer group/item"
                      style={{ animation: `fadeIn 0.5s ease-out forwards ${idx * 100}ms`, opacity: 0 }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover/item:text-primary transition-colors flex items-center gap-2">
                          {loan.name}
                          <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all"/>
                        </p>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">{loan.type}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Clock size={10} />
                              {getRemainingTime(loan.startDate, loan.tenureMonths)}
                            </span>
                          </div>
                          {nextPayment && (
                             <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-1">
                               <Calendar size={10} /> Next Due: {nextPayment}
                             </p>
                          )}
                          {lastPaymentTimestamp && (
                             <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                               <Check size={10} /> Paid: {lastPaymentTimestamp}
                             </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right pl-4 flex flex-col items-end gap-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100">₹{loan.emi.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <button 
                              onClick={(e) => { e.stopPropagation(); onCloseLoan(loan.id); }}
                              className="text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 px-2 py-1 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-green-100 dark:hover:border-green-800"
                              title="Mark as Paid / Close Loan"
                           >
                              <CheckCircle2 size={12} /> Paid
                           </button>
                           <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteLoan(loan.id); }}
                              className="text-xs text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors flex items-center gap-1"
                              title="Remove Permanently"
                           >
                              <Trash2 size={12} />
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;