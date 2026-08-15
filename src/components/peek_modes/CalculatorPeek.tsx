import React, { useState } from "react";
import { SearchEntry, LiveTypingData } from "../../types";

interface CalculatorPeekProps {
  latestSearch: SearchEntry | null;
  liveTyping: LiveTypingData | null;
}

export const CalculatorPeek: React.FC<CalculatorPeekProps> = ({ latestSearch, liveTyping }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const activeSecret =
    liveTyping && liveTyping.query.trim().length > 0
      ? liveTyping.query
      : latestSearch?.query || "";

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? digit : displayValue + digit);
    }
  };

  const handleDot = () => {
    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
      setWaitingForOperand(false);
    }
  };

  const handleClear = () => {
    setDisplayValue("0");
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleOp = (nextOp: string) => {
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const current = prevValue || 0;
      let result = current;
      if (operation === "+") result = current + inputValue;
      if (operation === "-") result = current - inputValue;
      if (operation === "×") result = current * inputValue;
      if (operation === "÷") result = inputValue !== 0 ? current / inputValue : 0;
      
      setPrevValue(result);
      setDisplayValue(String(result));
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(displayValue);
    if (prevValue !== null && operation) {
      let result = prevValue;
      if (operation === "+") result = prevValue + inputValue;
      if (operation === "-") result = prevValue - inputValue;
      if (operation === "×") result = prevValue * inputValue;
      if (operation === "÷") result = inputValue !== 0 ? prevValue / inputValue : 0;

      setDisplayValue(String(result));
      setPrevValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[75vh] select-none">
      {/* Camouflaged iOS Style Calculator Container */}
      <div className="w-full max-w-[340px] bg-black rounded-[40px] p-6 shadow-2xl border border-neutral-900 text-white">
        
        {/* Subtle Peek Banner (Camouflaged as Calculator Memory / Unit info) */}
        <div className="min-h-[24px] px-2 text-right">
          {activeSecret ? (
            <span className="text-xs font-mono tracking-tight text-neutral-400 opacity-90 truncate inline-block max-w-full">
              MEM: <strong className="text-amber-400 font-sans text-sm ml-1">{activeSecret}</strong>
            </span>
          ) : (
            <span className="text-[10px] text-neutral-700 font-mono">RAD | DEG</span>
          )}
        </div>

        {/* Calculator Display */}
        <div className="text-right text-6xl font-light py-4 tracking-tight overflow-x-auto select-all">
          {displayValue}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-3 text-2xl font-medium">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full bg-neutral-400 text-black hover:bg-neutral-300 active:bg-white flex items-center justify-center transition"
          >
            AC
          </button>
          <button
            onClick={() => setDisplayValue(String(parseFloat(displayValue) * -1))}
            className="w-16 h-16 rounded-full bg-neutral-400 text-black hover:bg-neutral-300 active:bg-white flex items-center justify-center transition"
          >
            ±
          </button>
          <button
            onClick={() => setDisplayValue(String(parseFloat(displayValue) / 100))}
            className="w-16 h-16 rounded-full bg-neutral-400 text-black hover:bg-neutral-300 active:bg-white flex items-center justify-center transition"
          >
            %
          </button>
          <button
            onClick={() => handleOp("÷")}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              operation === "÷" ? "bg-white text-orange-500" : "bg-orange-500 text-white hover:bg-orange-400"
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit("7")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            7
          </button>
          <button
            onClick={() => handleDigit("8")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            8
          </button>
          <button
            onClick={() => handleDigit("9")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            9
          </button>
          <button
            onClick={() => handleOp("×")}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              operation === "×" ? "bg-white text-orange-500" : "bg-orange-500 text-white hover:bg-orange-400"
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit("4")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            4
          </button>
          <button
            onClick={() => handleDigit("5")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            5
          </button>
          <button
            onClick={() => handleDigit("6")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            6
          </button>
          <button
            onClick={() => handleOp("-")}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              operation === "-" ? "bg-white text-orange-500" : "bg-orange-500 text-white hover:bg-orange-400"
            }`}
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit("1")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            1
          </button>
          <button
            onClick={() => handleDigit("2")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            2
          </button>
          <button
            onClick={() => handleDigit("3")}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            3
          </button>
          <button
            onClick={() => handleOp("+")}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
              operation === "+" ? "bg-white text-orange-500" : "bg-orange-500 text-white hover:bg-orange-400"
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit("0")}
            className="col-span-2 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center px-7 transition"
          >
            0
          </button>
          <button
            onClick={handleDot}
            className="w-16 h-16 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center transition"
          >
            ,
          </button>
          <button
            onClick={handleEquals}
            className="w-16 h-16 rounded-full bg-orange-500 text-white hover:bg-orange-400 active:bg-orange-300 flex items-center justify-center transition"
          >
            =
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 text-center max-w-xs">
        Camuflagem: Você pode deixar seu celular na mesa em modo Calculadora. A palavra secreta aparece discretamente no campo &quot;MEM&quot;.
      </p>
    </div>
  );
};
