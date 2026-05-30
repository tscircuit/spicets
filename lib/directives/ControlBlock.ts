import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class ControlBlock extends DotCommand {
  static spiceTokenKeys = [".control"]
  readonly type = "control" as const
  command = ".control"
  lines: string[]

  constructor(init: SpiceNodeInit & { lines: string[] }) {
    super(init)
    this.lines = init.lines
  }

  static fromSpiceTokens(card: SpiceLogicalCard): ControlBlock {
    const tokens = SpiceTokenCard.from(card)
    return new ControlBlock({
      lines: card.childCards?.map((childCard) => childCard.originalSource) ?? [],
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.lines, ".endc"].join("\n")
  }
}
DotCommand.register(ControlBlock)
