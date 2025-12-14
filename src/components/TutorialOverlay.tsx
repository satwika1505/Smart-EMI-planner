import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

interface Step {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: Step[] = [
  {
    targetId: 'center', // Special keyword for center modal
    title: 'Welcome to Smart EMI Planner',
    content: 'Let\'s take a quick tour to help you manage your loans and finances effectively.',
    position: 'center'
  },
  {
    targetId: 'tour-stats',
    title: 'Quick Overview',
    content: 'See your total debt, monthly commitments, and pending payments at a glance here.',
    position: 'bottom'
  },
  {
    targetId: 'tour-calculator',
    title: 'Plan Your Loans',
    content: 'Use the EMI Calculator to simulate loan scenarios before you commit. You can save them directly from here!',
    position: 'right'
  },
  {
    targetId: 'tour-active-loans',
    title: 'Active Loans',
    content: 'Your saved loans appear here. Click on any loan card to view details, pay EMIs, and check your schedule.',
    position: 'left'
  },
  {
    targetId: 'tour-nav-history',
    title: 'History Archive',
    content: 'Once you close a loan, it moves to the History tab. You can always access your past records there.',
    position: 'right'
  },
  {
    targetId: 'tour-theme-toggle',
    title: 'Customize View',
    content: 'Toggle between Light, Dark, and System themes to suit your preference.',
    position: 'top'
  },
  {
    targetId: 'center',
    title: 'You\'re All Set!',
    content: 'Start adding your loans and take control of your financial journey today.',
    position: 'center'
  }
];

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    const step = STEPS[currentStep];
    if (step.targetId === 'center') {
      setTargetRect(null);
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Small delay to allow scroll to finish or settle
      setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
      }, 100);
    } else {
      // If element not found (e.g. mobile view hiding sidebar), skip or fallback
      setTargetRect(null); 
    }
  }, [currentStep]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop with "hole" */}
      {targetRect && (
        <>
          {/* Top */}
          <div className="absolute top-0 left-0 right-0 bg-slate-900/70 transition-all duration-300" style={{ height: targetRect.top }} />
          {/* Bottom */}
          <div className="absolute left-0 right-0 bottom-0 bg-slate-900/70 transition-all duration-300" style={{ top: targetRect.bottom }} />
          {/* Left */}
          <div className="absolute left-0 bg-slate-900/70 transition-all duration-300" style={{ top: targetRect.top, height: targetRect.height, width: targetRect.left }} />
          {/* Right */}
          <div className="absolute right-0 bg-slate-900/70 transition-all duration-300" style={{ top: targetRect.top, height: targetRect.height, left: targetRect.right }} />
          
          {/* Highlight Border */}
          <div 
            className="absolute border-2 border-indigo-400 rounded-lg shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 pointer-events-none"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
        </>
      )}

      {/* Full Backdrop for Center Modal */}
      {!targetRect && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-all duration-500" />
      )}

      {/* Tooltip Card */}
      <div 
        className={`absolute transition-all duration-500 ease-out flex flex-col items-center justify-center ${!targetRect ? 'inset-0' : ''}`}
        style={targetRect ? {
           top: stepData.position === 'bottom' ? targetRect.bottom + 20 : 
                stepData.position === 'top' ? targetRect.top - 200 : // approx height
                targetRect.top,
           left: stepData.position === 'right' ? targetRect.right + 20 :
                 stepData.position === 'left' ? targetRect.left - 340 : // approx width
                 targetRect.left
        } : {}}
      >
        <div className={`
          bg-white dark:bg-slate-800 w-[320px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 relative
          ${!targetRect ? 'animate-[fadeIn_0.5s_ease-out]' : ''}
        `}>
          <div className="flex justify-between items-start mb-4">
             <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
               <HelpCircle size={24} />
             </div>
             <button onClick={onSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
               <X size={20} />
             </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{stepData.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {stepData.content}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-1">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} 
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors ${currentStep === 0 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== STEPS.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;