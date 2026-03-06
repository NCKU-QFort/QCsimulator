const S2 = 1 / Math.sqrt(2);

// Gate categories for UI display
export const SINGLE_QUBIT_GATES = ["I", "H", "X", "Y", "Z", "S", "T"];
export const MULTI_QUBIT_GATES = ["CNOT", "CZ", "SWAP"];

export const GATE_DEFS = {
  I: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [1, 0], // 1 + 0i = 1
      ],
    ],
    label: "I",
    color: "#94A3B8",
    bg: "#F1F5F9",
    desc: "Identity",
    qubits: 1,
  },
  H: {
    matrix: [
      [
        [S2, 0],  // 1/√2 + 0i
        [S2, 0],  // 1/√2 + 0i
      ],
      [
        [S2, 0],  //  1/√2 + 0i
        [-S2, 0], // -1/√2 + 0i
      ],
    ],
    label: "H",
    color: "#D97706",
    bg: "#FFFBEB",
    desc: "Hadamard",
    qubits: 1,
  },
  X: {
    matrix: [
      [
        [0, 0], // 0 + 0i = 0
        [1, 0], // 1 + 0i = 1
      ],
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
    ],
    label: "X",
    color: "#DC2626",
    bg: "#FEF2F2",
    desc: "Pauli-X",
    qubits: 1,
  },
  Y: {
    matrix: [
      [
        [0, 0],  // 0 + 0i =  0
        [0, -1], // 0 - 1i = -i
      ],
      [
        [0, 1],  // 0 + 1i =  i
        [0, 0],  // 0 + 0i =  0
      ],
    ],
    label: "Y",
    color: "#059669",
    bg: "#ECFDF5",
    desc: "Pauli-Y",
    qubits: 1,
  },
  Z: {
    matrix: [
      [
        [1, 0],  // 1 + 0i = 1
        [0, 0],  // 0 + 0i = 0
      ],
      [
        [0, 0],  //  0 + 0i =  0
        [-1, 0], // -1 + 0i = -1
      ],
    ],
    label: "Z",
    color: "#2563EB",
    bg: "#EFF6FF",
    desc: "Pauli-Z",
    qubits: 1,
  },
  S: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [0, 1], // 0 + 1i = i
      ],
    ],
    label: "S",
    color: "#7C3AED",
    bg: "#F5F3FF",
    desc: "Phase(S)",
    qubits: 1,
  },
  T: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)], // cos(π/4) + i*sin(π/4)
      ],
    ],
    label: "T",
    color: "#0D9488",
    bg: "#F0FDFA",
    desc: "π/8",
    qubits: 1,
  },
  CNOT: {
    label: "CX",
    color: "#DC2626",
    bg: "#FEF2F2",
    desc: "CNOT",
    qubits: 2,
  },
  CZ: {
    label: "CZ",
    color: "#2563EB",
    bg: "#EFF6FF",
    desc: "CZ",
    qubits: 2,
  },
  SWAP: {
    label: "SW",
    color: "#D97706",
    bg: "#FFFBEB",
    desc: "SWAP",
    qubits: 2,
  },
};
