import { parsePrice } from '@/shared/utils/price';

export interface ProductFormValues {
  nameAz: string;
  nameEn: string;
  categoryId: string;
  price: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export const NAME_MAX_LENGTH = 80;

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  const nameAz = values.nameAz.trim();
  if (!nameAz) errors.nameAz = 'Azərbaycan dilində ad məcburidir.';
  else if (nameAz.length > NAME_MAX_LENGTH) errors.nameAz = `Ad ${NAME_MAX_LENGTH} simvoldan uzun ola bilməz.`;

  if (values.nameEn.trim().length > NAME_MAX_LENGTH) {
    errors.nameEn = `Ad ${NAME_MAX_LENGTH} simvoldan uzun ola bilməz.`;
  }

  if (!values.categoryId) errors.categoryId = 'Kateqoriya seçin.';

  const priceText = values.price.trim();
  if (!priceText) {
    errors.price = 'Qiymət daxil edin.';
  } else {
    const price = parsePrice(priceText);
    if (price === null) errors.price = 'Düzgün qiymət daxil edin (məs. 4,50).';
    else if (price <= 0) errors.price = 'Qiymət 0-dan böyük olmalıdır.';
  }

  return errors;
}