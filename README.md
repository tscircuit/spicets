# spicets

TypeScript parser/serializer primitives for SPICE netlists.

```ts
import { parseSpiceNetlist } from "spicets"

const netlist = parseSpiceNetlist(`* example
V1 in 0 DC 5
R1 in out 1k
.end
`)

netlist.getString()
```

## API

- `parseSpiceNetlist(source)` returns a typed `SpiceNetlist` root document.
- `parseSpiceLines(source)` returns the line-level node array for generic tooling.
- `SpiceNetlist#getString()` serializes a complete netlist.
- All nodes extend `BaseSpiceNode` and implement `getChildren()` and `toSource()`.

Unrecognized lines are represented as `UnknownSpiceLine` and preserve their raw
source so parsed files can round-trip without dropping future or vendor-specific
syntax.
