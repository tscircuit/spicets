import { SpiceCard, SpiceTrivia, type SpiceSerializeOptions } from "./ast"

export class Comment extends SpiceTrivia {
  readonly type = "comment" as const
  readonly cardKind = "comment" as const
  text: string
  marker: "*" | ";" | "$"
  originalSource?: string

  constructor(text: string, init: { marker?: "*" | ";" | "$"; originalSource?: string } = {}) {
    super()
    this.text = text
    this.marker = init.marker ?? "*"
    this.originalSource = init.originalSource
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) {
      return this.originalSource
    }
    return `${this.marker} ${this.text}`.trimEnd()
  }
}

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
