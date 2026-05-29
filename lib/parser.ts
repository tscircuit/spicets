import type { SpiceParseOptions } from "./ast"
import {
  Ac,
  ControlBlock,
  Dc,
  End,
  Include,
  Lib,
  Model,
  Op,
  Options,
  Param,
  Save,
  Subckt,
  Temp,
  Tran,
  UnknownDotCommand,
} from "./directives"
import {
  Bjt,
  Capacitor,
  Cccs,
  Ccvs,
  CurrentSource,
  Diode,
  Inductor,
  Mosfet,
  Resistor,
  SubcktInstance,
  UnknownElementCard,
  Vccs,
  Vcvs,
  VoltageSource,
} from "./elements"
import { SpiceLibrary, SpiceNetlist, type SpiceCardInput } from "./roots"
import { BlankLine, Comment, RawCard } from "./trivia"

export function parseSpiceNetlist(
  source: string,
  options: SpiceParseOptions = {},
): SpiceNetlist {
  const split = splitSource(source)
  const title =
    split.lines[0] !== undefined && isTitleLine(split.lines[0])
      ? split.lines[0]
      : undefined
  const bodyLines = title === undefined ? split.lines : split.lines.slice(1)
  const cards = parseSpiceCards(bodyLines.join(split.lineEnding), options)
  const endIndex = cards.findIndex((card) => card instanceof End)
  const end = endIndex === -1 ? undefined : (cards.splice(endIndex, 1)[0] as End)

  return new SpiceNetlist({
    title,
    cards,
    end: end ?? false,
    dialect: options.dialect,
    trailingNewline: split.trailingNewline,
    lineEnding: split.lineEnding,
  })
}

export function parseSpiceLibrary(
  source: string,
  options: SpiceParseOptions = {},
): SpiceLibrary {
  const split = splitSource(source)
  return new SpiceLibrary({
    cards: parseSpiceCards(source, options),
    dialect: options.dialect,
    trailingNewline: split.trailingNewline,
    lineEnding: split.lineEnding,
  })
}

export function parseSpiceCards(
  source: string,
  options: SpiceParseOptions = {},
): SpiceCardInput[] {
  const { logicalCards } = collectLogicalCards(source)
  const cards: SpiceCardInput[] = []

  for (let i = 0; i < logicalCards.length; i += 1) {
    const card = logicalCards[i]
    if (card === undefined) continue
    const parsed = parseSpiceCard(card, options)

    if (parsed instanceof UnknownDotCommand && parsed.command === ".control") {
      const lines: string[] = []
      let originalSource = card
      for (i += 1; i < logicalCards.length; i += 1) {
        const next = logicalCards[i]
        if (next === undefined) continue
        originalSource += `\n${next}`
        if (next.trim().toLowerCase() === ".endc") break
        lines.push(next)
      }
      cards.push(new ControlBlock({ lines, originalSource }))
      continue
    }

    if (parsed instanceof UnknownDotCommand && parsed.command === ".subckt") {
      cards.push(parseUnknownSubckt(card, logicalCards, i))
      for (i += 1; i < logicalCards.length; i += 1) {
        if (logicalCards[i]?.trim().toLowerCase().startsWith(".ends")) break
      }
      continue
    }

    cards.push(parsed)
  }

  return cards
}

export function parseSpiceCard(
  source: string,
  _options: SpiceParseOptions = {},
): SpiceCardInput {
  const trimmed = source.trim()
  if (trimmed.length === 0) return new BlankLine({ originalSource: source })
  if (trimmed.startsWith("*") || trimmed.startsWith(";") || trimmed.startsWith("$")) {
    const marker = trimmed[0] as "*" | ";" | "$"
    return new Comment(trimmed.slice(1).trimStart(), {
      marker,
      originalSource: source,
    })
  }

  const tokens = trimmed.split(/\s+/)
  const [head = "", ...rest] = tokens
  if (head.startsWith(".")) return parseDotCommand(head.toLowerCase(), rest, source)
  if (!/^[A-Za-z]/.test(head)) return new RawCard(source)

  return parseElement(head, rest, source)
}

function parseDotCommand(
  command: string,
  args: string[],
  originalSource: string,
): SpiceCardInput {
  switch (command) {
    case ".end":
      return new End({ originalSource })
    case ".op":
      return new Op({ originalSource })
    case ".tran":
      return new Tran({
        step: args[0],
        stop: args[1] ?? "",
        start: args[2],
        maxStep: args[3],
        uic: args.some((arg) => arg.toLowerCase() === "uic"),
        originalSource,
      })
    case ".ac":
      return new Ac({
        sweep: normalizeSweep(args[0]),
        points: Number(args[1] ?? 0),
        start: args[2] ?? "",
        stop: args[3] ?? "",
        originalSource,
      })
    case ".dc":
      return new Dc({
        source: args[0] ?? "",
        start: args[1] ?? "",
        stop: args[2] ?? "",
        step: args[3] ?? "",
        originalSource,
      })
    case ".param":
      return new Param(parseParamTokens(args), { originalSource })
    case ".model":
      return new Model({
        name: args[0] ?? "",
        type: args[1] ?? "",
        params: parseParamTokens(args.slice(2).flatMap(stripParens)),
        originalSource,
      })
    case ".include":
      return new Include(args.join(" "), { originalSource })
    case ".lib":
      return new Lib({
        path: args[0],
        section: args[1],
        originalSource,
      })
    case ".options":
      return new Options(parseParamTokens(args), { originalSource })
    case ".temp":
      return new Temp(args, { originalSource })
    case ".save":
      return new Save(args, { originalSource })
    case ".control":
      return new UnknownDotCommand({ command, args, originalSource })
    default:
      return new UnknownDotCommand({ command, args, originalSource })
  }
}

function parseElement(
  name: string,
  args: string[],
  originalSource: string,
): SpiceCardInput {
  const designator = name[0]?.toUpperCase() ?? ""

  switch (designator) {
    case "R":
      return new Resistor({
        name,
        nodes: [args[0] ?? "", args[1] ?? ""],
        resistance: args[2] ?? "",
        params: parseParamTokens(args.slice(3)),
        originalSource,
      })
    case "C":
      return new Capacitor({
        name,
        nodes: [args[0] ?? "", args[1] ?? ""],
        capacitance: args[2] ?? "",
        params: parseParamTokens(args.slice(3)),
        originalSource,
      })
    case "L":
      return new Inductor({
        name,
        nodes: [args[0] ?? "", args[1] ?? ""],
        inductance: args[2] ?? "",
        params: parseParamTokens(args.slice(3)),
        originalSource,
      })
    case "V":
      return parseSource(VoltageSource, name, args, originalSource)
    case "I":
      return parseSource(CurrentSource, name, args, originalSource)
    case "D":
      return new Diode({
        name,
        nodes: [args[0] ?? "", args[1] ?? ""],
        model: args[2] ?? "",
        params: parseParamTokens(args.slice(3)),
        originalSource,
      })
    case "Q":
      {
        const hasSubstrate = args.length > 4
        const nodes: [
          collector: string,
          base: string,
          emitter: string,
          substrate?: string,
        ] = hasSubstrate
          ? [args[0] ?? "", args[1] ?? "", args[2] ?? "", args[3] ?? ""]
          : [args[0] ?? "", args[1] ?? "", args[2] ?? ""]
        const modelIndex = hasSubstrate ? 4 : 3
        return new Bjt({
          name,
          nodes,
          model: args[modelIndex] ?? "",
          params: parseParamTokens(args.slice(modelIndex + 1)),
          originalSource,
        })
      }
    case "M":
      return new Mosfet({
        name,
        nodes: [args[0] ?? "", args[1] ?? "", args[2] ?? "", args[3] ?? ""],
        model: args[4] ?? "",
        params: parseParamTokens(args.slice(5)),
        originalSource,
      })
    case "E":
      return new Vcvs({
        name,
        output: [args[0] ?? "", args[1] ?? ""],
        control: [args[2] ?? "", args[3] ?? ""],
        gain: args[4] ?? "",
        originalSource,
      })
    case "G":
      return new Vccs({
        name,
        output: [args[0] ?? "", args[1] ?? ""],
        control: [args[2] ?? "", args[3] ?? ""],
        transconductance: args[4] ?? "",
        originalSource,
      })
    case "H":
      return new Ccvs({
        name,
        output: [args[0] ?? "", args[1] ?? ""],
        source: args[2] ?? "",
        transresistance: args[3] ?? "",
        originalSource,
      })
    case "F":
      return new Cccs({
        name,
        output: [args[0] ?? "", args[1] ?? ""],
        source: args[2] ?? "",
        gain: args[3] ?? "",
        originalSource,
      })
    case "X":
      return new SubcktInstance({
        name,
        nodes: args.slice(0, -1),
        subckt: args.at(-1) ?? "",
        originalSource,
      })
    default:
      return new UnknownElementCard({
        name,
        designator,
        tokens: args,
        originalSource,
      })
  }
}

function parseSource(
  SourceClass: typeof VoltageSource | typeof CurrentSource,
  name: string,
  args: string[],
  originalSource: string,
): VoltageSource | CurrentSource {
  const sourceArgs = args.slice(2)
  const dcIndex = sourceArgs.findIndex((arg) => arg.toLowerCase() === "dc")
  const acIndex = sourceArgs.findIndex((arg) => arg.toLowerCase() === "ac")
  return new SourceClass({
    name,
    nodes: [args[0] ?? "", args[1] ?? ""],
    dc: dcIndex === -1 ? sourceArgs[0] : sourceArgs[dcIndex + 1],
    ac: acIndex === -1 ? undefined : sourceArgs[acIndex + 1],
    originalSource,
  })
}

function parseUnknownSubckt(
  firstCard: string,
  logicalCards: string[],
  startIndex: number,
): Subckt {
  const tokens = firstCard.trim().split(/\s+/)
  const paramsIndex = tokens.findIndex((token) => token.toLowerCase() === "params:")
  const pinsEnd = paramsIndex === -1 ? tokens.length : paramsIndex
  const cards: SpiceCardInput[] = []
  let originalSource = firstCard
  let endsName: string | undefined

  for (let i = startIndex + 1; i < logicalCards.length; i += 1) {
    const source = logicalCards[i]
    if (source === undefined) continue
    originalSource += `\n${source}`
    const trimmed = source.trim()
    if (trimmed.toLowerCase().startsWith(".ends")) {
      endsName = trimmed.split(/\s+/)[1]
      break
    }
    cards.push(parseSpiceCard(source))
  }

  return new Subckt({
    name: tokens[1] ?? "",
    pins: tokens.slice(2, pinsEnd),
    params:
      paramsIndex === -1
        ? undefined
        : parseParamTokens(tokens.slice(paramsIndex + 1)),
    cards,
    endsName,
    originalSource,
  })
}

function collectLogicalCards(source: string): { logicalCards: string[] } {
  const { lines } = splitSource(source)
  const logicalCards: string[] = []

  for (const line of lines) {
    if (/^\s*\+/.test(line) && logicalCards.length > 0) {
      const previous = logicalCards.at(-1)
      logicalCards[logicalCards.length - 1] = `${previous} ${line.trim().slice(1).trim()}`
    } else {
      logicalCards.push(line)
    }
  }

  return { logicalCards }
}

function splitSource(source: string): {
  lines: string[]
  trailingNewline: boolean
  lineEnding: "\n" | "\r\n" | "\r"
} {
  const lineEnding = source.includes("\r\n")
    ? "\r\n"
    : source.includes("\r")
      ? "\r"
      : "\n"
  const trailingNewline =
    lineEnding === "\r\n"
      ? source.endsWith("\r\n")
      : source.endsWith(lineEnding)
  const body = trailingNewline ? source.slice(0, -lineEnding.length) : source
  return {
    lines: body.length === 0 ? [] : body.split(lineEnding),
    trailingNewline,
    lineEnding,
  }
}

function isTitleLine(line: string): boolean {
  const trimmed = line.trim()
  return (
    trimmed.length > 0 &&
    !trimmed.startsWith(".") &&
    !trimmed.startsWith("*") &&
    !trimmed.startsWith(";") &&
    !trimmed.startsWith("$") &&
    !/^[A-Za-z][A-Za-z0-9_.$:-]*\s/.test(trimmed)
  )
}

function normalizeSweep(input: string | undefined): "dec" | "oct" | "lin" {
  const value = input?.toLowerCase()
  return value === "oct" || value === "lin" ? value : "dec"
}

function parseParamTokens(tokens: string[]): Array<[string, string]> {
  return tokens
    .flatMap(stripParens)
    .map((token) => {
      const index = token.indexOf("=")
      if (index === -1) return undefined
      return [token.slice(0, index), token.slice(index + 1)] as [string, string]
    })
    .filter((entry): entry is [string, string] => entry !== undefined)
}

function stripParens(token: string): string[] {
  return token
    .replace(/^\(/, "")
    .replace(/\)$/, "")
    .split(/\s+/)
    .filter(Boolean)
}
