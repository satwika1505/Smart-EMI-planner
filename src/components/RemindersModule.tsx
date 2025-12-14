import React from 'react';

const RemindersModule: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Feature Removed</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
        Manual reminders have been removed. You will now receive automatic system notifications for your EMI payments.
      </p>
    </div>
  );
};

export default RemindersModule;