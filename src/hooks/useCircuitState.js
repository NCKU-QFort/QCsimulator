import { useState } from "react";
import { GATE_DEFS } from "../gateDefinitions.js";
import { makeKey } from "../utils.js";

/**
 * Hook for managing quantum circuit state and operations
 * @returns {Object} Circuit state and control functions
 */
export function useCircuitState(nc = 1) {
  const [nq, setNq] = useState(2); // Number of qubits
  const [ns, setNs] = useState(10); // Number of steps
  const [circ, setCirc] = useState({}); // Circuit configuration
  const [selGate, setSelGate] = useState(null); // Selected gate
  const [pending, setPending] = useState(null); // Pending actions
  const [hovered, setHovered] = useState(null); // Hovered cell {q, s}

  const maxIfValue = (1 << Math.max(1, nc)) - 1;

  const getRelatedGateKeys = (q, s, gate) => {
    const k = makeKey(q, s);
    if (!gate) return [k];

    if (gate.type === "CNOT_CTRL" || gate.type === "CZ_CTRL") {
      return [k, makeKey(gate.target, s)];
    }

    if (gate.type === "CNOT_TGT" || gate.type === "CZ_TGT") {
      return [k, makeKey(gate.control, s)];
    }

    if (gate.type === "SWAP_A" || gate.type === "SWAP_B") {
      return [k, makeKey(gate.partner, s)];
    }

    return [k];
  };

  const applyIfCondition = (baseCirc, keys, anchorQubit, value) => {
    const next = { ...baseCirc };

    keys.forEach((key) => {
      if (!next[key]) return;
      next[key] = {
        ...next[key],
        if: {
          value,
          anchor: anchorQubit,
        },
      };
    });

    return next;
  };

  const removeIfCondition = (baseCirc, keys) => {
    const next = { ...baseCirc };

    keys.forEach((key) => {
      if (!next[key] || !next[key].if) return;
      const { if: _unusedIf, ...rest } = next[key];
      next[key] = rest;
    });

    return next;
  };

  const addQ = () => {
    if (nq < 10) {
      setNq((n) => n + 1);
    }
  };

  const rmQ = () => {
    if (nq > 1) {
      const nn = nq - 1;
      const nextCirc = {};

      Object.entries(circ).forEach(([k, v]) => {
        const q = Number.parseInt(k.split("-")[0], 10);

        if (
          q < nn &&
          (v.target === undefined || v.target < nn) &&
          (v.partner === undefined || v.partner < nn)
        ) {
          nextCirc[k] = v;
        }
      });

      setCirc(nextCirc);
      setNq(nn);
    }
  };

  const addS = () => setNs((s) => Math.min(s + 1, 30));

  const rmS = () => {
    if (ns > 1) {
      const nn = ns - 1;
      const nextCirc = {};

      Object.entries(circ).forEach(([k, v]) => {
        if (Number.parseInt(k.split("-")[1], 10) <= nn) nextCirc[k] = v;
      });

      setCirc(nextCirc);
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

  const hasMeasurementInStep = (step, excludeQubit = null) => {
    return Object.entries(circ).some(([k, v]) => {
      if (v.type !== "M") return false;

      const [qStr, sStr] = k.split("-");
      const gateQubit = Number.parseInt(qStr, 10);
      const gateStep = Number.parseInt(sStr, 10);

      if (gateStep !== step) return false;
      if (excludeQubit !== null && gateQubit === excludeQubit) return false;

      return true;
    });
  };

  const handleClick = (q, s) => {
    if (!selGate) {
      const k = makeKey(q, s);
      const ex = circ[k];

      if (ex) {
        const nextCirc = { ...circ };
        delete nextCirc[k];

        if (ex.type === "CNOT_CTRL") delete nextCirc[makeKey(ex.target, s)];
        if (ex.type === "CNOT_TGT") delete nextCirc[makeKey(ex.control, s)];
        if (ex.type === "CZ_CTRL") delete nextCirc[makeKey(ex.target, s)];
        if (ex.type === "CZ_TGT") delete nextCirc[makeKey(ex.control, s)];
        if (ex.type === "SWAP_A") delete nextCirc[makeKey(ex.partner, s)];
        if (ex.type === "SWAP_B") delete nextCirc[makeKey(ex.partner, s)];

        setCirc(nextCirc);
      }

      return;
    }

    if (selGate === "M" && !pending) {
      const k = makeKey(q, s);
      if (circ[k] || hasMeasurementInStep(s)) return;

      setPending({ gate: "M", qubit: q, step: s });
      return;
    }

    if (selGate === "IF") {
      const k = makeKey(q, s);
      const ex = circ[k];
      if (!ex || ex.type === "M") return;

      const keys = getRelatedGateKeys(q, s, ex);
      const existingValue = keys
        .map((key) => circ[key]?.if?.value)
        .find((value) => Number.isInteger(value));
      const ifValue = Number.isInteger(existingValue) ? existingValue : 0;

      setCirc(applyIfCondition(circ, keys, q, ifValue));
      setPending({
        gate: "IF",
        qubit: q,
        step: s,
        keys,
        inputValue: String(ifValue),
      });
      return;
    }

    const gi = GATE_DEFS[selGate];
    if (!gi) return;

    if (pending && ["CNOT", "CZ", "SWAP"].includes(pending.gate)) {
      if (s !== pending.step || q === pending.qubit) {
        setPending(null);
        return;
      }

      const k1 = makeKey(pending.qubit, s);
      const k2 = makeKey(q, s);
      if (circ[k2]) {
        setPending(null);
        return;
      }

      const nextCirc = { ...circ };

      if (pending.gate === "CNOT") {
        nextCirc[k1] = { type: "CNOT_CTRL", target: q };
        nextCirc[k2] = { type: "CNOT_TGT", control: pending.qubit };
      } else if (pending.gate === "CZ") {
        nextCirc[k1] = { type: "CZ_CTRL", target: q };
        nextCirc[k2] = { type: "CZ_TGT", control: pending.qubit };
      } else if (pending.gate === "SWAP") {
        nextCirc[k1] = { type: "SWAP_A", partner: q };
        nextCirc[k2] = { type: "SWAP_B", partner: pending.qubit };
      }

      setCirc(nextCirc);
      setPending(null);
      return;
    }

    const k = makeKey(q, s);
    if (circ[k]) return;

    if (gi.qubits === 2) {
      setPending({ gate: selGate, qubit: q, step: s });
      return;
    }

    setCirc({ ...circ, [k]: { type: selGate } });
  };

  const handleCbitClick = (cbit) => {
    if (!pending || pending.gate !== "M") {
      return;
    }

    const k = makeKey(pending.qubit, pending.step);

    if (hasMeasurementInStep(pending.step, pending.qubit)) {
      setPending(null);
      return;
    }

    setCirc({ ...circ, [k]: { type: "M", cbit } });
    setPending(null);
  };

  const handleIfInputChange = (value) => {
    if (!pending || pending.gate !== "IF") return;
    setPending({ ...pending, inputValue: value });
  };

  const applyPendingIf = () => {
    if (!pending || pending.gate !== "IF") return false;

    const value = Number.parseInt(pending.inputValue, 10);
    const isValid =
      /^\d+$/.test(pending.inputValue) &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= maxIfValue;

    if (!isValid) return false;

    setCirc((prev) => applyIfCondition(prev, pending.keys, pending.qubit, value));
    setPending(null);
    return true;
  };

  const removePendingIf = () => {
    if (!pending || pending.gate !== "IF") return;
    setCirc((prev) => removeIfCondition(prev, pending.keys));
    setPending(null);
  };

  return {
    nq,
    ns,
    circ,
    selGate,
    pending,
    hovered,
    addQ,
    rmQ,
    addS,
    rmS,
    clear,
    selectGate,
    handleClick,
    handleCbitClick,
    handleIfInputChange,
    applyPendingIf,
    removePendingIf,
    setHovered,
  };
}
