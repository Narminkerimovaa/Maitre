/**
 * Maitre — mock API for the frontend internship task.
 *
 * This file simulates a real backend. Like a real server:
 *   - every call responds after a delay,
 *   - calls sometimes fail with an error.
 * Do not change this behaviour. Data is kept in memory and resets on page reload.
 *
 * Usage: copy this file into your project and import the functions below.
 */

// ---------- Types ----------

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  nameAz: string;
  nameEn: string | null;
  categoryId: number;
  price: number; // in AZN, e.g. 4.5
  isAvailable: boolean;
}

export interface ProductInput {
  nameAz: string;
  nameEn: string | null;
  categoryId: number;
  price: number;
  isAvailable: boolean;
}

export interface GetProductsParams {
  search?: string; // matches nameAz or nameEn, case-insensitive
  categoryId?: number;
  page?: number; // starts at 1, default 1
  pageSize?: number; // default 10
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------- Data ----------

const categories: Category[] = [
  { id: 1, name: "Şorbalar" },
  { id: 2, name: "Əsas yeməklər" },
  { id: 3, name: "Qəlyanaltılar" },
  { id: 4, name: "Salatlar" },
  { id: 5, name: "Desertlər" },
  { id: 6, name: "İçkilər" },
];

const seed: Array<[string, string | null, number, number, boolean]> = [
  ["Mərci şorbası", "Lentil soup", 1, 4.5, true],
  ["Dovğa", "Yogurt and herb soup", 1, 3.8, true],
  ["Şah plov", "Shah pilaf", 2, 18, true],
  ["Tikə kabab", "Lamb shish kebab", 2, 14.5, true],
  ["Yarpaq dolması", "Vine leaf dolma", 2, 9, false],
  ["Göyərti qutabı", null, 3, 2.5, true],
  ["Çoban salatı", "Shepherd's salad", 4, 5, true],
  ["Sezar salatı", "Caesar salad", 4, 8.5, false],
  ["Pəhləvi", "Baklava", 5, 6, true],
  ["Limonlu çay (dəmlik)", "Black tea with lemon (pot)", 6, 7, true],
  ["Düşbərə", "Dushbara dumpling soup", 1, 5.5, true],
  ["Piti", "Lamb and chickpea stew", 1, 9.5, true],
  ["Toyuq şorbası", "Chicken soup", 1, 4, true],
  ["Xaş", "Khash", 1, 8, false],
  ["Küftə bozbaş", null, 1, 7.5, true],
  ["Umac aşı", "Umaj soup", 1, 4.2, true],
  ["Lülə kabab", "Lula kebab", 2, 12, true],
  ["Toyuq kabab", "Chicken kebab", 2, 11, true],
  ["Kələm dolması", "Cabbage dolma", 2, 8.5, true],
  ["Saj içi", "Mixed saj", 2, 16, true],
  ["Sabzi qovurma", "Lamb and herb stew", 2, 13.5, true],
  ["Çığırtma", "Chicken with eggs", 2, 7.5, true],
  ["Ləvəngi", "Stuffed chicken", 2, 15, true],
  ["Bozartma", "Lamb bozartma", 2, 13, true],
  ["Tava kabab", "Pan kebab", 2, 10.5, true],
  ["Nərə balığı kabab", "Sturgeon kebab", 2, 17, false],
  ["Ət qutabı", "Meat qutab", 3, 3, true],
  ["Kükü", "Herb frittata", 3, 4.5, true],
  ["Pendir assorti", "Cheese platter", 3, 9, true],
  ["Turşu assorti", "Pickle platter", 3, 4, true],
  ["Qızardılmış badımcan", "Fried eggplant", 3, 5.5, true],
  ["Göyərti boşqabı", "Fresh herbs plate", 3, 3.5, true],
  ["Paytaxt salatı", "Olivier salad", 4, 7, true],
  ["Badımcan salatı", "Eggplant salad", 4, 6, true],
  ["Yunan salatı", "Greek salad", 4, 7.5, true],
  ["Mimoza", "Mimosa salad", 4, 6.5, true],
  ["Pomidor-xiyar salatı", "Tomato and cucumber salad", 4, 4.5, true],
  ["Şəkərbura", "Shakarbura", 5, 5, true],
  ["Şəkər çörəyi", "Shortbread", 5, 4, true],
  ["Firni", "Rice pudding", 5, 4.5, true],
  ["Mütəkkə", null, 5, 4.5, false],
  ["Qoğal", "Gogal pastry", 5, 3, true],
  ["Medovik", "Honey cake", 5, 6.5, true],
  ["Ayran", "Ayran", 6, 2, true],
  ["Kompot", "Fruit compote", 6, 3, true],
  ["Şərbət", "Sherbet", 6, 3.5, true],
  ["Portağal şirəsi", "Orange juice", 6, 5, true],
  ["Nar şirəsi", "Pomegranate juice", 6, 6, false],
];

let products: Product[] = seed.map(([nameAz, nameEn, categoryId, price, isAvailable], i) => ({
  id: i + 1,
  nameAz,
  nameEn,
  categoryId,
  price,
  isAvailable,
}));

let nextId = products.length + 1;

// ---------- Simulated network ----------

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 1500;
const FAILURE_RATE = 0.1;

function request<T>(handler: () => T): Promise<T> {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new ApiError(500, "Server xətası. Yenidən cəhd edin."));
        return;
      }
      try {
        resolve(structuredClone(handler()));
      } catch (e) {
        reject(e);
      }
    }, delay);
  });
}

const normalize = (s: string) => s.toLocaleLowerCase("az").trim();

function validate(input: ProductInput): void {
  if (!input.nameAz || !input.nameAz.trim()) {
    throw new ApiError(400, "Azərbaycan dilində ad məcburidir.");
  }
  if (!categories.some((c) => c.id === input.categoryId)) {
    throw new ApiError(400, "Kateqoriya tapılmadı.");
  }
  if (typeof input.price !== "number" || !Number.isFinite(input.price) || input.price <= 0) {
    throw new ApiError(400, "Qiymət 0-dan böyük olmalıdır.");
  }
}

// ---------- API ----------

export function getCategories(): Promise<Category[]> {
  return request(() => categories);
}

export function getProducts(params: GetProductsParams = {}): Promise<PagedResult<Product>> {
  return request(() => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const search = params.search ? normalize(params.search) : "";

    const filtered = products.filter((p) => {
      if (params.categoryId !== undefined && p.categoryId !== params.categoryId) return false;
      if (!search) return true;
      return (
        normalize(p.nameAz).includes(search) ||
        (p.nameEn !== null && normalize(p.nameEn).includes(search))
      );
    });

    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  });
}

export function createProduct(input: ProductInput): Promise<Product> {
  return request(() => {
    validate(input);
    const product: Product = {
      id: nextId++,
      nameAz: input.nameAz.trim(),
      nameEn: input.nameEn?.trim() || null,
      categoryId: input.categoryId,
      price: input.price,
      isAvailable: input.isAvailable,
    };
    products = [...products, product];
    return product;
  });
}

export function updateProduct(id: number, changes: Partial<ProductInput>): Promise<Product> {
  return request(() => {
    const existing = products.find((p) => p.id === id);
    if (!existing) {
      throw new ApiError(404, "Məhsul tapılmadı.");
    }
    const merged: ProductInput = { ...existing, ...changes };
    validate(merged);
    const updated: Product = {
      ...existing,
      ...merged,
      nameAz: merged.nameAz.trim(),
      nameEn: merged.nameEn?.trim() || null,
    };
    products = products.map((p) => (p.id === id ? updated : p));
    return updated;
  });
}
