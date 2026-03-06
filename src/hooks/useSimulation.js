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
  const [sv, setSv] = useState(null);
  const [cbits, setCbits] = useState(null);
  const [showSv, setShowSv] = useState(false);

  const run = () => {
    const { state, cbits: measuredCbits } = runSim(nq, nc, circ, ns);
    setResults(state.map((a) => cAbs2(a)));
    setSv(state);
    setCbits(measuredCbits);
  };

  const clear = () => {
    setResults(null);
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
