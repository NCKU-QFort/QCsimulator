import { useMemo, useState } from "react";
import { cAbs2, basisLabel } from "../utils.js";
import { runSim } from "../quantumSimulation.js";

/**
 * Hook for managing quantum circuit simulation
 * @param {number} nq - Number of qubits
 * @param {Object} circ - Circuit configuration
 * @param {number} ns - Number of steps
 * @returns {Object} Simulation state and control functions
 */
export function useSimulation(nq, circ, ns) {
  const [results, setResults] = useState(null);
  const [sv, setSv] = useState(null);
  const [showSv, setShowSv] = useState(false);

  const run = () => {
    const st = runSim(nq, circ, ns);
    setResults(st.map((a) => cAbs2(a)));
    setSv(st);
  };

  const clear = () => {
    setResults(null);
    setSv(null);
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
    showSv,
    chartData,
    // Actions
    run,
    clear,
    setShowSv,
  };
}
