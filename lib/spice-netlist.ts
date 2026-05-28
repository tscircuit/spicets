import { BaseSpiceNode } from "./base-node"
import type { SpiceLine } from "./entities"

export interface SpiceNetlistInit {
  lines?: SpiceLine[]
  trailingNewline?: boolean
  lineEnding?: "\n" | "\r\n" | "\r"
}

export class SpiceNetlist extends BaseSpiceNode {
  readonly type = "netlist" as const
  lines: SpiceLine[]
  trailingNewline: boolean
  lineEnding: "\n" | "\r\n" | "\r"

  constructor(init: SpiceNetlistInit = {}) {
    super()
    this.lines = init.lines ?? []
    this.trailingNewline = init.trailingNewline ?? true
    this.lineEnding = init.lineEnding ?? "\n"
  }

  getChildren(): BaseSpiceNode[] {
    return this.lines
  }

  getString(): string {
    const source = this.lines
      .map((line) => line.toSource())
      .join(this.lineEnding)
    return this.trailingNewline ? `${source}${this.lineEnding}` : source
  }

  toSource(): string {
    return this.getString()
  }
}
