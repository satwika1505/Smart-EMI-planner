import React from 'react';
import { Loan } from '../types';
import { Archive, RotateCcw, Trash2, Calendar, CheckCircle } from 'lucide-react';

interface HistoryModuleProps {
  loans: Loan[]; // These should be filtered closed loans
  onRestoreLoan: (id: string) => void;
  onDeleteLoan: (id: string) => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ loans, onRestoreLoan, onDeleteLoan }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Archive className="text-slate-600 dark:text-slate-400" />
                Loan History
            </h1>
            <p className="text-slate-500 dark:text-slate-400">View and manage your completed and closed loans.</p>
        </div>
      </div>

      <div className="space-y-4">
        {loans.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
            <CheckCircle size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No History Yet</h3>
            <p className="text-slate-400 dark:text-slate-500">Mark active loans as 'Paid' to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {loans.map((loan) => (
              <div 
                key={loan.id} 
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all"
              >
                <div className="flex items-start space-x-4 mb-4 md:mb-0">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{loan.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">{loan.type}</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Closed: {loan.closedDate ? new Date(loan.closedDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Final Amount: </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(loan.emi * loan.tenureMonths).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-0">
                  <button 
                    onClick={() => onRestoreLoan(loan.id)}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium text-sm transition-colors"
                  >
                    <RotateCcw size={16} />
                    <span>Restore</span>
                  </button>
                  <button 
                    onClick={() => {
                        if(window.confirm('Are you sure you want to permanently delete this record?')) {
                            onDeleteLoan(loan.id);
                        }
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 font-medium text-sm transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModule;