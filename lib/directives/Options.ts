import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { tokenValue } from "../tokens/logicalCards"
import { ParamList, type ParamsInput } from "../values"

export class Options extends DotCommand {
  static spiceTokenKeys = [".options"]
  readonly type = "options" as const
  command = ".options"
  values: ParamList
  flags: string[]

  constructor(
    values: ParamsInput = [],
    init: SpiceNodeInit & { flags?: string[] } = {},
  ) {
    super(init)
    this.values = new ParamList(values)
    this.flags = init.flags ? [...init.flags] : []
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Options {
    const tokens = SpiceTokenCard.from(card)
    const flags: string[] = []
    let index = 1
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
        index += 3
        continue
      }
      if (
        tok.type !== "comment" &&
        !(tok.type === "operator" && tok.value === "=")
      ) {
        const text = tokenValue(tok) ?? tok.raw
        if (text) flags.push(text)
      }
      index += 1
    }
    return new Options(tokens.paramsAfter(0), {
      flags,
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, ...this.flags, this.values.getString(options)]
      .filter((part) => part.length > 0)
      .join(" ")
  }
}
DotCommand.register(Options)
