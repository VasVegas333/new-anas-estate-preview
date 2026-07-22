import { addItem, getCart, getItemCount, setQuantity, subscribe } from './cart';

function updateBadges(): void {
  const count = getItemCount();
  const label = count === 1 ? '1 item in cart' : `${count} items in cart`;

  document.querySelectorAll<HTMLElement>('[data-cart-badge]').forEach((badge) => {
    if (count > 0) {
      badge.hidden = false;
      badge.textContent = count > 99 ? '99+' : String(count);
    } else {
      badge.hidden = true;
      badge.textContent = '';
    }
  });

  document.querySelectorAll<HTMLElement>('[data-cart-link]').forEach((link) => {
    link.setAttribute('aria-label', count > 0 ? `Cart, ${label}` : 'Cart');
  });
}

function quantityInCart(sku: string): number {
  return getCart().find((item) => item.sku === sku)?.quantity ?? 0;
}

function syncProductCartControls(): void {
  document.querySelectorAll<HTMLElement>('[data-product-cart]').forEach((root) => {
    const sku = root.dataset.productCart;
    if (!sku) return;

    const quantity = quantityInCart(sku);
    const addButton = root.querySelector<HTMLButtonElement>('[data-add-to-cart]');
    const qtyControl = root.querySelector<HTMLElement>('[data-cart-qty]');
    const qtyLabel = root.querySelector<HTMLElement>('[data-cart-qty-label]');
    const decrease = root.querySelector<HTMLButtonElement>('[data-cart-decrease]');
    const increase = root.querySelector<HTMLButtonElement>('[data-cart-increase]');

    if (!addButton || !qtyControl || !qtyLabel) return;

    if (quantity > 0) {
      addButton.hidden = true;
      qtyControl.hidden = false;
      qtyLabel.textContent = `${quantity} In Cart`;
      if (decrease) decrease.disabled = false;
      if (increase) increase.disabled = quantity >= 99;
    } else {
      addButton.hidden = false;
      addButton.textContent = 'Add to Cart';
      qtyControl.hidden = true;
    }
  });
}

function initProductCartControls(): void {
  document.querySelectorAll<HTMLElement>('[data-product-cart]').forEach((root) => {
    const sku = root.dataset.productCart;
    if (!sku) return;

    const addButton = root.querySelector<HTMLButtonElement>('[data-add-to-cart]');
    const decrease = root.querySelector<HTMLButtonElement>('[data-cart-decrease]');
    const increase = root.querySelector<HTMLButtonElement>('[data-cart-increase]');

    addButton?.addEventListener('click', () => {
      addItem(sku);
    });

    decrease?.addEventListener('click', () => {
      setQuantity(sku, quantityInCart(sku) - 1);
    });

    increase?.addEventListener('click', () => {
      setQuantity(sku, quantityInCart(sku) + 1);
    });
  });
}

updateBadges();
syncProductCartControls();
subscribe(() => {
  updateBadges();
  syncProductCartControls();
});
initProductCartControls();
