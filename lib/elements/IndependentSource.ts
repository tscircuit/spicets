import type { SpiceNodeInit } from "../ast"
import {
  SpiceValue,
  type AcSpec,
  type AcSpecInput,
  type NodeRefInput,
  type ParamsInput,
  type SourceWaveformInput,
  type SpiceValueInput,
  normalizeAcSpec,
  normalizeValue,
} from "../values"
import { ElementCard } from "./ElementCard"

export abstract class IndependentSource extends ElementCard {
  dc?: SpiceValue
  ac?: AcSpec
  transient?: SourceWaveformInput

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    dc?: SpiceValueInput
    ac?: AcSpecInput
    transient?: SourceWaveformInput
    params?: ParamsInput
  }) {
    super(init)
    this.dc = init.dc === undefined ? undefined : normalizeValue(init.dc)
    this.ac = init.ac === undefined ? undefined : normalizeAcSpec(init.ac)
    this.transient = init.transient
  }

  override getChildren() {
    return this.transient === undefined ? [] : [this.transient]
  }

  protected sourceParts(): string[] {
    const parts = [this.name, ...this.nodes.map((node) => node.getString())]
    if (this.dc !== undefined) parts.push("DC", this.dc.getString())
    if (this.ac !== undefined) {
      parts.push("AC")
      if (this.ac.magnitude !== undefined) parts.push(this.ac.magnitude.getString())
      if (this.ac.phase !== undefined) parts.push(this.ac.phase.getString())
    }
    if (this.transient !== undefined) parts.push(this.transient.toSource())
    return parts
  }
}
