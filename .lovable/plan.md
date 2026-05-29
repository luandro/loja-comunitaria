# Cart logic review & improvement plan

## Issues found

### 1. Cart state is not shared across components (critical)
`useCart` is just a `useState` hook called independently in `Cart.tsx`, `ProductCard.tsx`, and anywhere else. Each consumer has its **own copy** of the cart, synced only via `localStorage` writes on the next mount/render. Side effects:
- Adding to cart from `ProductCard` does not live-update other mounted consumers (no badge in Navbar; stock counters in other cards don't react until remount).
- `orderId` set by `createOrder()` in one consumer is invisible to others.
- Risk of stale writes overwriting each other in localStorage.

### 2. Navbar has no cart item badge
The `ShoppingCart` icon in `Navbar.tsx` never shows the number of items. With shared state this becomes trivial.

### 3. Double "added to cart" toast
`useCart.addItem` already fires a toast, and `ProductCard.handleAddToCart` fires a second identical one. User sees two toasts every add.

### 4. PIX API integration bugs (`src/lib/pix-api.ts`)
- Response type says `br_code` but code reads `brData.brcode` — type/field mismatch.
- `if (!qrResponse || !brResponse)` is dead — `fetch` never resolves to a falsy value; the real check should be `response.ok`.
- Direct browser fetch to `gerarqrcodepix.com.br` is blocked by CORS in practice, so the "local fallback" is what actually runs.
- The local fallback produces an **invalid PIX BR code**: wrong EMV field tags (`5204000053039865...` glues MCC, currency and amount with wrong lengths), amount is padded as digits instead of EMV decimal string, and the CRC16 is hardcoded `6304` with no checksum. The "Copiar código" output cannot be paid by any bank app.

### 5. `orderId` lost on refresh
`orderId` lives in component state only. Refreshing the payment screen drops it; the WhatsApp message then references an empty `${orderId}`.

### 6. Double `createOrder()` call in `Cart.tsx`
`handleCheckout` calls `createOrder()`, then the WhatsApp `useEffect` calls `orderId || createOrder()` again. Because state is unshared (issue #1), the IDs can diverge.

### 7. `CartItem` auto-adjust effect risks loop / fights the user
The `useEffect` depends on `onUpdateQuantity` (new identity every render of parent) and calls `onUpdateQuantity` inside itself when quantity > stock. With shared state this can ping-pong; even today it re-runs every parent render.

### 8. Minor / cleanup
- `PixPayment` props type `cart: any[]` — should be `CartItem[]`.
- `EmptyCart` is rendered raw (no page background wrapper) — inconsistent with the rest of Cart.
- `total` is recomputed every render; trivially memoizable.
- Verbose `console.log` noise in production paths.
- `getInitialCartItems` runs on every `useCart` call (one per consumer) instead of once.
- `usePixPayment` logs env on every mount of the hook.

---

## Plan

### A. Centralize cart state
1. Create `src/context/CartContext.tsx` exposing the existing `useCart` API (`cart`, `total`, `orderId`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`, `createOrder`, `isEmpty`).
2. Move all state, the localStorage sync, and order-id logic into the provider. Persist `orderId` to `localStorage` too.
3. Wrap the app with `<CartProvider>` in `App.tsx` (inside `BrowserRouter`).
4. Replace `src/hooks/use-cart.ts` with a thin `useCart` that reads the context (keeping the import path stable for existing consumers).
5. Memoize `total` with `useMemo`.

### B. Navbar cart badge
Add a small count badge over the `ShoppingCart` icon (desktop + mobile) showing total item quantity when > 0.

### C. Remove duplicate toast
Drop the extra `toast(...)` in `ProductCard.handleAddToCart`; rely on the one inside `addItem`.

### D. Fix Pix payment
1. Fix `pix-api.ts`:
   - Use `response.ok` checks.
   - Read JSON field `brcode` (and align the TS type).
   - Treat any failure as a clean failure — **remove the broken local PIX-code generator** (it produces unpayable codes and misleads users). Surface a real error toast instead.
2. To work around the CORS limitation reliably, route the call through a **Lovable Cloud edge function** `generate-pix` that calls `gerarqrcodepix.com.br` server-side and returns `{ qrCode, brCode }`. This requires enabling Lovable Cloud — I'll flag this and enable it as part of the change.
3. `usePixPayment` then just calls the edge function; remove the `isLocallyGenerated` branch and the amber warning UI in `PixPayment`.
4. Type `PixPayment.cart` as `CartItem[]`.

### E. Cart page cleanup
- Single source of truth for `orderId`: `createOrder()` returns the id and stores it in context; `handleCheckout` uses that value, and the WhatsApp `useEffect` just reads `orderId` from context.
- Wrap `EmptyCart` content in the same `bg-sand-50 py-16` shell as the rest.

### F. `CartItem` effect hardening
- Compute the over-stock condition during render (not in an effect) and call `onUpdateQuantity` from a `useEffect` whose deps are only `[item.id, item.quantity, maxQuantity]`.
- Skip the call when values already match.

### G. Logging hygiene
Drop the noisiest `console.log`s in `Cart.tsx`, `usePixPayment`, and `pix-api.ts`; keep `console.error` for real failure paths.

---

## Out of scope (call out, don't change now)
- Persisting orders to a database / admin view.
- Real inventory decrement (products are loaded from a static CSV).
- Replacing the WhatsApp flow with an automated payment confirmation webhook.

## Technical notes
- New files: `src/context/CartContext.tsx`, `supabase/functions/generate-pix/index.ts` (edge function).
- Edits: `App.tsx`, `Navbar.tsx`, `ProductCard.tsx`, `Cart.tsx`, `CartItem.tsx`, `PixPayment.tsx`, `usePixPayment.ts`, `pix-api.ts`, `use-cart.ts` (becomes a re-export of the context hook).
- Enabling Lovable Cloud is required for step D.2; if you'd rather keep the app fully client-side, I can instead show a clear "PIX indisponível no momento" error and remove the fake fallback without adding the edge function.
