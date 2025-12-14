import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LoanType, Loan } from '../types';
import { Save, RefreshCw, Table, X, TrendingUp, Wallet, Search } from 'lucide-react';

interface EMICalculatorProps {
  onSaveLoan: (loan: Loan) => void;
}

interface YearlyBreakdown {
  year: string;
  Principal: number;
  Interest: number;
  Balance: number;
}

const EMICalculator: React.FC<EMICalculatorProps> = ({ onSaveLoan }) => {
  const [amount, setAmount] = useState<number>(4120000);
  const [rate, setRate] = useState<number>(8);
  const [tenure, setTenure] = useState<number>(12); // Tenure in Years
  const [type, setType] = useState<LoanType>(LoanType.PERSONAL);
  const [loanName, setLoanName] = useState('');
  const [loanTypeSearch, setLoanTypeSearch] = useState('');
  
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownData, setBreakdownData] = useState<YearlyBreakdown[]>([]);

  useEffect(() => {
    calculate();
  }, [amount, rate, tenure]);

  const calculate = () => {
    if (!amount || !tenure) return; 

    const tenureMonths = Math.round(tenure * 12);
    let emiValue = 0;
    let totalPay = 0;
    let totalInt = 0;
    let yearlyData: YearlyBreakdown[] = [];

    // Handle 0% interest rate (Simple Division)
    if (rate === 0) {
        emiValue = amount / tenureMonths;
        totalPay = amount;
        totalInt = 0;
        
        let balance = amount;
        let currentYearPrincipal = 0;
        
        for (let i = 1; i <= tenureMonths; i++) {
            const principal = emiValue;
            balance -= principal;
            currentYearPrincipal += principal;

            if (i % 12 === 0 || i === tenureMonths) {
                yearlyData.push({
                    year: `Year ${Math.ceil(i/12)}`,
                    Principal: Math.round(currentYearPrincipal),
                    Interest: 0,
                    Balance: Math.max(0, Math.round(balance))
                });
                currentYearPrincipal = 0;
            }
        }
    } else {
        // Standard EMI Formula (Compound Interest-based)
        // E = P * r * (1 + r)^n / ((1 + r)^n - 1)
        const monthlyRate = rate / 12 / 100;
        emiValue = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        
        totalPay = emiValue * tenureMonths;
        totalInt = totalPay - amount;

        // Amortization Schedule (Reducing Balance)
        let balance = amount;
        let currentYearInterest = 0;
        let currentYearPrincipal = 0;

        for (let i = 1; i <= tenureMonths; i++) {
            const interest = balance * monthlyRate;
            const principal = emiValue - interest;
            balance -= principal;

            currentYearInterest += interest;
            currentYearPrincipal += principal;

            if (i % 12 === 0 || i === tenureMonths) {
                yearlyData.push({
                    year: `Year ${Math.ceil(i/12)}`,
                    Principal: Math.round(currentYearPrincipal),
                    Interest: Math.round(currentYearInterest),
                    Balance: Math.max(0, Math.round(balance))
                });
                currentYearInterest = 0;
                currentYearPrincipal = 0;
            }
        }
    }

    setEmi(Math.round(emiValue));
    setTotalPayment(Math.round(totalPay));
    setTotalInterest(Math.round(totalInt));
    setBreakdownData(yearlyData);
  };

  const handleSave = () => {
    const finalName = loanName.trim() || `My ${type} Loan`;
    
    const newLoan: Loan = {
      id: Date.now().toString(),
      name: finalName,
      type,
      principal: amount,
      rate,
      tenureMonths: Math.round(tenure * 12),
      startDate: new Date().toISOString(),
      emi,
      status: 'active'
    };
    onSaveLoan(newLoan);
    setLoanName('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmount(Number(rawValue));
  };

  const chartData = [
    { name: 'Principal Amount', value: amount },
    { name: 'Total Interest', value: totalInterest },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden h-full flex flex-col relative transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             EMI Calculator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan your loan before you commit</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => {setAmount(500000); setRate(10.5); setTenure(2);}}
                className="p-2 text-slate-400 hover:text-primary transition-colors"
                title="Reset Defaults"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Input Section */}
        <div className="p-6 lg:w-1/2 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700">
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Loan Name (Optional - for saving)</label>
              <input
                type="text"
                value={loanName}
                onChange={(e) => setLoanName(e.target.value)}
                placeholder="e.g. My New Car"
                className="w-full px-4 py-3 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Loan Type</label>
              
              <div className="relative mb-3">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search loan type..." 
                    value={loanTypeSearch}
                    onChange={(e) => setLoanTypeSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                 />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.values(LoanType)
                  .filter(t => t.toLowerCase().includes(loanTypeSearch.toLowerCase()))
                  .map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-3 text-sm font-semibold rounded-lg transition-all border ${
                      type === t 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 shadow-sm' 
                        : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Principal Amount
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-primary transition-colors">₹</span>
                  <input
                    type="text"
                    value={amount ? amount.toLocaleString('en-IN') : ''}
                    onChange={handleAmountChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">
                      Interest Rate (%)
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">
                      Tenure (Years)
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      />
                      <span className="absolute right-2 -bottom-6 text-xs text-slate-400 font-medium">
                        = {Math.round(tenure * 12)} Months
                      </span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-6 lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between">
          <div className="text-center mb-6">
            <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-wide">Monthly EMI</p>
            <h3 className="text-5xl font-black text-slate-700 dark:text-white">₹{emi.toLocaleString('en-IN')}</h3>
          </div>

          <div className="h-48 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#a5b4fc" /> {/* Principal color */}
                  <Cell fill="#cbd5e1" /> {/* Interest color */}
                </Pie>
                <ReTooltip 
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Interest Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-700/50 shadow-sm group hover:shadow-md transition-all">
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md shadow-sm text-indigo-500">
                     <TrendingUp size={16} />
                   </div>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Total Interest</p>
                 </div>
                 <p className="text-xl font-bold text-slate-700 dark:text-slate-200">₹{totalInterest.toLocaleString('en-IN')}</p>
               </div>
               <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-indigo-100 dark:bg-indigo-800 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform"></div>
            </div>
            
            {/* Total Payable Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-700/50 shadow-sm group hover:shadow-md transition-all">
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md shadow-sm text-emerald-500">
                     <Wallet size={16} />
                   </div>
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Total Payable</p>
                 </div>
                 <p className="text-xl font-bold text-slate-700 dark:text-slate-200">₹{totalPayment.toLocaleString('en-IN')}</p>
               </div>
               <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform"></div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
                onClick={() => setShowBreakdown(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm"
            >
                <Table size={16} />
                <span>Schedule</span>
            </button>
            <button
                onClick={handleSave}
                className="flex-[2] flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none text-sm"
            >
                <Save size={16} />
                <span>Save Loan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="absolute inset-0 bg-white dark:bg-slate-800 z-20 flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Table size={18} className="text-primary"/>
                    Amortization Schedule
                </h3>
                <button 
                    onClick={() => setShowBreakdown(false)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X size={20} className="text-slate-500"/>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-4 text-center">Yearly Payment Breakdown</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2}/>
                                <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}}/>
                                <YAxis hide/>
                                <ReTooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                                />
                                <Legend />
                                <Bar dataKey="Principal" stackId="a" fill="#818cf8" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Interest" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium">
                            <tr>
                                <th className="px-4 py-3">Period</th>
                                <th className="px-4 py-3">Principal</th>
                                <th className="px-4 py-3">Interest</th>
                                <th className="px-4 py-3 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {breakdownData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300">
                                    <td className="px-4 py-3 font-medium">{row.year}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹{row.Principal.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">₹{row.Interest.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-white">₹{row.Balance.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;