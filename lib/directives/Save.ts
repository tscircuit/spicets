import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { readOutputExpressions } from "./read-output-expressions"

export class Save extends DotCommand {
  static spiceTokenKeys = [".save"]
  readonly type = "save" as const
  command = ".save"
  expressions: string[]

  constructor(expressions: string[], init: SpiceNodeInit = {}) {
    super(init)
    this.expressions = expressions
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Save {
    const tokens = SpiceTokenCard.from(card)
    return new Save(readOutputExpressions(card), {
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, ...this.expressions].join(" ")
  }
}
DotCommand.register(Save)
