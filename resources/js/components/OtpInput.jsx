import React, { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value, onChange, isError }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    // Clear refs
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newValueArray = value.split('');
    newValueArray[index] = val.substring(val.length - 1); // Keep last digit
    const newString = newValueArray.join('');
    onChange(newString);

    // Auto-focus next input
    if (val && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newValueArray = value.split('');
      if (!newValueArray[index] && index > 0) {
        // Backspace empty field → delete prev field & focus it
        newValueArray[index - 1] = '';
        onChange(newValueArray.join(''));
        inputsRef.current[index - 1].focus();
      } else {
        // Normal delete
        newValueArray[index] = '';
        onChange(newValueArray.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pasteData)) return; // Digits only

    onChange(pasteData.padEnd(length, ''));
    
    // Focus last filled or next empty
    const focusIndex = Math.min(pasteData.length, length - 1);
    inputsRef.current[focusIndex].focus();
  };

  // Convert current value string into an array representing the code digits
  const codeDigits = value.padEnd(length, ' ').split('').slice(0, length);

  return (
    <div className={`my-2 flex justify-between gap-2 ${isError ? 'animate-shake' : ''}`}>
      {codeDigits.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit === ' ' ? '' : digit}
          ref={(el) => (inputsRef.current[index] = el)}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`h-14 w-12 rounded-2xl border-2 bg-[#fcfefc] text-center text-xl font-bold text-[#18372b] shadow-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 ${
            isError
              ? 'border-[#f1b3bf] text-[#b13b4f] focus:ring-[#f1b3bf]/20'
              : 'border-[#dcebe0] focus:border-[#4e8f63] focus:ring-[#4e8f63]/15'
          }`}
        />
      ))}
    </div>
  );
}
