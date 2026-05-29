import {
  Op,
  Resistor,
  SpiceNetlist,
  Subckt,
  SubcktInstance,
  VoltageSource,
} from "../index"

export const divider = new Subckt({
  name: "divider",
  pins: ["vin", "vout", "0"],
  params: {
    rtop: "10k",
    rbot: "10k",
  },
  cards: [
    new Resistor({
      name: "Rtop",
      nodes: ["vin", "vout"],
      resistance: "{rtop}",
    }),
    new Resistor({
      name: "Rbot",
      nodes: ["vout", "0"],
      resistance: "{rbot}",
    }),
  ],
})

export const dividerDemo = new SpiceNetlist({
  title: "divider demo",
  cards: [
    divider,
    new VoltageSource({
      name: "V1",
      nodes: ["vin", "0"],
      dc: 5,
    }),
    new SubcktInstance({
      name: "X1",
      nodes: ["vin", "vout", "0"],
      subckt: "divider",
      params: {
        rtop: "20k",
      },
    }),
    new Op(),
  ],
})
