import type { SpiceSerializeOptions } from "../ast"
import { normalizeValue } from "./normalize"
import { SpiceValue } from "./SpiceValue"
import type { ParamsInput, SpiceValueInput } from "./types"

export class ParamList {
  private values: Array<[string, SpiceValue]>

  constructor(input: ParamsInput = []) {
    if (input instanceof ParamList) {
      this.values = input.entries()
    } else if (Array.isArray(input)) {
      this.values = input.map(([name, value]) => [name, normalizeValue(value)])
    } else {
      this.values = Object.entries(input).map(([name, value]) => [
        name,
        normalizeValue(value),
      ])
    }
  }

  get(name: string): SpiceValue | undefined {
    return this.values.find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1]
  }

  set(name: string, value: SpiceValueInput): void {
    const index = this.values.findIndex(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    )
    const entry: [string, SpiceValue] = [name, normalizeValue(value)]
    if (index === -1) this.values.push(entry)
    else this.values[index] = entry
  }

  delete(name: string): boolean {
    const index = this.values.findIndex(
      ([key]) => key.toLowerCase() === name.toLowerCase(),
    )
    if (index === -1) return false
    this.values.splice(index, 1)
    return true
  }

  entries(): Array<[string, SpiceValue]> {
    return this.values.map(([name, value]) => [name, value])
  }

  getString(_options?: SpiceSerializeOptions): string {
    return this.values
      .map(([name, value]) => `${name}=${value.getString()}`)
      .join(" ")
  }

  get isEmpty(): boolean {
    return this.values.length === 0
  }
}
