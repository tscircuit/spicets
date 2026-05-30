import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

export class Temp extends DotCommand {
  static spiceTokenKeys = [".temp"]
  readonly type = "temp" as const
  command = ".temp"
  values: SpiceValue[]

  constructor(values: SpiceValueInput[], init: SpiceNodeInit = {}) {
    super(init)
    this.values = values.map(normalizeValue)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Temp {
    const tokens = SpiceTokenCard.from(card)
    return new Temp(tokens.args(), { originalSource: tokens.originalSource })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.values.map((value) => value.getString())].join(" ")
  }
}
DotCommand.register(Temp)
