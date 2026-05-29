export type SpiceDialect =
  | "generic"
  | "spice3"
  | "ngspice"
  | "ltspice"
  | "pspice"
  | "xyce"

export interface SourceSpan {
  start: number
  end: number
}

export interface SpiceParseOptions {
  dialect?: SpiceDialect
  preserveTrivia?: boolean
  preserveRaw?: boolean
  strict?: boolean
}

export interface SpiceSerializeOptions {
  dialect?: SpiceDialect
  format?: "pretty" | "preserve"
  lineWidth?: number
  continuation?: "plus" | "backslash"
  end?: "auto" | "always" | "never"
  numericFormat?: "preserve" | "normalized"
}

export interface SpiceNodeInit {
  originalSource?: string
  sourceSpan?: SourceSpan
  trailingComment?: string
}

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

export abstract class SpiceTrivia extends SpiceNode {
  abstract override readonly type: "comment" | "blank"
}

export type SpiceCardKind = "element" | "directive" | "comment" | "blank" | "raw"

export abstract class SpiceCard extends SpiceNode {
  abstract readonly cardKind: SpiceCardKind
  originalSource?: string

  constructor(init: SpiceNodeInit = {}) {
    super(init)
    this.originalSource = init.originalSource
  }
}

export abstract class DotCommand extends SpiceCard {
  readonly cardKind = "directive" as const
  abstract command: string
}

export abstract class AnalysisCommand extends DotCommand {}
