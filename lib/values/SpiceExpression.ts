export class SpiceExpression {
  raw: string

  constructor(raw: string) {
    this.raw = raw
  }

  getString(): string {
    return this.raw
  }
}
