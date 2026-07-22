import {
  formatCad,
  getCart,
  removeItem,
  setCart,
  setQuantity,
  subscribe,
  type CartItem,
  type CatalogProduct,
} from './cart';

function parseCatalog(root: HTMLElement): CatalogProduct[] {
  const raw = root.dataset.catalog;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CatalogProduct => {
      if (!item || typeof item !== 'object') return false;
      const product = item as Record<string, unknown>;
      return (
        typeof product.sku === 'string' &&
        typeof product.name === 'string' &&
        typeof product.priceCents === 'number'
      );
    });
  } catch {
    return [];
  }
}

export function initCartPage(root: HTMLElement): void {
  const emptyEl = root.querySelector<HTMLElement>('[data-cart-empty]');
  const contentEl = root.querySelector<HTMLElement>('[data-cart-content]');
  const linesEl = root.querySelector<HTMLElement>('[data-cart-lines]');
  const subtotalEl = root.querySelector<HTMLElement>('[data-cart-subtotal]');
  const heroEl = root.querySelector<HTMLElement>('[data-cart-hero]');

  if (!emptyEl || !contentEl || !linesEl || !subtotalEl) return;

  const catalog = parseCatalog(root);
  const catalogBySku = new Map(catalog.map((product) => [product.sku, product]));

  const resolveLines = (cart: CartItem[]) =>
    cart
      .map((item) => {
        const product = catalogBySku.get(item.sku);
        if (!product) return null;
        return { item, product };
      })
      .filter((line): line is { item: CartItem; product: CatalogProduct } => line !== null);

  const render = () => {
    const cart = getCart();
    const lines = resolveLines(cart);

    if (lines.length !== cart.length) {
      setCart(lines.map(({ item }) => item));
      return;
    }

    if (lines.length === 0) {
      emptyEl.hidden = false;
      contentEl.hidden = true;
      if (heroEl) heroEl.hidden = true;
      linesEl.innerHTML = '';
      return;
    }

    emptyEl.hidden = true;
    contentEl.hidden = false;
    if (heroEl) heroEl.hidden = false;

    const subtotalCents = lines.reduce(
      (total, { item, product }) => total + product.priceCents * item.quantity,
      0,
    );
    subtotalEl.textContent = formatCad(subtotalCents);

    linesEl.innerHTML = '';

    for (const { item, product } of lines) {
      const row = document.createElement('article');
      row.className = 'cart-line';
      row.dataset.sku = product.sku;

      const media = document.createElement('div');
      media.className = 'cart-line__media';
      if (product.imageUrl) {
        const img = document.createElement('img');
        img.src = product.imageUrl;
        img.alt = product.name;
        img.width = 120;
        img.height = 120;
        img.loading = 'lazy';
        media.append(img);
      }

      const details = document.createElement('div');
      details.className = 'cart-line__details';

      if (product.format) {
        const format = document.createElement('p');
        format.className = 'cart-line__format';
        format.textContent = product.format;
        details.append(format);
      }

      const name = document.createElement('h2');
      name.className = 'cart-line__name';
      name.textContent = product.name;
      details.append(name);

      const unitPrice = document.createElement('p');
      unitPrice.className = 'cart-line__unit-price';
      unitPrice.textContent = formatCad(product.priceCents);
      details.append(unitPrice);

      const controls = document.createElement('div');
      controls.className = 'cart-line__controls';

      const qtyGroup = document.createElement('div');
      qtyGroup.className = 'cart-qty';
      qtyGroup.setAttribute('role', 'group');
      qtyGroup.setAttribute('aria-label', `Quantity for ${product.name}`);

      const decrease = document.createElement('button');
      decrease.type = 'button';
      decrease.className = 'cart-qty__btn';
      decrease.dataset.action = 'decrease';
      decrease.setAttribute('aria-label', 'Decrease quantity');
      decrease.textContent = '−';

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'cart-qty__input';
      input.min = '1';
      input.max = '99';
      input.value = String(item.quantity);
      input.setAttribute('aria-label', 'Quantity');
      input.inputMode = 'numeric';

      const increase = document.createElement('button');
      increase.type = 'button';
      increase.className = 'cart-qty__btn';
      increase.dataset.action = 'increase';
      increase.setAttribute('aria-label', 'Increase quantity');
      increase.textContent = '+';

      qtyGroup.append(decrease, input, increase);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'cart-line__remove';
      remove.dataset.action = 'remove';
      remove.textContent = 'Remove';

      controls.append(qtyGroup, remove);

      const lineTotal = document.createElement('p');
      lineTotal.className = 'cart-line__total';
      lineTotal.textContent = formatCad(product.priceCents * item.quantity);

      row.append(media, details, controls, lineTotal);
      linesEl.append(row);

      decrease.addEventListener('click', () => {
        setQuantity(product.sku, item.quantity - 1);
      });

      increase.addEventListener('click', () => {
        setQuantity(product.sku, item.quantity + 1);
      });

      remove.addEventListener('click', () => {
        removeItem(product.sku);
      });

      input.addEventListener('change', () => {
        const next = Number.parseInt(input.value, 10);
        if (Number.isNaN(next)) {
          input.value = String(item.quantity);
          return;
        }
        setQuantity(product.sku, next);
      });
    }
  };

  render();
  subscribe(render);
}

document.querySelectorAll<HTMLElement>('[data-cart-page]').forEach(initCartPage);
