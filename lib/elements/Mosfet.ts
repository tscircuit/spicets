import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

function hasOffFlag(tokens: SpiceTokenCard): boolean {
  // The first five arguments are terminal nodes and the model name.
  const optionalTokens = tokens.tokens.slice(6)
  let depth = 0
  for (const [index, token] of optionalTokens.entries()) {
    if (token.type === "comment") break
    if (
      depth === 0 &&
      token.type === "identifier" &&
      token.raw.toLowerCase() === "off" &&
      optionalTokens[index - 1]?.type !== "operator" &&
      optionalTokens[index + 1]?.type !== "operator"
    ) {
      return true
    }
    if (token.type === "string") continue
    for (const char of token.raw) {
      if (char === "{" || char === "(") depth += 1
      if (char === "}" || char === ")") depth = Math.max(0, depth - 1)
    }
  }
  return false
}

export class Mosfet extends ElementCard {
  static spiceTokenKeys = ["M"]
  readonly type = "mosfet" as const
  model: string
  off: boolean

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [
        drain: NodeRefInput,
        gate: NodeRefInput,
        source: NodeRefInput,
        bulk: NodeRefInput,
      ]
      model: string
      off?: boolean
      params?: ParamsInput
    },
  ) {
    super(init)
    this.model = init.model
    this.off = init.off ?? false
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Mosfet {
    const tokens = SpiceTokenCard.from(card)
    return new Mosfet({
      name: tokens.head(),
      nodes: [
        tokens.arg(0) ?? "",
        tokens.arg(1) ?? "",
        tokens.arg(2) ?? "",
        tokens.arg(3) ?? "",
      ],
      model: tokens.arg(4) ?? "",
      off: hasOffFlag(tokens),
      params: tokens.paramsAfter(5),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.model,
        this.off ? "OFF" : undefined,
      ],
      options,
    )
  }
}
ElementCard.register(Mosfet)
