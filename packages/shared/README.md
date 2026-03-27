# @aspect-mark/shared

Skills monorepo 的共享工具函数库。

## 安装

```bash
pnpm add @aspect-mark/shared
```

## API

### `toArray(value)`

确保值为数组。如果已是数组则直接返回，否则包裹为单元素数组。

```ts
toArray('hello')    // ['hello']
toArray([1, 2, 3])  // [1, 2, 3]
```

### `noop()`

空操作函数。

```ts
const callback = options.onComplete ?? noop
```

### `notNullish(value)`

类型守卫，过滤 `null` 和 `undefined`。

```ts
const items = [1, null, 2, undefined, 3].filter(notNullish)
// items: number[] = [1, 2, 3]
```

### `sleep(ms)`

等待指定毫秒数。

```ts
await sleep(1000) // 等待 1 秒
```

### `clamp(value, min, max)`

将数值限制在 min 和 max 之间。

```ts
clamp(5, 0, 10)   // 5
clamp(-1, 0, 10)  // 0
clamp(15, 0, 10)  // 10
```

## 构建

```bash
pnpm build
```

## 许可证

MIT
