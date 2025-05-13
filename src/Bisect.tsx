import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TextLayoutVisualizer = () => {
  const [step, setStep] = useState(0);

  const string =
    "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul;";
  const words = string.split(" ");
  const LINE = 5;

  // Pre-calculate all steps
  const steps = (() => {
    const calculateLayout = (width: number) => {
      let line = 1;
      let line_length = 0;
      let layoutPreview = "";
      let currentLine = "";

      for (const word of words) {
        if (word.length + line_length <= width) {
          currentLine += word + " ";
          line_length += word.length + 1;
        } else {
          layoutPreview += currentLine.trim() + "\n";
          currentLine = word + " ";
          line_length = word.length + 1;
          line++;
        }
      }
      layoutPreview += currentLine.trim();

      return { line, layout: layoutPreview };
    };

    const result = [];
    let ng = 0;
    let ok = string.length;

    result.push({
      mid: null,
      ng,
      ok,
      line: 1,
      isValid: null,
      layout: string,
    });

    while (ok - ng > 1) {
      const mid = Math.floor((ok + ng) / 2);
      const { line, layout } = calculateLayout(mid);

      result.push({
        mid,
        ng,
        ok,
        line,
        isValid: line <= LINE,
        layout,
      });

      if (line <= LINE) {
        ok = mid;
      } else {
        ng = mid;
      }
    }

    // Add final state
    const finalLayout = calculateLayout(ok);
    result.push({
      mid: null,
      ng,
      ok,
      line: finalLayout.line,
      isValid: finalLayout.line <= LINE,
      layout: finalLayout.layout,
    });

    return result;
  })();

  const lastStep = steps[steps.length - 1].ok;
  const currentStep = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="space-y-12 p-4">
        <h1 className="text-3xl font-bold">balanced</h1>
      <div className="mt-4">
        <div className="mt-2 p-8  bg-gray-50 rounded whitespace-pre-wrap font-mono" style={{ fontSize: 16, lineHeight: "1.5" }}>
          {currentStep.layout.split("\n").map((line, idx) => (
            <div key={idx} className="mt-4 bg-gray-200" style={{ width: "fit-content" }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {/* Binary Search Range Visualization */}
          <div className="relative h-16 mx-4">
            {/* Base line */}
            <div className="absolute top-8 w-full h-1 bg-gray-200" />

            {/* Search range */}
            <div
              className="absolute top-8 h-1 bg-blue-200"
              style={{
                left: `${(currentStep.ng / string.length) * 100}%`,
                width: `${((currentStep.ok - currentStep.ng) / string.length) * 100}%`,
              }}
            />

            {/* ng range */}
            <div
              className="absolute top-7 h-1 border-t-[2px] border-l-[2px] border-r-[2px] border-red-500"
              style={{
                left: `${(0 / string.length) * 100}%`,
                width: `${(lastStep / string.length) * 100}%`,
              }}
            />
            <div className="absolute top-2 left-0 text-xs text-red-500">&gt; {LINE}</div>

            {/* ok range */}
            <div
              className="absolute top-7 right-0 h-1 border-t-[2px] border-l-[2px] border-r-[2px] border-green-500"
              style={{
                width: `${((string.length - lastStep) / string.length) * 100}%`,
              }}
            />
            <div className="absolute top-2 right-0 text-xs text-green-500">{LINE} &ge;</div>

            {/* Current mid point */}
            {currentStep.mid !== null && (
              <div
                className={`absolute w-2 h-2 rounded-full ${currentStep.isValid ? "bg-green-500" : "bg-red-500"}`}
                style={{
                  left: `${(currentStep.mid / string.length) * 100}%`,
                  top: "calc(2rem - 2px)",
                }}
              />
            )}

            {/* Labels */}
            <div
              className="absolute font-mono text-sm text-blue-500
              after:content-['|'] after:text-lg after:absolute after:top-[1em] after:text-xs after:left-1/2 after:-translate-x-[50%] after:text-blue-500"
              style={{
                left: `${(currentStep.ng / string.length) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {currentStep.ng}
            </div>

            <div
              className="absolute font-mono text-sm text-blue-500
              after:content-['|'] after:text-lg after:absolute after:top-[1em] after:text-xs after:left-1/2 after:-translate-x-[50%] after:text-blue-500"
              style={{
                left: `${(currentStep.ok / string.length) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {currentStep.ok}
            </div>

            {currentStep.mid !== null && (
              <div
                className={`absolute font-mono text-sm ml-1 ${currentStep.isValid ? "text-green-500" : "text-red-500"}`}
                style={{
                  left: `${(currentStep.mid / string.length) * 100}%`,
                  transform: "translateX(-50%)",
                  bottom: "0rem",
                }}
              >
                <strong>mid={currentStep.mid}</strong>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mx-4">
            {/* <div>
              <p>left = {currentStep.ng}</p>
              <p>right = {currentStep.ok}</p>
              {currentStep.mid !== null && <p>mid = {currentStep.mid}</p>}
            </div> */}
            <div>
              {currentStep.isValid !== null && (
                <span className={currentStep.isValid ? "text-green-600" : "text-red-600"}>
                  <strong> {currentStep.isValid ? "OK" : "NG"}</strong>,&nbsp;
                </span>
              )}
              <strong>now:</strong> {currentStep.line} lines,&nbsp;
              <strong>want:</strong> {LINE} lines
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} variant={"ghost"} size={"sm"}>
          &lt;
        </Button>
        <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} variant={"ghost"} size={"sm"}>
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
