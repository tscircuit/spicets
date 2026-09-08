import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard, SpiceToken } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

type DiodeTail =
  | { kind: "area"; raw: string }
  | { kind: "off" }
  | { kind: "param"; name: string; value: string }

function isEquals(token: SpiceToken | undefined): boolean {
  return token?.type === "operator" && token.value === "="
}

export class Diode extends ElementCard {
  static spiceTokenKeys = ["D"]
  readonly type = "diode" as const
  model: string
  area?: string
  off: boolean
  private tail: DiodeTail[]

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [NodeRefInput, NodeRefInput]
      model: string
      params?: ParamsInput
      area?: string
      off?: boolean
      tail?: DiodeTail[]
    },
  ) {
    super(init)
    this.model = init.model
    this.area = init.area
    this.off = init.off ?? false
    this.tail = init.tail ?? [
      ...(init.area !== undefined
        ? [{ kind: "area" as const, raw: init.area }]
        : []),
      ...(init.off ? [{ kind: "off" as const }] : []),
    ]
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Diode {
    const tokens = SpiceTokenCard.from(card)
    const stream = tokens.tokens
    const tail: DiodeTail[] = []
    let area: string | undefined
    let off = false
    const params: Array<[string, string]> = []
    let index = 4

    while (index < stream.length) {
      const token = stream[index]
      if (token === undefined) break
      if (
        token.type === "punctuation" ||
        token.type === "comment" ||
        token.type === "error"
      ) {
        index += 1
        continue
      }
      const next = stream[index + 1]
      const valueToken = stream[index + 2]
      if (isEquals(next) && valueToken !== undefined) {
        const name = token.raw
        const value = valueToken.raw
        tail.push({ kind: "param", name, value })
        params.push([name, value])
        index += 3
        continue
      }
      if (token.raw.toLowerCase() === "off") {
        off = true
        tail.push({ kind: "off" })
        index += 1
        continue
      }
      if (area === undefined && !isEquals(next)) {
        area = token.raw
        tail.push({ kind: "area", raw: token.raw })
        index += 1
        continue
      }
      index += 1
    }

    return new Diode({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      model: tokens.arg(2) ?? "",
      params,
      area,
      off,
      tail,
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    const extras = this.tail.map((item) => {
      if (item.kind === "area") return item.raw
      if (item.kind === "off") return "OFF"
      return `${item.name}=${item.value}`
    })
    if (options?.format !== "pretty" && this.originalSource !== undefined) {
      return this.originalSource
    }
    return [
      this.name,
      ...this.nodes.map((node) => node.getString()),
      this.model,
      ...extras,
    ]
      .filter((part) => part.length > 0)
      .join(" ")
  }
}
ElementCard.register(Diode)
