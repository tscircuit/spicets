import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName, parseParamTokenStrings } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Bjt extends ElementCard {
  readonly type = "bjt" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [collector: NodeRefInput, base: NodeRefInput, emitter: NodeRefInput, substrate?: NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super({
      ...init,
      nodes: init.nodes.filter((node): node is NodeRefInput => node !== undefined),
    })
    this.model = init.model
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Bjt {
    const args = elementArgs(card)
    const hasSubstrate = args.length > 4
    const nodes: [string, string, string, string?] = hasSubstrate
      ? [args[0] ?? "", args[1] ?? "", args[2] ?? "", args[3] ?? ""]
      : [args[0] ?? "", args[1] ?? "", args[2] ?? ""]
    const modelIndex = hasSubstrate ? 4 : 3
    return new Bjt({
      name: elementName(card),
      nodes,
      model: args[modelIndex] ?? "",
      params: parseParamTokenStrings(args.slice(modelIndex + 1)),
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}
