const PRINTIFY_API_BASE = "https://api.printify.com/v1";

async function printifyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = process.env.PRINTIFY_TOKEN;
  if (!token) throw new Error("PRINTIFY_TOKEN environment variable is not set");

  const url = `${PRINTIFY_API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": "NextJS",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Printify API error: ${res.status} ${res.statusText} - ${JSON.stringify(error)}`
    );
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Shops ──────────────────────────────────────────────

function getShopId() {
  const id = process.env.PRINTIFY_SHOP_ID;
  if (!id) throw new Error("PRINTIFY_SHOP_ID environment variable is not set");
  return id;
}

export async function getShops() {
  return printifyFetch<PrintifyShop[]>("/shops.json");
}

// ── Products ───────────────────────────────────────────

export async function getProducts(page = 1, limit = 10) {
  return printifyFetch<PrintifyPaginatedResponse<PrintifyProduct>>(
    `/shops/${getShopId()}/products.json?page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } }
  );
}

export async function getProduct(productId: string) {
  return printifyFetch<PrintifyProduct>(
    `/shops/${getShopId()}/products/${encodeURIComponent(productId)}.json`,
    { next: { revalidate: 300 } }
  );
}

export function slugify(title: string, id: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${id}`;
}

export function parseSlug(slug: string) {
  // ID is always the last 24-char hex segment
  const match = slug.match(/([a-f0-9]{24})$/);
  return match ? match[1] : slug;
}

// ── Catalog ────────────────────────────────────────────

export async function getBlueprints() {
  return printifyFetch<PrintifyBlueprint[]>("/catalog/blueprints.json");
}

export async function getBlueprint(blueprintId: number) {
  return printifyFetch<PrintifyBlueprint>(
    `/catalog/blueprints/${blueprintId}.json`
  );
}

export async function getBlueprintProviders(blueprintId: number) {
  return printifyFetch<PrintifyPrintProvider[]>(
    `/catalog/blueprints/${blueprintId}/print_providers.json`
  );
}

export async function getVariants(blueprintId: number, providerId: number) {
  return printifyFetch<{ variants: PrintifyVariant[] }>(
    `/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`
  );
}

export async function getShipping(blueprintId: number, providerId: number) {
  return printifyFetch<PrintifyShippingInfo>(
    `/catalog/blueprints/${blueprintId}/print_providers/${providerId}/shipping.json`
  );
}

// ── Orders ─────────────────────────────────────────────

export async function getOrders(page = 1, limit = 10) {
  return printifyFetch<PrintifyPaginatedResponse<PrintifyOrder>>(
    `/shops/${getShopId()}/orders.json?page=${page}&limit=${limit}`
  );
}

export async function getOrder(orderId: string) {
  return printifyFetch<PrintifyOrder>(
    `/shops/${getShopId()}/orders/${encodeURIComponent(orderId)}.json`
  );
}

export async function calculateShipping(body: {
  line_items: Array<{
    product_id?: string;
    variant_id?: number;
    quantity: number;
    sku?: string;
  }>;
  address_to: PrintifyAddress;
}) {
  return printifyFetch<Record<string, number>>(
    `/shops/${getShopId()}/orders/shipping.json`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

export async function submitOrder(body: {
  external_id: string;
  label?: string;
  line_items: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
  }>;
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: PrintifyAddress;
}) {
  return printifyFetch<PrintifyOrder>(
    `/shops/${getShopId()}/orders.json`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

// ── Uploads ────────────────────────────────────────────

export async function getUploads(page = 1, limit = 10) {
  return printifyFetch<PrintifyPaginatedResponse<PrintifyUpload>>(
    `/uploads.json?page=${page}&limit=${limit}`
  );
}

export async function uploadImage(body: {
  file_name: string;
  url?: string;
  contents?: string;
}) {
  return printifyFetch<PrintifyUpload>("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Types ──────────────────────────────────────────────

export interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

export interface PrintifyPaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: PrintifyOption[];
  variants: PrintifyProductVariant[];
  images: PrintifyMockupImage[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  blueprint_id: number;
  print_provider_id: number;
  user_id: number;
  shop_id: number;
  is_locked: boolean;
  is_printify_express_eligible: boolean;
  is_economy_shipping_eligible: boolean;
}

export interface PrintifyOption {
  name: string;
  type: string;
  values: Array<{
    id: number;
    title: string;
    colors?: string[];
  }>;
}

export interface PrintifyProductVariant {
  id: number;
  sku: string;
  price: number;
  cost: number;
  title: string;
  grams: number;
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
  is_printify_express_eligible: boolean;
  options: number[];
}

export interface PrintifyMockupImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location?: {
    address1: string;
    address2: string;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
}

export interface PrintifyVariant {
  id: number;
  title: string;
  options: Record<string, string>;
  placeholders: Array<{
    position: string;
    decoration_method: string;
    height: number;
    width: number;
  }>;
}

export interface PrintifyShippingInfo {
  handling_time: { value: number; unit: string };
  profiles: Array<{
    variant_ids: number[];
    first_item: { currency: string; cost: number };
    additional_items: { currency: string; cost: number };
    countries: string[];
  }>;
}

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  company?: string;
}

export interface PrintifyOrder {
  id: string;
  address_to: PrintifyAddress;
  line_items: Array<{
    product_id: string;
    quantity: number;
    variant_id: number;
    print_provider_id: number;
    cost: number;
    shipping_cost: number;
    status: string;
    metadata: {
      title: string;
      price: number;
      variant_label: string;
      sku: string;
      country: string;
    };
  }>;
  metadata: {
    order_type: string;
    shop_order_id: number;
    shop_order_label: string;
    shop_fulfilled_at: string;
  };
  total_price: number;
  total_shipping: number;
  total_tax: number;
  status: string;
  shipping_method: number;
  shipments: Array<{
    carrier: string;
    number: string;
    url: string;
    delivered_at: string;
  }>;
  created_at: string;
  sent_to_production_at: string;
  fulfilled_at: string;
}

export interface PrintifyUpload {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  preview_url: string;
  upload_time: string;
}
