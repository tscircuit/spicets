import {
  Capacitor,
  Resistor,
  SpiceNetlist,
  Tran,
  VoltageSource,
} from "../index"

export const rcLowPass = new SpiceNetlist({
  title: "RC low-pass demo",
  cards: [
    new VoltageSource({
      name: "V1",
      nodes: ["vin", "0"],
      dc: 5,
    }),
    new Resistor({
      name: "R1",
      nodes: ["vin", "vout"],
      resistance: "10k",
    }),
    new Capacitor({
      name: "C1",
      nodes: ["vout", "0"],
      capacitance: "100n",
    }),
    new Tran({
      step: "1us",
      stop: "10ms",
    }),
  ],
})
