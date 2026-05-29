import { Pulse, VoltageSource } from "../index"

export const clockSource = new VoltageSource({
  name: "VCLK",
  nodes: ["clk", "0"],
  transient: new Pulse({
    initial: 0,
    pulsed: 3.3,
    delay: "1ns",
    rise: "100ps",
    fall: "100ps",
    width: "5ns",
    period: "10ns",
  }),
})
