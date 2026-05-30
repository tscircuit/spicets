import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"

export class Include extends DotCommand {
  readonly type = "include" as const
  command = ".include"
  path: string

  constructor(path: string | { path: string }, init: SpiceNodeInit = {}) {
    super(init)
    this.path = typeof path === "string" ? path : path.path
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.path}`
  }
}
