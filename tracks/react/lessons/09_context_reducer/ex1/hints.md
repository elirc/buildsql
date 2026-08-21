## Hint 1
Three pieces, and they live at three different levels of the file. A **context
object** created once at module scope; a **provider** that puts a value into it;
and a **consumer** that reads whatever the nearest provider above it supplied.

## Hint 2
```tsx
const ThemeContext = createContext("light");
…
<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
…
const theme = useContext(ThemeContext);
```

`createContext` goes outside the components — it is created once for the module,
not once per render.

## Hint 3
The argument to `createContext` is the value a consumer sees when there is *no*
provider above it, which is a default, not an initial value. The button then
renders that value in its text; note the gate re-renders the provider with a
different theme, so the button must read the context on every render rather
than capturing it once.
