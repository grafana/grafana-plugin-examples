# Adding a New Panel Option

Panel options are settings the user configures to change panel behavior.

Always complete **all three steps**:

### **1. Extend the options type**

File: `src/types.ts`

```ts
export interface SimpleOptions {
  // existing...
  myOptionName: MyOptionType;
}
```

- Property name must match the builder `path`.
- Type must match expected editor output.

---

### **2. Register the option in `setPanelOptions`**

File: `src/module.ts` inside `setPanelOptions((builder) => { ... })`

Use the correct builder method:

| Type               | Builder              |
| ------------------ | -------------------- |
| boolean            | `addBooleanSwitch`   |
| number             | `addNumberInput`     |
| string             | `addTextInput`       |
| select             | `addSelect`          |
| radio              | `addRadio`           |
| radio group        | `addRadio`           |
| slider             | `addSliderInput`     |
| color picker       | `addColorPicker`     |
| unit picker        | `addUnitPicker`      |
| field namer picker | `addFieldNamePicker` |

Template:

```ts
builder.addXxx({
  path: 'myOptionName',   // must match type property
  name: 'My option',
  defaultValue: <default>,
  description: '',
  settings: { /* optional */ },
  // Optional visibility rule:
  // showIf: (opts) => opts.someOtherOption,
});
```

Rules:

- Every option **must** have a `defaultValue`.
- Put numeric constraints in `settings` (`min`, `max`, `step`).
- Use `showIf` for conditional display.

---

### **3. Use the option in the panel component**

File: `src/Panel.tsx` (or equivalent)

```tsx
export const Panel = ({ options }) => {
  const { myOptionName } = options;
  // apply it in rendering/logic
};
```

No option may remain unused.

---

# Quick Editor Recipes

### **Boolean**

```ts
.addBooleanSwitch({ path: 'flag', name: 'Flag', defaultValue: false })
```

### **Number**

```ts
.addNumberInput({
  path: 'max',
  name: 'Max value',
  defaultValue: 10,
  settings: { min: 1, max: 100, step: 1 },
})
```

### **String**

```ts
.addTextInput({ path: 'label', name: 'Label', defaultValue: '' })
```

### **Select**

```ts
.addSelect({
  path: 'mode',
  name: 'Mode',
  defaultValue: 'auto',
  settings: { options: [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ]},
})
```

### **Radio**

```ts
.addRadio({
  path: 'size',
  name: 'Size',
  defaultValue: 'md',
  settings: { options: [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ]},
  showIf: (o) => o.showSize,
})
```
