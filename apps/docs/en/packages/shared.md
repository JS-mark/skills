# @aspect-mark/shared

Shared utility functions for the Skills monorepo.

## Installation

```bash
pnpm add @aspect-mark/shared
```

## API

### `toArray(value)`

Ensures the value is an array. Returns as-is if already an array, otherwise wraps in a single-element array.

```ts
import { toArray } from '@aspect-mark/shared'

toArray('hello') // ['hello']
toArray([1, 2, 3]) // [1, 2, 3]
```

### `noop()`

No-operation function.

```ts
import { noop } from '@aspect-mark/shared'

const callback = options.onComplete ?? noop
```

### `notNullish(value)`

Type guard that filters out `null` and `undefined`.

```ts
import { notNullish } from '@aspect-mark/shared'

const items = [1, null, 2, undefined, 3].filter(notNullish)
// items: number[] = [1, 2, 3]
```

### `sleep(ms)`

Wait for the specified number of milliseconds.

```ts
import { sleep } from '@aspect-mark/shared'

await sleep(1000) // Wait 1 second
```

### `clamp(value, min, max)`

Clamps a number between min and max.

```ts
import { clamp } from '@aspect-mark/shared'

clamp(5, 0, 10) // 5
clamp(-1, 0, 10) // 0
clamp(15, 0, 10) // 10
```

## Build

```bash
pnpm build
```
