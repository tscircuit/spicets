import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"

export class ControlBlock extends DotCommand {
  readonly type = "control" as const
  command = ".control"
  lines: string[]

  constructor(init: SpiceNodeInit & { lines: string[] }) {
    super(init)
    this.lines = init.lines
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.lines, ".endc"].join("\n")
  }
}
