import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"

export class Save extends DotCommand {
  readonly type = "save" as const
  command = ".save"
  expressions: string[]

  constructor(expressions: string[], init: SpiceNodeInit = {}) {
    super(init)
    this.expressions = expressions
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.expressions].join(" ")
  }
}
