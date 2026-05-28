export type SpiceNodeType =
  | "netlist"
  | "element"
  | "directive"
  | "comment"
  | "blank_line"
  | "unknown_line"

export interface SpiceNodeInit {
  raw?: string
}

export abstract class BaseSpiceNode {
  readonly raw?: string
  abstract readonly type: SpiceNodeType

  constructor(init: SpiceNodeInit = {}) {
    this.raw = init.raw
  }

  abstract getChildren(): BaseSpiceNode[]
  abstract toSource(): string
}
