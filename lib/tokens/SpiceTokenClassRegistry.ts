import type { SpiceCard } from "../ast"
import type { SpiceLogicalCard } from "./types"

type SpiceCardConstructor = {
  fromSpiceTokens(card: SpiceLogicalCard): SpiceCard
}

const defaultToken = "__default__"

export class SpiceTokenClassRegistry {
  private static classes: Record<string, SpiceCardConstructor> = {}

  static register(key: string, classDef: SpiceCardConstructor): void {
    this.classes[key.toLowerCase()] = classDef
  }

  static get(key: string): SpiceCardConstructor | undefined {
    return this.classes[key.toLowerCase()] ?? this.classes[defaultToken]
  }

  static parse(card: SpiceLogicalCard): SpiceCard {
    const first = card.tokens.find((token) => token.type !== "whitespace")
    if (first === undefined) {
      const classDef = this.get("blank")
      if (classDef === undefined) throw new Error("No blank card class registered")
      return classDef.fromSpiceTokens(card)
    }
    const key =
      first.type === "directive"
        ? `.${first.value}`
        : first.type === "comment"
          ? "comment"
          : first.type === "identifier"
            ? first.raw[0]?.toUpperCase() ?? defaultToken
            : first.type
    const classDef = this.get(key)
    if (classDef === undefined) {
      throw new Error(`No SPICE token class registered for "${key}"`)
    }
    return classDef.fromSpiceTokens(card)
  }
}
