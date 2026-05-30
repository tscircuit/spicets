import { SpiceCard } from "./SpiceCard"

export abstract class DotCommand extends SpiceCard {
  readonly cardKind = "directive" as const
  abstract command: string
}
