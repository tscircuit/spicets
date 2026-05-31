import type { DotCommand } from "../ast"
import type { ElementCard } from "../elements"
import type { BlankLine, Comment, RawCard } from "../trivia"

export type SpiceCardInput =
  | ElementCard
  | DotCommand
  | Comment
  | BlankLine
  | RawCard
