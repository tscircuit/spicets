import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import {
  SpiceValue,
  type NodeRefInput,
  type SpiceValueInput,
  normalizeValue,
} from "../values"
import { ElementCard } from "./ElementCard"

export class Vcvs extends ElementCard {
  static spiceTokenKeys = ["E"]
  readonly type = "vcvs" as const
  gain: SpiceValue

  constructor(
    init: SpiceNodeInit & {
      name: string
      output: [NodeRefInput, NodeRefInput]
      control: [NodeRefInput, NodeRefInput]
      gain: SpiceValueInput
    },
  ) {
    super({ ...init, nodes: [...init.output, ...init.control] })
    this.gain = normalizeValue(init.gain)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Vcvs {
    const tokens = SpiceTokenCard.from(card)
    return new Vcvs({
      name: tokens.head(),
      output: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      control: [tokens.arg(2) ?? "", tokens.arg(3) ?? ""],
      gain: tokens.arg(4) ?? "",
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.gain.getString(),
      ],
      options,
    )
  }
}
ElementCard.register(Vcvs)
