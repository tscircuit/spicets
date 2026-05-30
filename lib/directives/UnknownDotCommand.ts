import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"

export class UnknownDotCommand extends DotCommand {
  readonly type = "unknown_dot_command" as const
  command: string
  args: string[]

  constructor(init: SpiceNodeInit & { command: string; args: string[] }) {
    super(init)
    this.command = init.command
    this.args = init.args
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.args].join(" ")
  }
}
