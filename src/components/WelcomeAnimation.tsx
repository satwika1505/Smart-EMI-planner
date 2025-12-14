import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Animation timeline
    // 0s - 5s: Loading Phase
    const t1 = setTimeout(() => setStep(1), 100);   // Icon In
    const t2 = setTimeout(() => setStep(2), 800);   // Text & Loader In
    const t3 = setTimeout(() => setStep(3), 3500);  // Success Tick
    
    // 5s - 7s: Welcome Phase
    const t4 = setTimeout(() => setStep(4), 5000);  // Switch to Welcome Screen
    
    // 7s - 8s: Fade Out
    const t5 = setTimeout(() => setStep(5), 7000);  // Fade Out Welcome Screen
    const t6 = setTimeout(() => onComplete(), 8000); // Unmount / Finish

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-1000 ${step === 5 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Loading Phase Content */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 transform ${step >= 4 ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
        
        {/* Icon Animation */}
        <div className={`transition-all duration-700 ease-out transform ${step >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 mb-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-indigo-400"></div>
             <div className={`relative z-10 transition-all duration-500 transform ${step >= 3 ? 'scale-110' : 'scale-100'}`}>
               {step >= 3 ? (
                 <Check size={48} className="text-white animate-[bounce_0.5s_ease-in-out]" />
               ) : (
                 <span className="text-5xl font-bold">₹</span>
               )}
             </div>
          </div>
        </div>
        
        {/* Text Animation */}
        <div className={`text-center space-y-3 transition-all duration-700 delay-100 transform ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Smart EMI
          </h1>
          <p className="text-slate-400 text-lg font-medium transition-all duration-300">
            {step >= 3 ? "Ready to start!" : "Your personal finance assistant"}
          </p>
        </div>

        {/* Loading Lines (Wave Animation) */}
        <div className={`absolute bottom-12 flex items-center space-x-1.5 h-8 transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-0'}`}>
          <style>{`
            @keyframes wave {
              0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.6; }
              20% { transform: scaleY(1.0); opacity: 1; }
            }
            .loader-bar {
              animation: wave 1.2s infinite ease-in-out;
            }
          `}</style>
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="w-1.5 h-8 bg-indigo-500 rounded-full loader-bar"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Welcome Phase Content - Appears after loading */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 transform ${step === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
        <div className="text-center px-4">
             <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-indigo-400 tracking-tighter drop-shadow-2xl">
            Welcome
          </h1>
          <p className={`text-slate-400 mt-6 text-xl font-light tracking-widest uppercase transition-all duration-1000 delay-300 ${step === 4 ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            to your financial freedom
          </p>
        </div>
      </div>

    </div>
  );
};

export default WelcomeAnimation;