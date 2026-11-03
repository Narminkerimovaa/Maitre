import type { Product, ProductInput } from '@/features/products/api/api';
import { parsePrice } from '@/shared/utils/price';
import type { ProductFormValues } from './validateProduct';

export interface ProductFormState extends ProductFormValues {
  isAvailable: boolean;
}

export const EMPTY_FORM: ProductFormState = {
  nameAz: '',
  nameEn: '',
  categoryId: '',
  price: '',
  isAvailable: true,
};

export function toFormState(product: Product): ProductFormState {
  return {
    nameAz: product.nameAz,
    nameEn: product.nameEn ?? '',
    categoryId: String(product.categoryId),
    price: product.price.toFixed(2).replace('.', ','),
    isAvailable: product.isAvailable,
  };
}

export function toProductInput(state: ProductFormState): ProductInput | null {
  const price = parsePrice(state.price);
  if (price === null) return null;

  return {
    nameAz: state.nameAz.trim(),
    nameEn: state.nameEn.trim() || null,
    categoryId: Number(state.categoryId),
    price,
    isAvailable: state.isAvailable,
  };
}

export function hasChanges(product: Product, input: ProductInput): boolean {
  return (
    product.nameAz !== input.nameAz ||
    (product.nameEn ?? null) !== input.nameEn ||
    product.categoryId !== input.categoryId ||
    product.price !== input.price ||
    product.isAvailable !== input.isAvailable
  );
}