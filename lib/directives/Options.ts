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
  flags: string[]

  constructor(
    values: ParamsInput,
    init: SpiceNodeInit & { flags?: string[] } = {},
  ) {
    super(init)
    this.values = new ParamList(values)
    this.flags = [...(init.flags ?? [])]
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Options {
    const tokens = SpiceTokenCard.from(card)
    const flags: string[] = []
    const values: Array<[string, string]> = []
    for (let index = 1; index < tokens.tokens.length; index++) {
      const token = tokens.tokens[index]
      if (token?.type !== "identifier") continue
      if (tokens.tokens[index + 1]?.raw === "=") {
        index += 2
        const firstValueToken = tokens.tokens[index]
        if (firstValueToken) {
          let depth = 0
          while (index < tokens.tokens.length) {
            const valueToken = tokens.tokens[index]
            if (valueToken && valueToken.type !== "string") {
              for (const character of valueToken.raw) {
                if (["{", "(", "["].includes(character)) depth++
                if (["}", ")", "]"].includes(character)) depth--
              }
            }
            const nextToken = tokens.tokens[index + 1]
            const isExpressionOperator = (raw: string | undefined) =>
              raw !== undefined && ["+", "-", "*", "/", "^"].includes(raw)
            if (
              !nextToken ||
              (depth <= 0 &&
                nextToken.range.start.offset >
                  (valueToken?.range.end.offset ?? 0) &&
                !isExpressionOperator(valueToken?.raw) &&
                !isExpressionOperator(nextToken.raw))
            )
              break
            index++
          }
          const lastValueToken = tokens.tokens[index]
          if (lastValueToken)
            values.push([
              token.value,
              tokens.originalSource.slice(
                firstValueToken.range.start.offset - card.range.start.offset,
                lastValueToken.range.end.offset - card.range.start.offset,
              ),
            ])
        }
      } else {
        flags.push(token.value)
      }
    }
    return new Options(values, {
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
      .filter(Boolean)
      .join(" ")
  }
}
DotCommand.register(Options)
