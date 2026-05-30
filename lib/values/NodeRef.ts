export class NodeRef {
  name: string

  constructor(name: string) {
    this.name = name
  }

  static ground(): NodeRef {
    return new NodeRef("0")
  }

  getString(): string {
    return this.name
  }
}
