import { SpiceNode } from "./SpiceNode"
import type { SpiceCardKind, SpiceNodeInit } from "./types"
import type { SpiceLogicalCard } from "../tokens/types"

const defaultToken = "__default__"

export type SpiceCardConstructor = {
  spiceTokenKeys: string[]
  fromSpiceTokens(card: SpiceLogicalCard): SpiceCard
}

export abstract class SpiceCard extends SpiceNode {
  abstract readonly cardKind: SpiceCardKind
  originalSource?: string

  constructor(init: SpiceNodeInit = {}) {
    super(init)
    this.originalSource = init.originalSource
  }

  static classes: Record<string, SpiceCardConstructor> = {}

  static register(newClass: SpiceCardConstructor): void {
    if (!newClass.spiceTokenKeys || newClass.spiceTokenKeys.length === 0) {
      throw new Error("Class must declare static spiceTokenKeys")
    }
    for (const key of newClass.spiceTokenKeys) {
      SpiceCard.classes[key.toLowerCase()] = newClass
    }
  }

  static parseSpiceTokens(card: SpiceLogicalCard): SpiceCard {
    const first = card.tokens.find((token) => token.type !== "whitespace")
    const key =
      first === undefined
        ? "blank"
        : first.type === "directive"
          ? `.${first.value}`
          : first.type === "comment"
            ? "comment"
            : first.type === "identifier"
              ? first.raw[0]?.toUpperCase() ?? defaultToken
              : first.type
    const ClassDef =
      SpiceCard.classes[key.toLowerCase()] ??
      (first?.type === "identifier"
        ? SpiceCard.classes.__unknown_element__
        : undefined) ??
      SpiceCard.classes[defaultToken]
    if (ClassDef === undefined) {
      throw new Error(`No SPICE card class registered for "${key}"`)
    }
    return ClassDef.fromSpiceTokens(card)
  }
}
