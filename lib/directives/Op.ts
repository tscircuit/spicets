import { AnalysisCommand, type SpiceSerializeOptions } from "../ast"

export class Op extends AnalysisCommand {
  readonly type = "op" as const
  command = ".op"

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return this.command
  }
}
