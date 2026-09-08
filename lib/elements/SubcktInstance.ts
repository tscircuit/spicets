import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class SubcktInstance extends ElementCard {
  static spiceTokenKeys = ["X"]
  readonly type = "subckt_instance" as const
  subckt: string

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: NodeRefInput[]
      subckt: string
      params?: ParamsInput
    },
  ) {
    super(init)
    this.subckt = init.subckt
  }

  static fromSpiceTokens(card: SpiceLogicalCard): SubcktInstance {
    const tokens = SpiceTokenCard.from(card)
    const args = tokens.args()
    const markerIndex = tokens.keywordIndex("params:")
    const assignmentIndex = args.indexOf("=")
    const parameterStart =
      markerIndex !== -1
        ? markerIndex
        : assignmentIndex !== -1
          ? assignmentIndex - 1
          : args.length
    const subcktIndex = parameterStart - 1
    return new SubcktInstance({
      name: tokens.head(),
      nodes: args.slice(0, Math.max(0, subcktIndex)),
      subckt: args[subcktIndex] ?? "",
      params:
        markerIndex !== -1
          ? tokens.paramsAfterKeyword("params:")
          : tokens.paramsAfter(parameterStart),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.subckt],
      options,
    )
  }
}
ElementCard.register(SubcktInstance)
