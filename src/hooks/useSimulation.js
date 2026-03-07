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
  const [sv, setSv] = useState(null);
  const [cbits, setCbits] = useState(null);
  const [showSv, setShowSv] = useState(false);

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
    let lastState = null;
    let lastCbits = null;

    for (let i = 0; i < shots; i++) {
      const { state, cbits: measuredCbits } = runSim(nq, nc, circ, ns);
      const sampledStateIndex = sampleStateIndex(state);

      counts[sampledStateIndex] += 1;
      lastState = state;
      lastCbits = measuredCbits;
    }

    setShotCounts(counts);
    setShotsExecuted(shots);
    setResults(counts.map((count) => count / shots));
    setSv(lastState);
    setCbits(lastCbits);
  };

  const clear = () => {
    setResults(null);
    setShotCounts(null);
    setShotsExecuted(0);
    setSv(null);
    setCbits(null);
  };

  const chartData = useMemo(() => {
    if (!results) return [];

    return results
      .map((p, i) => ({
        state: basisLabel(i, nq),
        probability: Math.round(p * 10000) / 10000,
      }))
      .filter((d) => d.probability > 0.0001);
  }, [results, nq]);

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
