// src/components/contact/ProgressIndicator.jsx

import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps, goToStep }) => {
  const steps = [
    { number: 1, label: 'basic informations' },
    { number: 2, label: 'contact history' },
    { number: 3, label: 'additional info' },
  ];

    return (
    <div className="mb-8">
        <div className="w-full min-w-[480px] px-10 mx-auto flex items-center justify-between max-w-[530px]">
        {steps.map((step, index) => (
            <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center min-w-[80px] mr-4 ml-2"> {/* Added min-w to ensure equal spacing */}
                <button
                type="button"
                onClick={() => goToStep(step.number)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.number === currentStep
                    ? 'bg-red-500 text-white scale-110'
                    : step.number < currentStep
                    ? 'bg-red-100 text-red-500 cursor-pointer hover:bg-red-200'
                    : 'bg-red-200 text-white cursor-not-allowed'
                }`}
                disabled={step.number > currentStep}
                >
                {step.number < currentStep ? '✓' : step.number}
                </button>
                <span className={`mt-2 text-xs font-extralight text-center ${
                step.number === currentStep ? 'text-red-500' : 'text-gray-400'
                }`}>
                {step.label}
                </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 -mx-3 -ml-5 rounded transition-all ${
                step.number < currentStep ? 'bg-red-500' : 'bg-gray-200'
                }`} />
            )}
            </React.Fragment>
        ))}
        </div>
    </div>
    );
};

export default ProgressIndicator;