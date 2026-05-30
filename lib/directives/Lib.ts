import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"

export class Lib extends DotCommand {
  readonly type = "lib" as const
  command = ".lib"
  path?: string
  section?: string

  constructor(init: SpiceNodeInit & { path?: string; section?: string } = {}) {
    super(init)
    this.path = init.path
    this.section = init.section
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, this.path, this.section].filter(Boolean).join(" ")
  }
}
