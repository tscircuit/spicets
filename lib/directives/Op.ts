import { AnalysisCommand, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class Op extends AnalysisCommand {
  static spiceTokenKeys = [".op"]
  readonly type = "op" as const
  command = ".op"

  static fromSpiceTokens(card: SpiceLogicalCard): Op {
    return new Op({ originalSource: SpiceTokenCard.from(card).originalSource })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return this.command
  }
}
AnalysisCommand.register(Op)
