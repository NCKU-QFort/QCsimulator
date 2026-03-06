import { useState } from "react";
import { GATE_DEFS } from "../gateDefinitions.js";

/**
 * Hook for managing quantum circuit state and operations
 * @returns {Object} Circuit state and control functions
 */
export function useCircuitState() {
  const [nq, setNq] = useState(2); // Number of qubits
  const [ns, setNs] = useState(10); // Number of steps
  const [circ, setCirc] = useState({}); // Circuit configuration
  const [selGate, setSelGate] = useState(null); // Selected gate
  const [pending, setPending] = useState(null); // Pending multi-qubit gate
  const [hovered, setHovered] = useState(null); // Hovered cell {q, s}

  const addQ = () => {
    if (nq < 8) {
      setNq((n) => n + 1);
    }
  };

  const rmQ = () => {
    if (nq > 1) {
      const nn = nq - 1;
      const nc = {};

      Object.entries(circ).forEach(([k, v]) => {
        const q = Number.parseInt(k.split("-")[0], 10);

        if (
          q < nn &&
          (v.target === undefined || v.target < nn) &&
          (v.partner === undefined || v.partner < nn)
        ) {
          nc[k] = v;
        }
      });

      setCirc(nc);
      setNq(nn);
    }
  };

  const addS = () => setNs((s) => Math.min(s + 1, 30));

  const rmS = () => {
    if (ns > 1) {
      const nn = ns - 1;
      const nc = {};

      Object.entries(circ).forEach(([k, v]) => {
        if (Number.parseInt(k.split("-")[1], 10) < nn) nc[k] = v;
      });

      setCirc(nc);
      setNs(nn);
    }
  };

  const clear = () => {
    setCirc({});
    setPending(null);
  };

  const selectGate = (g) => {
    setSelGate(selGate === g ? null : g);
    setPending(null);
  };

  const handleClick = (q, s) => {
    if (!selGate) {
      const k = `${q}-${s}`;
      const ex = circ[k];

      if (ex) {
        const nc = { ...circ };
        delete nc[k];

        if (ex.type === "CNOT_CTRL") delete nc[`${ex.target}-${s}`];
        if (ex.type === "CNOT_TGT") delete nc[`${ex.control}-${s}`];
        if (ex.type === "CZ_CTRL") delete nc[`${ex.target}-${s}`];
        if (ex.type === "CZ_TGT") delete nc[`${ex.control}-${s}`];
        if (ex.type === "SWAP_A") delete nc[`${ex.partner}-${s}`];
        if (ex.type === "SWAP_B") delete nc[`${ex.partner}-${s}`];

        setCirc(nc);
      }

      return;
    }

    if (selGate === "M" && !pending) {
      const k = `${q}-${s}`;
      if (circ[k]) return;

      setCirc({ ...circ, [k]: { type: "M" } });
      return;
    }

    const gi = GATE_DEFS[selGate];
    if (!gi) return;

    if (pending) {
      if (s !== pending.step || q === pending.qubit) {
        setPending(null);
        return;
      }

      const k1 = `${pending.qubit}-${s}`;
      const k2 = `${q}-${s}`;
      if (circ[k2]) {
        setPending(null);
        return;
      }

      const nc = { ...circ };

      if (pending.gate === "CNOT") {
        nc[k1] = { type: "CNOT_CTRL", target: q };
        nc[k2] = { type: "CNOT_TGT", control: pending.qubit };
      } else if (pending.gate === "CZ") {
        nc[k1] = { type: "CZ_CTRL", target: q };
        nc[k2] = { type: "CZ_TGT", control: pending.qubit };
      } else if (pending.gate === "SWAP") {
        nc[k1] = { type: "SWAP_A", partner: q };
        nc[k2] = { type: "SWAP_B", partner: pending.qubit };
      }

      setCirc(nc);
      setPending(null);
      return;
    }

    const k = `${q}-${s}`;
    if (circ[k]) return;

    if (gi.qubits === 2) {
      setPending({ gate: selGate, qubit: q, step: s });
      return;
    }

    setCirc({ ...circ, [k]: { type: selGate } });
  };

  return {
    // State
    nq,
    ns,
    circ,
    selGate,
    pending,
    hovered,
    // Actions
    addQ,
    rmQ,
    addS,
    rmS,
    clear,
    selectGate,
    handleClick,
    setHovered,
  };
}
