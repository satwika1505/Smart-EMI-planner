import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Archive, Sun, Moon, Monitor, HelpCircle, LogOut } from 'lucide-react';
import { Loan, Reminder, User, LoanType } from './types';
import Dashboard from './components/Dashboard';
import HistoryModule from './components/HistoryModule';
import WelcomeAnimation from './components/WelcomeAnimation';
import LoanDetails from './components/LoanDetails';
import TutorialOverlay from './components/TutorialOverlay';
import AuthScreen from './components/AuthScreen';

type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [theme, setTheme] = useState<Theme>('system');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);

  // Global State
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Initial Load (Theme & User Session)
  useEffect(() => {
    const savedTheme = localStorage.getItem('sep_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    const savedUser = localStorage.getItem('sep_current_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setShowWelcome(false); // Skip animation for logged in users
    }
  }, []);

  // Theme Logic
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('sep_theme', theme);
  }, [theme]);

  // Load User Data ONLY when user is present
  useEffect(() => {
    if (!user) {
        setLoans([]);
        setReminders([]);
        return;
    }

    const userLoans = localStorage.getItem(`sep_loans_${user.id}`);
    const userReminders = localStorage.getItem(`sep_reminders_${user.id}`);
    
    if (userLoans) setLoans(JSON.parse(userLoans));
    if (userReminders) setReminders(JSON.parse(userReminders));
  }, [user]);

  // Save User Data whenever it changes
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`sep_loans_${user.id}`, JSON.stringify(loans));
  }, [loans, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`sep_reminders_${user.id}`, JSON.stringify(reminders));
  }, [reminders, user]);

  // --- Auth Handlers ---

  const handleRegister = async (name: string, email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const usersDb = localStorage.getItem('sep_users_db');
    const users: User[] = usersDb ? JSON.parse(usersDb) : [];

    if (users.find(u => u.email === email)) {
        setAuthError('Account with this email already exists.');
        setAuthLoading(false);
        return;
    }

    const newUser: User = {
        id: 'u_' + Date.now(),
        name,
        email,
        password: pass // In a real app, never store plain text passwords
    };

    users.push(newUser);
    localStorage.setItem('sep_users_db', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('sep_current_user', JSON.stringify(newUser));
    setUser(newUser);
    setAuthLoading(false);
    // Don't show welcome animation again after registration, go straight to dashboard
  };

  const handleLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const usersDb = localStorage.getItem('sep_users_db');
    const users: User[] = usersDb ? JSON.parse(usersDb) : [];

    const foundUser = users.find(u => u.email === email && u.password === pass);

    if (foundUser) {
        localStorage.setItem('sep_current_user', JSON.stringify(foundUser));
        setUser(foundUser);
    } else {
        setAuthError('Invalid email or password.');
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('sep_current_user');
    setUser(null);
    setSelectedLoan(null);
    setActiveTab('dashboard');
  };

  // --- App Logic ---
  
  const handleLoadDemoData = () => {
    const today = new Date();
    
    const demoLoans: Loan[] = [
        {
            id: `demo_home_${Date.now()}`,
            name: 'Dream Home Loan',
            type: LoanType.HOME,
            principal: 5000000,
            rate: 8.5,
            tenureMonths: 240, // 20 Years
            startDate: new Date(new Date().setFullYear(today.getFullYear() - 1)).toISOString(), // Started 1 year ago
            emi: 43391,
            status: 'active'
        },
        {
            id: `demo_car_${Date.now()}`,
            name: 'Tesla Model 3',
            type: LoanType.VEHICLE,
            principal: 3500000,
            rate: 9.0,
            tenureMonths: 60, // 5 Years
            startDate: new Date(new Date().setMonth(today.getMonth() - 6)).toISOString(), // Started 6 months ago
            emi: 72650,
            status: 'active'
        }
    ];

    let allReminders: Reminder[] = [];

    demoLoans.forEach(loan => {
        const startDate = new Date(loan.startDate);
        for (let i = 1; i <= loan.tenureMonths; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            
            // Mark as paid if due date is in the past
            const isPast = dueDate < today;
            
            allReminders.push({
                id: `${loan.id}-emi-${i}`,
                loanId: loan.id,
                title: `EMI Payment #${i} - ${loan.name}`,
                dueDate: dueDate.toISOString().split('T')[0],
                isPaid: isPast,
                paidAt: isPast ? dueDate.toISOString() : undefined,
                type: 'payment'
            });
        }
    });

    setLoans(prev => [...prev, ...demoLoans]);
    setReminders(prev => [...prev, ...allReminders]);
  };

  // Check for upcoming EMIs and trigger Notification
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted" || !reminders.length || !user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const upcomingPayments = reminders.filter(r => {
      if (r.isPaid || r.type !== 'payment') return false;
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= threeDaysFromNow;
    });

    if (upcomingPayments.length > 0) {
      const hasNotified = sessionStorage.getItem(`sep_notified_today_${user.id}`);
      if (!hasNotified) {
        new Notification("Upcoming EMI Payments", {
          body: `Hi ${user.name}, you have ${upcomingPayments.length} EMI payment(s) due shortly.`,
          icon: '/vite.svg'
        });
        sessionStorage.setItem(`sep_notified_today_${user.id}`, 'true');
      }
    }
  }, [reminders, user]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Notifications Active", {
        body: "You will now be notified about upcoming EMI payments.",
        icon: '/vite.svg'
      });
    }
  };

  const addLoan = (loan: Loan) => {
    setLoans(prev => [...prev, loan]);
    const newReminders: Reminder[] = [];
    const startDate = new Date(loan.startDate);
    for (let i = 1; i <= loan.tenureMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        const newReminder: Reminder = {
            id: `${loan.id}-emi-${i}-${Date.now()}`,
            loanId: loan.id,
            title: `EMI Payment #${i} - ${loan.name}`,
            dueDate: dueDate.toISOString().split('T')[0],
            isPaid: false,
            type: 'payment'
        };
        newReminders.push(newReminder);
    }
    setReminders(prev => [...prev, ...newReminders]);
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    setReminders(prev => prev.filter(r => r.loanId !== id));
    if (selectedLoan?.id === id) setSelectedLoan(null);
  };

  const closeLoan = (id: string) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'closed', closedDate: new Date().toISOString() } : l));
  };

  const restoreLoan = (id: string) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'active', closedDate: undefined } : l));
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Only trigger tutorial if we have a user (Dashboard is about to be shown)
    if (user) {
        const tutorialCompleted = localStorage.getItem(`sep_tutorial_completed_${user.id}`);
        if (!tutorialCompleted) {
            setTimeout(() => setShowTutorial(true), 500);
        }
    }
  };

  const finishTutorial = () => {
    setShowTutorial(false);
    if(user) localStorage.setItem(`sep_tutorial_completed_${user.id}`, 'true');
  };

  const renderContent = () => {
    if (activeTab === 'dashboard' && selectedLoan) {
      return (
        <LoanDetails 
          loan={selectedLoan}
          reminders={reminders}
          setReminders={setReminders}
          onBack={() => setSelectedLoan(null)}
        />
      );
    }

    const activeLoans = loans.filter(l => l.status !== 'closed');
    const closedLoans = loans.filter(l => l.status === 'closed');

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          loans={activeLoans} 
          onAddLoan={addLoan} 
          reminders={reminders} 
          onDeleteLoan={deleteLoan}
          onCloseLoan={closeLoan}
          onViewLoan={setSelectedLoan}
          onEnableNotifications={requestNotificationPermission}
          onLoadDemoData={handleLoadDemoData}
          userName={user?.name || 'User'}
        />;
      case 'history':
        return <HistoryModule loans={closedLoans} onRestoreLoan={restoreLoan} onDeleteLoan={deleteLoan} />;
      default:
        return <Dashboard 
          loans={activeLoans} 
          onAddLoan={addLoan} 
          reminders={reminders} 
          onDeleteLoan={deleteLoan}
          onCloseLoan={closeLoan}
          onViewLoan={setSelectedLoan}
          onEnableNotifications={requestNotificationPermission}
          onLoadDemoData={handleLoadDemoData}
          userName={user?.name || 'User'}
        />;
    }
  };

  const NavItem = ({ id, icon: Icon, label, testId }: { id: typeof activeTab, icon: any, label: string, testId?: string }) => (
    <button
      id={testId}
      onClick={() => {
        setActiveTab(id);
        setSelectedLoan(null);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id 
          ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-indigo-300' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const ThemeToggle = () => (
    <div id="tour-theme-toggle" className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button 
            onClick={() => setTheme('light')}
            className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-600 text-yellow-500 shadow-sm' : 'text-slate-400'}`}
        >
            <Sun size={16} />
        </button>
        <button 
            onClick={() => setTheme('system')}
            className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-400'}`}
        >
            <Monitor size={16} />
        </button>
        <button 
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-600 text-indigo-400 shadow-sm' : 'text-slate-400'}`}
        >
            <Moon size={16} />
        </button>
    </div>
  );

  // Flow: 
  // 1. Show Loading/Welcome Animation (for new sessions/users)
  // 2. If !user -> Auth Screen
  // 3. If user -> Dashboard

  if (showWelcome) {
    return <WelcomeAnimation onComplete={handleWelcomeComplete} />;
  }

  if (!user) {
    return <AuthScreen 
      onLogin={handleLogin} 
      onRegister={handleRegister} 
      isLoading={authLoading} 
      error={authError} 
      onErrorClear={() => setAuthError(null)}
    />;
  }

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900 overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            ₹
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">Smart EMI</span>
        </div>
        
        {/* User Profile Snippet */}
        <div className="px-4 py-6 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 mx-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" testId="tour-nav-dashboard" />
          <NavItem id="history" icon={Archive} label="History" testId="tour-nav-history" />
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
           <ThemeToggle />
           <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => setShowTutorial(true)}
                    className="flex items-center justify-center gap-2 p-2 text-xs text-slate-500 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <HelpCircle size={14} /> Tour
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 p-2 text-xs text-red-500 hover:text-red-600 transition-colors border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogOut size={14} /> Logout
                </button>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            ₹
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">Smart EMI</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-slate-900 z-40 pt-20 px-4 space-y-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                </div>
            </div>

          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="history" icon={Archive} label="History" />
          <button 
              onClick={() => { setShowTutorial(true); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
              <HelpCircle size={20} />
              <span>Help & Tour</span>
          </button>
          
          <button 
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          >
              <LogOut size={20} />
              <span>Sign Out</span>
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Theme</p>
             <ThemeToggle />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full pt-16 md:pt-0 p-4 md:p-8">
        <div key={activeTab + (selectedLoan ? '-details' : '')} className="max-w-7xl mx-auto animate-fade-in">
          {renderContent()}
        </div>
      </main>
      
      {showTutorial && (
        <TutorialOverlay onComplete={finishTutorial} onSkip={finishTutorial} />
      )}
    </div>
  );
};

export default App;