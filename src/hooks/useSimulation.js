import { useMemo, useState } from "react";
import { cAbs2, basisLabel } from "../utils.js";
import { runSim } from "../quantumSimulation.js";

/**
 * Hook for managing quantum circuit simulation
 * @param {number} nq - Number of qubits
 * @param {number} nc - Number of classical bits
 * @param {Object} circ - Circuit configuration
 * @param {number} ns - Number of steps
 * @returns {Object} Simulation state and control functions
 */
export function useSimulation(nq, nc, circ, ns) {
  const [results, setResults] = useState(null);
  const [shotCounts, setShotCounts] = useState(null);
  const [shotsExecuted, setShotsExecuted] = useState(0);
  const [resultBitCount, setResultBitCount] = useState(nq);
  const [isMeasurementResult, setIsMeasurementResult] = useState(false);
  const [sv, setSv] = useState(null);
  const [cbits, setCbits] = useState(null);
  const [showSv, setShowSv] = useState(false);

  const getMeasuredCbitIndices = () => {
    const usedCbits = new Set();

    Object.entries(circ).forEach(([, gate]) => {
      if (!gate || gate.type !== "M" || gate.cbit === undefined) return;

      if (Number.isInteger(gate.cbit) && gate.cbit >= 0 && gate.cbit < nc) {
        usedCbits.add(gate.cbit);
      }
    });

    return [...usedCbits].sort((a, b) => a - b);
  };

  const sampleStateIndex = (state) => {
    const r = Math.random();
    let cumulative = 0;

    for (let i = 0; i < state.length; i++) {
      cumulative += cAbs2(state[i]);
      if (r <= cumulative) return i;
    }

    return state.length - 1;
  };

  const run = (shots = 1000) => {
    if (!Number.isInteger(shots) || shots < 1) return;

    const dimension = 1 << nq;
    const counts = Array(dimension).fill(0);
    const measuredCbitIndices = getMeasuredCbitIndices();
    const hasMeasurements = measuredCbitIndices.length > 0;
    const cbitCounts = hasMeasurements ? Array(1 << nc).fill(0) : null;
    let lastState = null;
    let lastCbits = null;

    for (let i = 0; i < shots; i++) {
      const { state, cbits: measuredCbits } = runSim(nq, nc, circ, ns);
      const sampledStateIndex = sampleStateIndex(state);

      counts[sampledStateIndex] += 1;

      if (cbitCounts) {
        let cbitIndex = 0;

        // Bitstring label order is c_(n-1) ... c_0, so build index in that order.
        for (let c = nc - 1; c >= 0; c--) {
          const bit = measuredCbits?.[c] === 1 ? 1 : 0;
          cbitIndex = (cbitIndex << 1) | bit;
        }

        cbitCounts[cbitIndex] += 1;
      }

      lastState = state;
      lastCbits = measuredCbits;
    }

    const finalCounts = cbitCounts || counts;

    setShotCounts(finalCounts);
    setShotsExecuted(shots);
    setResults(finalCounts.map((count) => count / shots));
    setResultBitCount(cbitCounts ? nc : nq);
    setIsMeasurementResult(Boolean(cbitCounts));
    setSv(lastState);
    setCbits(lastCbits);
  };

  const clear = () => {
    setResults(null);
    setShotCounts(null);
    setShotsExecuted(0);
    setResultBitCount(nq);
    setIsMeasurementResult(false);
    setSv(null);
    setCbits(null);
  };

  const chartData = useMemo(() => {
    if (!results || !shotCounts) return [];

    return results
      .map((p, i) => ({
        state: basisLabel(i, resultBitCount),
        probability: Math.round(p * 10000) / 10000,
        count: shotCounts[i] || 0,
      }));
  }, [results, resultBitCount, isMeasurementResult, shotCounts]);

  return {
    // State
    results,
    shotCounts,
    shotsExecuted,
    sv,
    cbits,
    showSv,
    chartData,
    // Actions
    run,
    clear,
    setShowSv,
  };
}
