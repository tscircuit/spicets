import { DotCommand, type SpiceSerializeOptions } from "../ast"

export class End extends DotCommand {
  readonly type = "end" as const
  command = ".end"

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return this.command
  }
}
