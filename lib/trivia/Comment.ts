import { SpiceTrivia, type SpiceSerializeOptions } from "../ast"

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
