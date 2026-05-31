import type {
  SourcePosition,
  SourceRange,
  SpiceToken,
  SpiceTokenizationResult,
  SpiceTokenizerError,
  SpiceTokenizerOptions,
} from "./types"

const numberPattern =
  /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?([a-zA-Z]+)?$/
const operatorChars = new Set(["=", "+", "-", "*", "/", "^"])
const punctuationChars = new Set(["(", ")", ",", ":"])
const suffixScale: Record<string, number> = {
  f: 1e-15,
  p: 1e-12,
  n: 1e-9,
  u: 1e-6,
  m: 1e-3,
  k: 1e3,
  meg: 1e6,
  g: 1e9,
  t: 1e12,
}

export function tokenizeSpice(
  source: string,
  options: SpiceTokenizerOptions = {},
): SpiceTokenizationResult {
  const preserveWhitespace = options.preserveWhitespace ?? false
  const preserveComments = options.preserveComments ?? true
  const normalizeNumbers = options.normalizeNumbers ?? true
  const tokens: SpiceToken[] = []
  const errors: SpiceTokenizerError[] = []
  let offset = 0
  let line = 1
  let column = 1
  let atLineStart = true

  const position = (): SourcePosition => ({ offset, line, column })
  const rangeFrom = (start: SourcePosition): SourceRange => ({
    start,
    end: position(),
  })
  const advance = (raw: string) => {
    for (let i = 0; i < raw.length; i += 1) {
      const char = raw[i]
      offset += 1
      if (char === "\n") {
        line += 1
        column = 1
        atLineStart = true
      } else {
        column += 1
      }
    }
  }
  const pushToken = (token: SpiceToken) => {
    if (token.type === "whitespace" && !preserveWhitespace) return
    if (token.type === "comment" && !preserveComments) return
    tokens.push(token)
  }
  const isDigit = (value: string | undefined) =>
    value !== undefined && value >= "0" && value <= "9"
  const startsNumber = (index: number) => {
    const value = source[index]
    const nextValue = source[index + 1]
    if (isDigit(value)) return true
    if (value === "." && isDigit(nextValue)) return true
    if ((value === "+" || value === "-") && !isSignedNumberStart()) return false
    if ((value === "+" || value === "-") && isDigit(nextValue)) return true
    return (
      (value === "+" || value === "-") &&
      nextValue === "." &&
      isDigit(source[index + 2])
    )
  }
  const isSignedNumberStart = () => {
    const previous = tokens.at(-1)
    return (
      previous === undefined ||
      previous.type === "whitespace" ||
      previous.type === "newline" ||
      previous.type === "continuation" ||
      previous.type === "operator" ||
      previous.type === "punctuation"
    )
  }
  const readNumberRaw = () => {
    let raw = ""
    if (source[offset] === "+" || source[offset] === "-") {
      raw += source[offset]
      advance(source[offset]!)
    }
    while (isDigit(source[offset])) {
      raw += source[offset]
      advance(source[offset]!)
    }
    if (source[offset] === ".") {
      raw += source[offset]
      advance(source[offset]!)
      while (isDigit(source[offset])) {
        raw += source[offset]
        advance(source[offset]!)
      }
    }
    if (source[offset] === "e" || source[offset] === "E") {
      raw += source[offset]
      advance(source[offset]!)
      if (source[offset] === "+" || source[offset] === "-") {
        raw += source[offset]
        advance(source[offset]!)
      }
      while (isDigit(source[offset])) {
        raw += source[offset]
        advance(source[offset]!)
      }
    }
    while (
      (source[offset] !== undefined &&
        source[offset]! >= "a" &&
        source[offset]! <= "z") ||
      (source[offset] !== undefined &&
        source[offset]! >= "A" &&
        source[offset]! <= "Z")
    ) {
      raw += source[offset]
      advance(source[offset]!)
    }
    return raw
  }
  const pushNumberToken = (raw: string, range: SourceRange) => {
    const numberMatch = raw.match(numberPattern)
    if (!numberMatch) return false
    const unitSuffix = numberMatch[1]
    const suffix = unitSuffix?.toLowerCase()
    const numericRaw =
      unitSuffix === undefined ? raw : raw.slice(0, -unitSuffix.length)
    const baseValue = Number(numericRaw)
    const value =
      normalizeNumbers && !Number.isNaN(baseValue)
        ? baseValue * (suffix === undefined ? 1 : (suffixScale[suffix] ?? 1))
        : null
    pushToken({
      type: "number",
      raw,
      value,
      unitSuffix,
      range,
    })
    return true
  }

  while (offset < source.length) {
    const start = position()
    const char = source[offset]!
    const next = source[offset + 1]

    if (char === "\r" || char === "\n") {
      const raw = char === "\r" && next === "\n" ? "\r\n" : char
      advance(raw)
      pushToken({
        type: "newline",
        raw: raw as "\n" | "\r\n" | "\r",
        range: rangeFrom(start),
      })
      continue
    }

    if (char === " " || char === "\t") {
      let raw = ""
      while (source[offset] === " " || source[offset] === "\t") {
        raw += source[offset]
        advance(source[offset]!)
      }
      pushToken({ type: "whitespace", raw, range: rangeFrom(start) })
      continue
    }

    if (atLineStart && char === "+") {
      advance(char)
      atLineStart = false
      pushToken({ type: "continuation", raw: char, range: rangeFrom(start) })
      continue
    }

    if ((atLineStart && char === "*") || char === ";" || char === "$") {
      const marker = char as "*" | ";" | "$"
      let raw = ""
      while (
        offset < source.length &&
        source[offset] !== "\n" &&
        source[offset] !== "\r"
      ) {
        raw += source[offset]
        advance(source[offset]!)
      }
      atLineStart = false
      pushToken({
        type: "comment",
        marker,
        raw,
        value: raw.slice(1).trimStart(),
        range: rangeFrom(start),
      })
      continue
    }

    if (char === "#") {
      let raw = ""
      while (
        offset < source.length &&
        source[offset] !== "\n" &&
        source[offset] !== "\r"
      ) {
        raw += source[offset]
        advance(source[offset]!)
      }
      const range = rangeFrom(start)
      const error = {
        message: "Unsupported preprocessor-style line",
        raw,
        range,
      }
      errors.push(error)
      atLineStart = false
      pushToken({ type: "error", raw, message: error.message, range })
      continue
    }

    if (char === '"' || char === "'") {
      const quote = char as '"' | "'"
      let raw = ""
      let value = ""
      advance(char)
      raw += char
      while (offset < source.length && source[offset] !== quote) {
        if (source[offset] === "\n" || source[offset] === "\r") break
        value += source[offset]
        raw += source[offset]
        advance(source[offset]!)
      }
      if (source[offset] === quote) {
        raw += quote
        advance(quote)
        pushToken({
          type: "string",
          quote,
          raw,
          value,
          range: rangeFrom(start),
        })
      } else {
        const range = rangeFrom(start)
        const error = { message: "Unterminated string", raw, range }
        errors.push(error)
        pushToken({ type: "error", raw, message: error.message, range })
      }
      atLineStart = false
      continue
    }

    if (startsNumber(offset)) {
      const raw = readNumberRaw()
      atLineStart = false
      if (pushNumberToken(raw, rangeFrom(start))) continue
    }

    if (operatorChars.has(char)) {
      advance(char)
      atLineStart = false
      pushToken({
        type: "operator",
        raw: char,
        value: char,
        range: rangeFrom(start),
      })
      continue
    }

    if (punctuationChars.has(char)) {
      advance(char)
      atLineStart = false
      pushToken({
        type: "punctuation",
        raw: char,
        value: char,
        range: rangeFrom(start),
      })
      continue
    }

    let raw = ""
    while (
      offset < source.length &&
      ![" ", "\t", "\r", "\n", '"', "'", ";", "$"].includes(source[offset]!) &&
      !operatorChars.has(source[offset]!) &&
      !punctuationChars.has(source[offset]!)
    ) {
      raw += source[offset]
      advance(source[offset]!)
    }

    if (raw.length === 0) {
      advance(char)
      const range = rangeFrom(start)
      const error = {
        message: `Unexpected character "${char}"`,
        raw: char,
        range,
      }
      errors.push(error)
      pushToken({ type: "error", raw: char, message: error.message, range })
      continue
    }

    atLineStart = false
    const range = rangeFrom(start)
    if (raw.startsWith(".")) {
      pushToken({
        type: "directive",
        raw,
        value: raw.slice(1).toLowerCase(),
        range,
      })
      continue
    }

    if (pushNumberToken(raw, range)) continue

    pushToken({ type: "identifier", raw, value: raw, range })
  }

  return {
    tokens,
    errors,
    source: {
      text: source,
      lineCount: line,
    },
  }
}
