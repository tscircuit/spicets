import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { ParamList, type ParamsInput } from "../values"

export class Options extends DotCommand {
  static spiceTokenKeys = [".options"]
  readonly type = "options" as const
  command = ".options"
  values: ParamList

  constructor(values: ParamsInput, init: SpiceNodeInit = {}) {
    super(init)
    this.values = new ParamList(values)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Options {
    const tokens = SpiceTokenCard.from(card)
    return new Options(tokens.paramsAfter(0), {
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return `${this.command} ${this.values.getString(options)}`.trimEnd()
  }
}
DotCommand.register(Options)
