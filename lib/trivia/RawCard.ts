import { SpiceCard } from "../ast"

export class RawCard extends SpiceCard {
  readonly type = "raw_card" as const
  readonly cardKind = "raw" as const
  source: string

  constructor(source: string) {
    super({ originalSource: source })
    this.source = source
  }

  getChildren(): [] {
    return []
  }

  toSource(): string {
    return this.source
  }
}
