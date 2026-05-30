import { SpiceTrivia } from "../ast"

export class BlankLine extends SpiceTrivia {
  readonly type = "blank" as const
  readonly cardKind = "blank" as const
  originalSource?: string

  constructor(init: { originalSource?: string } = {}) {
    super()
    this.originalSource = init.originalSource
  }

  getChildren(): [] {
    return []
  }

  toSource(): string {
    return this.originalSource ?? ""
  }
}
