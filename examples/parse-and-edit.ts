import { Resistor, Tran, parseSpiceNetlist } from "../index"

export function updateAmplifier(source: string): string {
  const netlist = parseSpiceNetlist(source, { dialect: "ngspice" })
  const rload = netlist.findElement("RLOAD")

  if (rload instanceof Resistor) {
    rload.resistance.raw = "2.2k"
  }

  netlist.add(new Tran({ step: "10n", stop: "10u" }))

  return netlist.getString()
}
