export type SourcePosition = {
  offset: number
  line: number
  column: number
}

export type SourceRange = {
  start: SourcePosition
  end: SourcePosition
}

export type SpiceTokenType =
  | "directive"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "punctuation"
  | "comment"
  | "continuation"
  | "newline"
  | "whitespace"
  | "error"

export type BaseToken = {
  type: SpiceTokenType
  raw: string
  range: SourceRange
}

export type SpiceTokenDirective = BaseToken & {
  type: "directive"
  value: string
}

export type SpiceTokenIdentifier = BaseToken & {
  type: "identifier"
  value: string
}

export type SpiceTokenNumber = BaseToken & {
  type: "number"
  value: number | null
  unitSuffix?: string
}

export type SpiceTokenString = BaseToken & {
  type: "string"
  value: string
  quote: '"' | "'"
}

export type SpiceTokenOperator = BaseToken & {
  type: "operator"
  value: string
}

export type SpiceTokenPunctuation = BaseToken & {
  type: "punctuation"
  value: string
}

export type SpiceTokenComment = BaseToken & {
  type: "comment"
  value: string
  marker: "*" | ";" | "$"
}

export type SpiceTokenContinuation = BaseToken & {
  type: "continuation"
}

export type SpiceTokenNewline = BaseToken & {
  type: "newline"
  raw: "\n" | "\r\n" | "\r"
}

export type SpiceTokenWhitespace = BaseToken & {
  type: "whitespace"
}

export type SpiceTokenError = BaseToken & {
  type: "error"
  message: string
}

export type SpiceToken =
  | SpiceTokenDirective
  | SpiceTokenIdentifier
  | SpiceTokenNumber
  | SpiceTokenString
  | SpiceTokenOperator
  | SpiceTokenPunctuation
  | SpiceTokenComment
  | SpiceTokenContinuation
  | SpiceTokenNewline
  | SpiceTokenWhitespace
  | SpiceTokenError

export type SpiceTokenizerError = {
  message: string
  raw: string
  range: SourceRange
}

export type SpiceTokenizationResult = {
  tokens: SpiceToken[]
  errors: SpiceTokenizerError[]
  source: {
    text: string
    lineCount: number
  }
}

export type SpiceTokenizerOptions = {
  preserveWhitespace?: boolean
  preserveComments?: boolean
  normalizeNumbers?: boolean
}

export type SpiceLogicalCard = {
  tokens: SpiceToken[]
  originalSource: string
  range: SourceRange
  leadingNewlineRaw?: "\n" | "\r\n" | "\r"
  childCards?: SpiceLogicalCard[]
  endCard?: SpiceLogicalCard
}
