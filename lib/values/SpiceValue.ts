export class SpiceValue {
  raw: string

  constructor(value: string | number) {
    this.raw = String(value)
  }

  getString(): string {
    return this.raw
  }
}
