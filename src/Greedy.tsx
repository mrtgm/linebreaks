import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TextLayoutVisualizer = () => {
  const [step, setStep] = useState(0);

  const string =
    "Call me Ishmael. Some years ago—never mind how long precisely having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul;";
  const LINE_NUM = 5;
  const desiredLen = Math.floor(string.length / LINE_NUM);

  const steps = (() => {
    const findBestBreak = (start: number, desiredLen: number) => {
      const left = start;
      const right = Math.min(start + desiredLen * 2, string.length);
      let bestPos = right;
      let bestDiff = Infinity;

      for (let i = left; i <= right; i++) {
        if (i === 0 || i >= string.length || string[i] === " ") {
          const diff = Math.abs(i - (start + desiredLen));
          if (diff < bestDiff) {
            bestDiff = diff;
            bestPos = i;
          }
        }
      }

      while (bestPos < string.length && string[bestPos] === " ") {
        bestPos++;
      }

      return bestPos;
    };

    const result = [];
    let pos = 0;
    let breaks: number[] = [];

    result.push({
      currentPos: pos,
      desiredLen,
      breaks: [],
      layout: string,
    });

    for (let i = 0; i < LINE_NUM - 1; i++) {
      const breakPos = findBestBreak(pos, desiredLen);
      if (breakPos === string.length) break;

      breaks = [...breaks, breakPos];
      pos = breakPos;

      const layout =
        breaks.reduce((acc, cur, idx) => {
          const start = idx === 0 ? 0 : breaks[idx - 1];
          return acc + string.substring(start, cur) + "\n";
        }, "") + string.substring(breaks[breaks.length - 1]);

      result.push({
        currentPos: pos,
        desiredLen,
        breaks,
        layout,
      });
    }

    return result;
  })();

  const currentStep = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="space-y-12 p-4">
      <h1 className="text-3xl font-bold">balanced</h1>
      <div className="mt-4">
        <div
          className="mt-2 p-8 min-h-[200px] bg-gray-100 rounded whitespace-pre-wrap
        font-mono
        "
          style={{ fontSize: 16 }}
        >
          {currentStep.layout.split("\n").map((line, idx) => (
            <div key={idx} className="mt-4 bg-gray-200" style={{ width: "fit-content" }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {/* Text visualization */}
          <div className="relative h-16 mx-4">
            {/* Base text line */}
            <div className="absolute top-8 w-full h-1 bg-gray-200" />

            {/* Desired length visualization */}
            <div
              className="absolute top-6 h-1 border-t-2 border-l-2 border-r-2 border-blue-500"
              style={{
                left: `${(currentStep.currentPos / string.length) * 100}%`,
                width: `${(currentStep.desiredLen / string.length) * 100}%`,
              }}
            />

            {/* Break points */}
            {currentStep.breaks.map((breakPos, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 rounded-full bg-green-500"
                style={{
                  left: `${(breakPos / string.length) * 100}%`,
                  top: "calc(2rem - 2px)",
                }}
              />
            ))}

            {/* Current position */}
            <div
              className="absolute font-mono text-sm"
              style={{
                left: `${(currentStep.currentPos / string.length) * 100}%`,
                transform: "translateX(-50%)",
              }}
            ></div>
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Current Position:</strong> {currentStep.currentPos}</p>
              <p><strong>Desired Length:</strong> {currentStep.desiredLen}</p>
            </div>
            <div>
              <p><strong>Break Points:</strong></p>
              <p>{currentStep.breaks.join(', ')}</p>
            </div>
          </div> */}
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} variant="ghost" size="sm">
          &lt;
        </Button>
        <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} variant="ghost" size="sm">
          &gt;
        </Button>
        <span className="text-sm text-gray-600">
          {step + 1} / {steps.length}
        </span>
      </div>

      <div
        style={{
          textWrap: "balance",
          width: "730px",
        }}
        className="bg-gray-100 p-4"
      >
        <p>{string}</p>
      </div>
    </div>
  );
};

export default TextLayoutVisualizer;
