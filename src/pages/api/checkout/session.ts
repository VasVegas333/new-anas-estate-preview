import type { APIRoute } from 'astro';
import { getProduct } from '../../../lib/catalog';
import {
  checkoutSessionSchema,
  errorResponse,
  jsonResponse,
  parseJsonBody,
  ValidationError,
} from '../../../lib/api';
import { fetchShippingRates } from '../../../lib/stallion';
import { buildRateRequest, mapStallionRates } from '../../../lib/shipping';
import { createCheckoutSession } from '../../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sku, destination, quoteId } = await parseJsonBody(
      request,
      checkoutSessionSchema,
    );
    const product = await getProduct(sku);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const rateRequest = buildRateRequest(product, destination);
    const { rates } = await fetchShippingRates(rateRequest);
    const shippingOptions = mapStallionRates(rates).slice(0, 3);

    if (shippingOptions.length === 0) {
      return errorResponse('No shipping options are currently available', 409);
    }

    const url = await createCheckoutSession({
      product,
      destination,
      shippingOptions,
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
