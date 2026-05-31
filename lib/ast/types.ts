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

export type SpiceCardKind =
  | "element"
  | "directive"
  | "comment"
  | "blank"
  | "raw"
