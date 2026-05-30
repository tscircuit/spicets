import type { SourceSpan, SpiceNodeInit, SpiceSerializeOptions } from "./types"
import type { SpiceTrivia } from "./SpiceTrivia"

export abstract class SpiceNode {
  abstract readonly type: string
  sourceSpan?: SourceSpan
  leadingTrivia: SpiceTrivia[] = []
  trailingComment?: string

  constructor(init: SpiceNodeInit = {}) {
    this.sourceSpan = init.sourceSpan
    this.trailingComment = init.trailingComment
  }

  abstract getChildren(): SpiceNode[]
  abstract toSource(options?: SpiceSerializeOptions): string

  getString(options?: SpiceSerializeOptions): string {
    return this.toSource(options)
  }
}
