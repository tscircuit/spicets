import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { tokenValue } from "../tokens/logicalCards"
import {
  type NodeRefInput,
  normalizeValue,
  type ParamsInput,
  type SpiceValue,
  type SpiceValueInput,
} from "../values"
import { ElementCard } from "./ElementCard"

export class Diode extends ElementCard {
  static spiceTokenKeys = ["D"]
  readonly type = "diode" as const
  model: string
  area?: SpiceValue
  off: boolean
  private offParamIndex?: number

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [NodeRefInput, NodeRefInput]
      model: string
      area?: SpiceValueInput
      off?: boolean
      offParamIndex?: number
      params?: ParamsInput
    },
  ) {
    super(init)
    this.model = init.model
    this.area = init.area === undefined ? undefined : normalizeValue(init.area)
    this.off = init.off ?? false
    this.offParamIndex = init.offParamIndex
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Diode {
    const tokens = SpiceTokenCard.from(card)
    let area: string | undefined
    let off = false
    let offParamIndex: number | undefined
    let paramCount = 0

    let index = 4
    while (index < tokens.tokens.length) {
      const tok = tokens.tokens[index]
      if (!tok) break
      if (
        tok.type === "punctuation" &&
        (tok.value === "(" || tok.value === ")" || tok.value === ",")
      ) {
        index += 1
        continue
      }
      const nextTok = tokens.tokens[index + 1]
      const valTok = tokens.tokens[index + 2]
      if (
        nextTok?.type === "operator" &&
        nextTok.value === "=" &&
        valTok !== undefined
      ) {
        paramCount += 1
        index += 3
        continue
      }
      const text = tokenValue(tok) ?? tok.raw
      if (text.toLowerCase() === "off") {
        off = true
        if (offParamIndex === undefined) {
          offParamIndex = paramCount
        }
      } else if (area === undefined && index === 4 && tok.type !== "comment") {
        area = tok.raw
      }
      index += 1
    }

    return new Diode({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      model: tokens.arg(2) ?? "",
      area,
      off,
      offParamIndex,
      params: tokens.paramsAfter(3),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) {
      return this.originalSource
    }
    const paramParts = this.params
      .entries()
      .map(([name, value]) => `${name}=${value.getString()}`)
    if (this.off) {
      const insertAt = Math.min(this.offParamIndex ?? 0, paramParts.length)
      paramParts.splice(insertAt, 0, "OFF")
    }
    return [
      this.name,
      ...this.nodes.map((node) => node.getString()),
      this.model,
      this.area?.getString(),
      ...paramParts,
    ]
      .filter((part): part is string => part !== undefined && part.length > 0)
      .join(" ")
  }
}
ElementCard.register(Diode)
