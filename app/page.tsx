"use client";

import classNames from "@/node_modules/classnames/index";
import { useState, useEffect, useRef } from "react";

interface NumberWithPosition {
  value: number;
  top: number;
  left: number;
}

export default function Home() {
  const [inputValue, setInputValue] = useState<string>("");
  const [numbers, setNumbers] = useState<NumberWithPosition[]>([]);
  const [clickedNumbers, setClickedNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [timer, setTimer] = useState<number>(0);
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateNumbers = () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value <= 0) {
      setError("Vui lòng nhập một số dương hợp lệ.");
      return;
    }

    // Reset everything
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer(0);
    setIsStopped(false);
    setClickedNumbers([]);
    setCurrentNumber(1);
    setError("");

    const generatedNumbers: NumberWithPosition[] = [];
    for (let i = 1; i <= value; i++) {
      let position = getRandomPosition();

      while (isOverlapping(position, generatedNumbers)) {
        position = getRandomPosition();
      }

      generatedNumbers.push({ value: i, ...position });
    }

    setNumbers(shuffleArray(generatedNumbers));

    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 100);
  };

  const shuffleArray = (array: NumberWithPosition[]): NumberWithPosition[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  const getRandomPosition = () => {
    const top = Math.floor(Math.random() * 95);
    const left = Math.floor(Math.random() * 95);
    return { top, left };
  };

  const isOverlapping = (
    position: { top: number; left: number },
    generatedNumbers: NumberWithPosition[]
  ) => {
    const tolerance = 5;
    return generatedNumbers.some((num) => {
      const numTop = num.top;
      const numLeft = num.left;
      const newTop = position.top;
      const newLeft = position.left;

      return (
        Math.abs(numTop - newTop) < tolerance &&
        Math.abs(numLeft - newLeft) < tolerance
      );
    });
  };

  const handleNumberClick = (number: number) => {
    if (isStopped) return;

    if (number === currentNumber) {
      setClickedNumbers([...clickedNumbers, number]);
      setCurrentNumber(currentNumber + 1);

      setTimeout(() => {
        setNumbers((prevNumbers) =>
          prevNumbers.filter((num) => num.value !== number)
        );
      }, 3000);

      if (currentNumber === parseInt(inputValue)) {
        setIsStopped(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setError("ALL CLEARED");
      }
    } else {
      setError("GAMEOVER");
      setIsStopped(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Convert timer to seconds and milliseconds
  const formatTime = (timer: number) => {
    const seconds = Math.floor(timer / 10);
    const milliseconds = timer % 10;
    return `${seconds}.${milliseconds}`;
  };

  return (
    <div className="my-10">
      {/* Random Number */}
      <div className="relative p-4 w-[800px] h-[800px] mx-auto border-[1px] border-black">
        {error ? (
          <h1
            className={classNames("text-[24px] text-[#FF0000]", {
              "text-[#00FF00]": error === "ALL CLEARED",
            })}
          >
            {error}
          </h1>
        ) : (
          <h1 className="mb-4 text-[24px] font-bold">Let's Play</h1>
        )}
        <div className="mb-3 flex gap-20">
          <div>
            <p className="mb-2">Point:</p>
            <p>Time</p>
          </div>
          <div>
            <input
              className="mb-2 px-2 border-[1px] border-black"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your number"
            />
            <p className="font-medium">{formatTime(timer)}s</p>
          </div>
        </div>
        <button
          className="mb-4 px-3 py-1 bg-[#C0C0C0] border-[1px] border-black"
          onClick={generateNumbers}
        >
          {numbers.length > 0 ? "Restart" : "Play"}
        </button>
        <div className="relative w-[768px] h-[594px] border-[1px] border-black">
          {numbers.map(({ value, top, left }) => (
            <div
              key={value}
              className={classNames(
                "absolute w-[30px] h-[30px] text-[12px] flex justify-center items-center text-[20px] border-[1px] border-[#808080] rounded-full cursor-pointer",
                {
                  "bg-[#FF0000] text-white": clickedNumbers.includes(value),
                  "bg-white": !clickedNumbers.includes(value),
                }
              )}
              style={{ top: `${top}%`, left: `${left}%` }}
              onClick={() => handleNumberClick(value)}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
