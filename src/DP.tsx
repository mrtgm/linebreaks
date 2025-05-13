import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DPLayoutVisualizer = () => {
  const [step, setStep] = useState(0);

  const string =     "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. ";
;
  const DESIRED_LEN = 30;
  const LINE_PENALTY = 500;

  const confirmedEdgesMap = new Map();

  const words = [];
  let i = 0;
  while (i < string.length) {
    let word = "";
    const start = i;
    while (i < string.length && string[i] !== " ") {
      word += string[i];
      i++;
    }
    words.push({
      word,
      first: start,
      last: i,
      next: -1,
      score: -1,
    });
    i++; // Skip space
  }
  const n = words.length;

  const { steps, finalLayout } = (() => {

    const dp = Array(n + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    const calcScore = (len: number) => {
      return Math.pow(DESIRED_LEN - len, 2);
    };

    const edges = [];

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        if (j >= i) {
          const len = words[j - 1].last - words[i - 1].first;
          dp[i][j] = calcScore(len);

          if (i === n && j === n) {
            dp[i][j] = 1e9;
          }

          edges.push({
            from: i - 1,
            to: j,
            cost: dp[i][j],
          });
        }
      }
    }

    const steps = [];
    const processedNodes = new Set([0]);

    const getShortestPathEdges = (currentNode: number, prev: number[]) => {
      const pathEdges = [];
      let node = currentNode;
      while (prev[node] !== -1) {
        pathEdges.push({
          from: prev[node],
          to: node,
          cost: dp[prev[node] + 1][node],
          targetNode: currentNode,
        });
        node = prev[node];
      }
      return pathEdges;
    };

    steps.push({
      phase: "init",
      words,
      dp: [...dp],
      minCost: Array(n + 1).fill(1e9),
      prev: Array(n + 1).fill(-1),
      currentI: -1,
      currentJ: -1,
      edges,
      processedNodes: new Set([0]),
      confirmedEdges: new Map(),
      activeEdge: null,
    });

    const minCost = Array(n + 1).fill(1e9);
    const prev = Array(n + 1).fill(-1);
    minCost[0] = 0;

    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < i; j++) {
        let cost = dp[j + 1][i] + minCost[j] + LINE_PENALTY;

        if (DESIRED_LEN - (words[i - 1].last - words[j].first) < 0) {
          cost += 300;
        }

        if (minCost[i] > cost) {
          minCost[i] = cost;
          prev[i] = j;

          const stepConfirmedEdges = new Map(confirmedEdgesMap);

          let currentLayout = "";
          let layoutBreakPoints = [];

          for (let node = i; node >= 0; node = prev[node]) {
            layoutBreakPoints.push(node);
          }
          layoutBreakPoints.reverse();

          let prevIdx = 0;
          for (const idx of layoutBreakPoints) {
            let line = "";
            for (let k = prevIdx; k < idx; k++) {
              line += string.substring(words[k].first, words[k].last) + " ";
            }
            currentLayout += line.trim() + "\n";
            prevIdx = idx;
          }

          if (prevIdx < n) {
            let line = "-----\n";
            for (let k = prevIdx; k < n; k++) {
              line += string.substring(words[k].first, words[k].last) + " ";
            }

            currentLayout += line.trim();
          }
          currentLayout = currentLayout.trim();

          steps.push({
            phase: "min_cost",
            words,
            dp: dp.map((row) => [...row]),
            minCost: [...minCost],
            prev: [...prev],
            currentI: i,
            currentJ: j + 1,
            edges,
            processedNodes: new Set(processedNodes),
            confirmedEdges: stepConfirmedEdges,
            activeEdge: { from: j, to: i, cost: dp[j + 1][i] },
            currentLayout,
          });
        }
      }

      processedNodes.add(i);

      if (i > 0) {
        confirmedEdgesMap.set(i, getShortestPathEdges(i, prev));
      }

      const finalStepConfirmedEdges = new Map(confirmedEdgesMap);

      steps.push({
        phase: "process_complete",
        words,
        dp: dp.map((row) => [...row]),
        minCost: [...minCost],
        prev: [...prev],
        currentI: i,
        currentJ: -1,
        edges,
        processedNodes: new Set(processedNodes),
        confirmedEdges: finalStepConfirmedEdges,
        activeEdge: null,
        currentLayout: steps[steps.length - 1].currentLayout,
      });
    }

    let finalText = "";
    let prevIdx = 0;
    const breakPoints = [];
    for (let i = n - 1; i >= 0; i = prev[i]) {
      breakPoints.push(i);
    }
    breakPoints.reverse();

    for (const idx of breakPoints) {
      let line = "";
      for (let i = prevIdx; i < idx; i++) {
        line += string.substring(words[i].first, words[i].last) + " ";
      }
      finalText += line.trim() + "\n";
      prevIdx = idx;
    }

    return { steps, finalLayout: finalText };
  })();

  const currentStep = steps[Math.min(step, steps.length - 1)];
  const nodeRadius = 20;
  const graphWidth = 600;
  const graphHeight = 300;

  const getNodePosition = (index: number, totalNodes: number) => {
    const angle = (Math.PI / (totalNodes - 1)) * index;
    const x = graphWidth / 2 + (graphWidth / 2 - nodeRadius) * Math.cos(angle);
    const y = graphHeight - nodeRadius - (graphHeight - 2 * nodeRadius) * Math.sin(angle);
    return { x, y };
  };

  const getShortestPathEdges = (currentNode: number, prev: number[]) => {
    const pathEdges = [];
    let node = currentNode;
    while (prev[node] !== -1) {
      pathEdges.push({
        from: prev[node],
        to: node,
        cost: currentStep.dp[prev[node] + 1][node],
      });
      node = prev[node];
    }
    return pathEdges;
  };


  const LineLengthVisualizer = ({ text, desiredLength }: { text: string; desiredLength: number }) => {
    const lines = text.split("-----")[0].trim().split("\n");

    return (
      <div className="relative" style={{ fontSize: 16 }}>

        <div className="absolute top-0 left-0 bottom-0 bg-blue-50 opacity-25" style={{ width: `${desiredLength}ch` }} />

        {lines.map((line, index) => (
          <div key={index} className="relative flex items-center min-h-8">
            <pre className="z-10">{line}</pre>

            <div className="absolute top-0 left-0 right-0 bottom-0 border-r-2 border-red-300" style={{ width: `${desiredLength}ch` }} />

            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-200 opacity-50 w-full">
              {line.length !== desiredLength && (
                <div
                  className={`h-2 absolute top-1/2 -translate-y-1/2 ${line.length > desiredLength ? "bg-red-300 left-0" : "bg-red-300 right-0"}`}
                  style={{
                    width: `${Math.abs(line.length - desiredLength)}ch`,
                    left: line.length > desiredLength ? `${desiredLength}ch` : undefined,
                    right: line.length <= desiredLength ? `calc(100% - ${desiredLength}ch)` : undefined,
                  }}
                />
              )}
            </div>
            <span className="ml-4 text-xs text-gray-500">
              {line.length - desiredLength}文字 cost:{(line.length - desiredLength) ** 2})
            </span>
          </div>
        ))}
        {
          text.split("-----")[1] && (
            <div className="relative flex items-center min-h-8">
              <pre>{"-----\n" + text.split("-----")[1]}</pre>
            </div>
          )
        }
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
    <h1 className="text-3xl font-bold">pretty</h1>
      <div className="mt-4">
        <div className="mt-2 p-8 min-h-[200px] bg-gray-50 rounded whitespace-pre-wrap relative">
          <LineLengthVisualizer text={currentStep.currentLayout || string} desiredLength={DESIRED_LEN} />
        </div>

        <div>
          {(currentStep.currentI > 0 || currentStep.currentJ > 0) && (
            <div>
              <ul className="list-disc list-inside">
                {getShortestPathEdges(currentStep.currentI, currentStep.prev)
                  .sort((a, b) => {
                    if (a.from === b.from) {
                      return a.to - b.to;
                    }
                    return a.from - b.from;
                  })
                  .map((edge, idx, i) => {
                    return (
                      <li key={idx} className="text-sm text-gray-600">
                        {edge.from} → {edge.to} cost: {edge.cost} penalty:{LINE_PENALTY}
                      </li>
                    );
                  })}
              </ul>
              <span className="text-sm font-bold">Total cost: {currentStep.minCost[currentStep.currentI]}</span>
            </div>
          )}
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {/* Graph Visualization */}
          <div className="relative h-96 border rounded-lg p-4">
            <svg width={graphWidth} height={graphHeight} className="mx-auto">
              {/* Draw edges */}
              {currentStep.edges.map((edge, idx) => {
                const from = getNodePosition(edge.from, n + 1);
                const to = getNodePosition(edge.to, n + 1);

                // Check if this edge is currently being evaluated
                const isActive = currentStep.activeEdge?.from === edge.from && currentStep.activeEdge?.to === edge.to;

                // Look for this edge in confirmedEdges
                let isConfirmed = false;
                let targetNode = null;

                for (const [node, paths] of currentStep.confirmedEdges as Map<
                  number,
                  {
                    from: number;
                    to: number;
                    cost: number;
                  }[]
                >) {
                  if (paths.some((e) => e.from === edge.from && e.to === edge.to)) {
                    isConfirmed = true;
                    targetNode = node;
                    break;
                  }
                }

                // Only show edges that are either confirmed or active
                if (!isConfirmed && !isActive) return null;

                let edgeColor = "blue";
                if (isConfirmed) {
                  const hue = 120 + ((targetNode ?? 0 * 30) % 60); // Vary hue around green (120)
                  edgeColor = `hsl(${hue}, 70%, 45%)`;
                }

                return (
                  <g key={`edge-${idx}`}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={edgeColor} strokeWidth={2} />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 10} textAnchor="middle" className="text-xs">
                      {edge.cost + LINE_PENALTY}
                    </text>
                  </g>
                );
              })}

              {/* Draw nodes */}
              {Array.from({ length: n + 1 }).map((_, idx) => {
                const pos = getNodePosition(idx, n + 1);
                const isProcessed = currentStep.processedNodes.has(idx);
                return (
                  <g key={`node-${idx}`}>
                    <circle cx={pos.x} cy={pos.y} r={nodeRadius} fill={isProcessed ? "lightgreen" : "white"} stroke={isProcessed ? "green" : "gray"} strokeWidth="2" />
                    <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="text-sm font-mono">
                      {idx}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Status information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Phase:</strong> {currentStep.phase}
              </p>
              {currentStep.phase === "min_cost" && (
                <>
                  <p>
                    <strong>Current node:</strong> {currentStep.currentI}
                  </p>
                  <p>
                    <strong>Best previous:</strong> {currentStep.currentJ}
                  </p>
                  <p>
                    <strong>Cost:</strong> {currentStep.minCost[currentStep.currentI]}
                  </p>
                </>
              )}
            </div>
            <div>
              <p>
                <strong>Processed nodes:</strong> {[...currentStep.processedNodes].join(", ")}
              </p>
              {currentStep.activeEdge && (
                <p>
                  <strong>Active edge:</strong> {currentStep.activeEdge.from} → {currentStep.activeEdge.to} (cost: {currentStep.activeEdge.cost})
                </p>
              )}
            </div>
          </div>
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

      <Card className="p-4">
        {/* dp tables */}
        <div className={`grid grid-cols-${currentStep.dp.length + 1} gap-2`} style={{ gridTemplateColumns: `repeat(${currentStep.dp.length + 1}, auto)` }}>
          <div className="text-center">i \ j</div>
          {Array.from({ length: currentStep.dp.length }).map((_, idx) => (
            <div key={idx} className="text-center">
              {idx}
            </div>
          ))}
          {currentStep.dp.map((row, idx) => (
            <>
              <div className="text-center">{idx}</div>
              {row.map((cell, j) => (
                <div
                  key={j}
                  className="text-center"
                  style={{
                    backgroundColor: currentStep.currentI === j && currentStep.currentJ === idx ? "lightblue" : "transparent",
                  }}
                >
                  {cell}
                </div>
              ))}
            </>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DPLayoutVisualizer;
