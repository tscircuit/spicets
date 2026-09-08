import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Bjt extends ElementCard {
  static spiceTokenKeys = ["Q"]
  readonly type = "bjt" as const
  model: string

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [
        collector: NodeRefInput,
        base: NodeRefInput,
        emitter: NodeRefInput,
        substrate?: NodeRefInput,
      ]
      model: string
      params?: ParamsInput
    },
  ) {
    super({
      ...init,
      nodes: init.nodes.filter(
        (node): node is NodeRefInput => node !== undefined,
      ),
    })
    this.model = init.model
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Bjt {
    const tokens = SpiceTokenCard.from(card)
    const positional = tokens.positionalValueTokens()
    const modelToken = positional.at(-1)
    const nodeTokens = positional.slice(0, -1)
    const nodes = nodeTokens.map((token) => token.raw) as [
      string,
      string,
      string,
      string?,
    ]
    const paramStartArgIndex = positional.length
    return new Bjt({
      name: tokens.head(),
      nodes,
      model: modelToken?.raw ?? "",
      params: tokens.paramsAfter(paramStartArgIndex),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}
ElementCard.register(Bjt)
