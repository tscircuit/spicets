import {
  SpiceBlankLine,
  SpiceComment,
  SpiceDirective,
  SpiceElement,
  UnknownSpiceLine,
  type SpiceLine,
} from "./entities"
import { SpiceNetlist } from "./spice-netlist"

const elementNamePattern = /^[A-Za-z][A-Za-z0-9_.$:-]*$/
const directiveNamePattern = /^\.[A-Za-z][A-Za-z0-9_.$:-]*$/

export function parseSpiceNetlist(source: string): SpiceNetlist {
  const { lines, trailingNewline, lineEnding } = splitSource(source)
  return new SpiceNetlist({
    lines: lines.map(parseSpiceLine),
    trailingNewline,
    lineEnding,
  })
}

export function parseSpiceLines(source: string): SpiceLine[] {
  return splitSource(source).lines.map(parseSpiceLine)
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
  const lines = body.length === 0 ? [] : body.split(lineEnding)

  return { lines, trailingNewline, lineEnding }
}

function parseSpiceLine(line: string): SpiceLine {
  const trimmed = line.trim()

  if (trimmed.length === 0) {
    return new SpiceBlankLine({ raw: line })
  }

  if (trimmed.startsWith("*") || trimmed.startsWith(";")) {
    const marker = trimmed[0] as "*" | ";"
    return new SpiceComment({
      marker,
      text: trimmed.slice(1),
      raw: line,
    })
  }

  const parts = trimmed.split(/\s+/)
  const [head, ...rest] = parts

  if (head !== undefined && directiveNamePattern.test(head)) {
    return new SpiceDirective({
      name: head.toLowerCase(),
      args: rest,
      raw: line,
    })
  }

  if (head !== undefined && elementNamePattern.test(head)) {
    const { nodes, value, parameters } = splitElementTail(rest)
    return new SpiceElement({
      name: head,
      nodes,
      value,
      parameters,
      raw: line,
    })
  }

  return new UnknownSpiceLine({ text: line, raw: line })
}

function splitElementTail(parts: string[]): {
  nodes: string[]
  value?: string
  parameters: string[]
} {
  const firstParamIndex = parts.findIndex((part) => part.includes("="))
  const positional =
    firstParamIndex === -1 ? parts : parts.slice(0, firstParamIndex)
  const parameters =
    firstParamIndex === -1 ? [] : parts.slice(firstParamIndex)

  if (positional.length === 0) {
    return { nodes: [], parameters }
  }

  const value = positional.at(-1)
  const nodes = positional.slice(0, -1)
  return { nodes, value, parameters }
}
