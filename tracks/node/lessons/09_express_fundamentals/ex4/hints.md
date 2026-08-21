## Hint 1

`express.Router()` gives you an object with the same `get`/`post`/`use`
methods as an app, but it is not an app - it is a stack of routes you can
attach somewhere later:

```ts
const orders = express.Router();
orders.get("/orders", handler);
app.use("/api/v1", orders);
```

Routes inside the router are written **relative to the mount path**. The
router says `/orders`; the world sees `/api/v1/orders`.

## Hint 2

Middleware on the router (`orders.use(...)`) runs only for requests that
matched the mount path, which is exactly what the gate checks: the version
header must appear on `/api/v1/orders` and must not appear on `/health`.

That scoping is the reason routers exist. Authentication for `/api/admin`,
rate limiting for `/api/public`, a request logger for everything - each is a
`use` on the right router rather than a condition inside a global middleware.

## Hint 3

Assemble it in this order:

```ts
const app = express();
app.get("/health", ...);          // app-level route

const orders = express.Router();
orders.use(/* the version header */);
orders.get("/orders", ...);
orders.get("/orders/:id", ...);

app.use(/* mount path */, orders);
return app;
```

Two decisions left: the mount path, and where `orders.use` goes relative to
the router's own routes (the same registration-order rule applies inside a
router as on the app). The `/orders/:id` handler is the one you wrote in ex2 -
copy it in; the exercises are deliberately isolated.
