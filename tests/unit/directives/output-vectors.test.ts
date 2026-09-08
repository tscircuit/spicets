import { expect, test } from "bun:test"
import { Probe, Save, parseSpiceCard } from "lib"

for (const Directive of [Save, Probe]) {
  test(`${Directive.name} preserves authored vector expression boundaries`, () => {
    const authored = new Directive(["v(out)", "i(V1)", "@M1[id]"])
    const parsed = parseSpiceCard(authored.toSource()) as Save | Probe
    expect(parsed.expressions).toEqual(authored.expressions)
    expect(parsed.toSource({ format: "pretty" })).toBe(authored.toSource())
  })
  test(`${Directive.name} excludes continuations and comments from vectors`, () => {
    const command = new Directive([]).command
    const source = `${command} v(out)\n+ i(V1) ; explanation`
    const parsed = parseSpiceCard(source) as Save | Probe
    expect(parsed.expressions).toEqual(["v(out)", "i(V1)"])
    expect(parsed.toSource()).toBe(source)
    expect(parsed.toSource({ format: "pretty" })).toBe(
      `${command} v(out) i(V1)`,
    )
  })
  test(`${Directive.name} retains grouped and quoted expressions`, () => {
    const command = new Directive([]).command
    const parsed = parseSpiceCard(`${command} v(a, b) 'v(out) + 1'`) as
      | Save
      | Probe
    expect(parsed.expressions).toEqual(["v(a, b)", "'v(out) + 1'"])
  })
  test(`${Directive.name} supports bare and empty lists`, () => {
    const command = new Directive([]).command
    expect(
      (parseSpiceCard(`${command} all out`) as Save | Probe).expressions,
    ).toEqual(["all", "out"])
    expect((parseSpiceCard(command) as Save | Probe).expressions).toEqual([])
  })
}
