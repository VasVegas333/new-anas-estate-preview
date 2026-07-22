export type CartItem = {
  sku: string;
  quantity: number;
};

export type CatalogProduct = {
  sku: string;
  name: string;
  format?: string;
  priceCents: number;
  imageUrl?: string;
};

const STORAGE_KEY = 'anas-estate-cart';
const CART_CHANGE_EVENT = 'cart:change';
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.sku === 'string' && item.sku.trim().length > 0 && typeof item.quantity === 'number';
}

function normalizeCart(items: CartItem[]): CartItem[] {
  const quantities = new Map<string, number>();

  for (const item of items) {
    const sku = item.sku.trim();
    if (!sku) continue;
    const next = (quantities.get(sku) ?? 0) + clampQuantity(item.quantity);
    quantities.set(sku, Math.min(MAX_QUANTITY, next));
  }

  return Array.from(quantities.entries()).map(([sku, quantity]) => ({ sku, quantity }));
}

function emitChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return normalizeCart(parsed.filter(isCartItem));
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]): CartItem[] {
  const next = normalizeCart(items);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }

  return next;
}

export function getItemCount(items: CartItem[] = getCart()): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function addItem(sku: string, quantity = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((item) => item.sku === sku);
  const nextQuantity = clampQuantity((existing?.quantity ?? 0) + quantity);

  if (existing) {
    existing.quantity = nextQuantity;
    return setCart(cart);
  }

  return setCart([...cart, { sku, quantity: nextQuantity }]);
}

export function setQuantity(sku: string, quantity: number): CartItem[] {
  if (!Number.isFinite(quantity) || quantity < MIN_QUANTITY) {
    return removeItem(sku);
  }

  const cart = getCart();
  const existing = cart.find((item) => item.sku === sku);

  if (!existing) {
    return setCart([...cart, { sku, quantity: clampQuantity(quantity) }]);
  }

  existing.quantity = clampQuantity(quantity);
  return setCart(cart);
}

export function removeItem(sku: string): CartItem[] {
  return setCart(getCart().filter((item) => item.sku !== sku));
}

export function clearCart(): CartItem[] {
  return setCart([]);
}

export function subscribe(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener(CART_CHANGE_EVENT, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function formatCad(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}
