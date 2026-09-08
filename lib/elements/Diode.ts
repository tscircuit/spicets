import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import {
  normalizeValue,
  type SpiceValue,
  type SpiceValueInput,
  type NodeRefInput,
  type ParamsInput,
} from "../values"
import { ElementCard } from "./ElementCard"

export class Diode extends ElementCard {
  static spiceTokenKeys = ["D"]
  readonly type = "diode" as const
  model: string
  area?: SpiceValue
  off: boolean

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [NodeRefInput, NodeRefInput]
      model: string
      area?: SpiceValueInput
      off?: boolean
      params?: ParamsInput
    },
  ) {
    super(init)
    this.model = init.model
    this.area = init.area === undefined ? undefined : normalizeValue(init.area)
    this.off = init.off ?? false
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Diode {
    const tokens = SpiceTokenCard.from(card)
    const fields: string[] = []
    let depth = 0
    let previousEnd: number | undefined
    for (const token of tokens.tokens.slice(4)) {
      if (token.type === "comment") continue
      const gap =
        previousEnd === undefined
          ? ""
          : tokens.originalSource.slice(
              previousEnd - card.range.start.offset,
              token.range.start.offset - card.range.start.offset,
            )
      if (fields.length === 0 || (depth === 0 && gap.length > 0)) {
        fields.push(token.raw)
      } else {
        fields[fields.length - 1] +=
          `${/^[ \t]*$/.test(gap) ? gap : " "}${token.raw}`
      }
      if (token.type !== "string") {
        for (const char of token.raw) {
          if ("({[".includes(char)) depth += 1
          else if (")}]".includes(char)) depth = Math.max(0, depth - 1)
        }
      }
      previousEnd = token.range.end.offset
    }
    const first = fields[0]
    const area =
      first !== undefined &&
      first.toLowerCase() !== "off" &&
      !first.includes("=") &&
      !fields[1]?.startsWith("=")
        ? first
        : undefined
    const off = fields.some(
      (field, index) =>
        field.toLowerCase() === "off" &&
        !fields[index - 1]?.endsWith("=") &&
        !fields[index + 1]?.startsWith("="),
    )
    return new Diode({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      model: tokens.arg(2) ?? "",
      area,
      off,
      params: tokens.paramsAfter(3),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.model,
        this.area?.getString(),
        this.off ? "OFF" : undefined,
      ],
      options,
    )
  }
}
ElementCard.register(Diode)
