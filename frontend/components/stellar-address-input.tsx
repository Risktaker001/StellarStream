'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, User } from 'lucide-react';

interface StellarAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  label?: string;
}

export function StellarAddressInput({
  value,
  onChange,
  onValidationChange,
  placeholder = 'Enter G-Address or name*stellar.org',
  label = 'Recipient Address',
}: StellarAddressInputProps) {
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showShake, setShowShake] = useState(false);

  // Validate Stellar G-Address (56 characters, starts with G)
  const isValidGAddress = (address: string): boolean => {
    const gAddressRegex = /^G[A-Z2-7]{55}$/;
    return gAddressRegex.test(address);
  };

  // Validate Federated Address (name*domain.tld)
  const isValidFederatedAddress = (address: string): boolean => {
    const federatedRegex = /^[a-zA-Z0-9._-]+\*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return federatedRegex.test(address);
  };

  useEffect(() => {
    if (!value) {
      setValidationState('idle');
      setErrorMessage('');
      onValidationChange?.(false);
      return;
    }

    // Debounce validation
    const timer = setTimeout(() => {
      if (isValidGAddress(value)) {
        setValidationState('valid');
        setErrorMessage('');
        onValidationChange?.(true);
      } else if (isValidFederatedAddress(value)) {
        setValidationState('valid');
        setErrorMessage('');
        onValidationChange?.(true);
      } else {
        setValidationState('error');
        setShowShake(true);
        
        // Determine specific error message
        if (value.startsWith('G') && value.length !== 56) {
          setErrorMessage('G-Address must be exactly 56 characters');
        } else if (value.includes('*')) {
          setErrorMessage('Invalid federated address format (name*domain.tld)');
        } else {
          setErrorMessage('Enter a valid G-Address or federated name');
        }
        
        onValidationChange?.(false);
        
        // Remove shake animation after it completes
        setTimeout(() => setShowShake(false), 500);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onValidationChange]);

  const getBorderClass = () => {
    if (validationState === 'valid') {
      return 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
    }
    if (validationState === 'error') {
      return 'border-[#8a00ff] shadow-[0_0_10px_rgba(138,0,255,0.3)]';
    }
    return 'border-white/[0.08] focus:border-primary/50';
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pr-12
            glass-card
            border-2 transition-all duration-300
            ${getBorderClass()}
            ${showShake ? 'animate-shake' : ''}
            text-white placeholder:text-white/40
            focus:outline-none focus:ring-0
            font-mono text-sm
          `}
        />
        
        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {validationState === 'valid' && (
            <>
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-green-500" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 animate-scale-in" />
            </>
          )}
          {validationState === 'error' && (
            <AlertCircle className="w-5 h-5 text-[#8a00ff]" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {validationState === 'error' && errorMessage && (
        <p className="text-sm text-[#8a00ff] flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}

      {/* Success Message */}
      {validationState === 'valid' && (
        <p className="text-sm text-green-500 flex items-center gap-1 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Valid recipient address
        </p>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
