import type { APIRoute } from 'astro';
import { getProduct } from '../../../lib/catalog';
import {
  checkoutSessionSchema,
  dedupeCartItems,
  errorResponse,
  jsonResponse,
  parseJsonBody,
  ValidationError,
} from '../../../lib/api';
import { fetchShippingRates } from '../../../lib/stallion';
import { buildRateRequest, findShippingOption, mapStallionRates } from '../../../lib/shipping';
import { createCheckoutSession } from '../../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items, destination, quoteId, serviceId } = await parseJsonBody(
      request,
      checkoutSessionSchema,
    );
    const cartItems = dedupeCartItems(items);

    const lines = [];
    for (const item of cartItems) {
      const product = await getProduct(item.sku);
      if (!product) {
        return errorResponse(`Product not found: ${item.sku}`, 404);
      }
      lines.push({ product, quantity: item.quantity });
    }

    const rateRequest = buildRateRequest(lines, destination);
    const { rates } = await fetchShippingRates(rateRequest);
    const quotedOptions = mapStallionRates(rates).slice(0, 3);
    const selectedOption = findShippingOption(quotedOptions, serviceId);

    if (!selectedOption) {
      return errorResponse('Selected shipping method is no longer available', 409);
    }

    const url = await createCheckoutSession({
      lines,
      destination,
      shippingOptions: [selectedOption],
      stallionQuoteId: quoteId,
    });

    return jsonResponse({ url });
  } catch (error) {
    console.error('Checkout session error:', error);

    if (error instanceof ValidationError) {
      return errorResponse('Please correct the highlighted fields.', 400, error.fieldErrors);
    }

    const message = error instanceof Error ? error.message : 'Unable to start checkout';
    const status = message === 'Invalid JSON body' ? 400 : 502;
    return errorResponse(
      status === 400 ? message : 'Unable to start checkout. Please try again.',
      status,
    );
  }
};
