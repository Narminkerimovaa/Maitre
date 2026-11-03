import { useId, useMemo, useState, type FormEvent } from 'react';
import type { Product } from '@/features/products/api/api';
import { useCategoriesStore } from '@/features/products/store/categoriesStore';
import { getErrorMessage, useProductsStore } from '@/features/products/store/productsStore';
import {
  EMPTY_FORM,
  hasChanges,
  toFormState,
  toProductInput,
  type ProductFormState,
} from '@/features/products/utils/productForm';
import {
  validateProduct,
  type ProductFormErrors,
  type ProductFormValues,
} from '@/features/products/utils/validateProduct';
import { Button } from '@/shared/ui/Button/Button';
import { Field } from '@/shared/ui/Field/Field';
import { Input } from '@/shared/ui/Input/Input';
import { Modal } from '@/shared/ui/Modal/Modal';
import { Select } from '@/shared/ui/Select/Select';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { Switch } from '@/shared/ui/Switch/Switch';
import { toast } from '@/shared/ui/Toast/toastStore';
import styles from './ProductFormModal.module.css';

export type FormTarget = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

type FieldName = keyof ProductFormValues;

const FIELD_ORDER: FieldName[] = ['nameAz', 'nameEn', 'categoryId', 'price'];

interface ProductFormModalProps {
  target: FormTarget;
  onClose: () => void;
}

export function ProductFormModal({ target, onClose }: ProductFormModalProps) {
  if (!target) return null;

  return (
    <ProductFormDialog
      product={target.mode === 'edit' ? target.product : null}
      onClose={onClose}
    />
  );
}

interface ProductFormDialogProps {
  product: Product | null;
  onClose: () => void;
}

function ProductFormDialog({ product, onClose }: ProductFormDialogProps) {
  const isEdit = product !== null;
  const baseId = useId();
  const ids = {
    nameAz: `${baseId}-nameAz`,
    nameEn: `${baseId}-nameEn`,
    categoryId: `${baseId}-categoryId`,
    price: `${baseId}-price`,
    status: `${baseId}-status`,
  };

  const [values, setValues] = useState<ProductFormState>(() =>
    product ? toFormState(product) : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const categories = useCategoriesStore((s) => s.items);
  const categoriesStatus = useCategoriesStore((s) => s.status);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const createProduct = useProductsStore((s) => s.createProduct);
  const updateProduct = useProductsStore((s) => s.updateProduct);

  const options = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories],
  );

  const describedBy = (name: FieldName) => (errors[name] ? `${ids[name]}-error` : undefined);

  const setFieldError = (name: FieldName, message: string | undefined) =>
    setErrors((prev) => {
      if (prev[name] === message) return prev;
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });

  const changeField = (name: FieldName, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    setServerError(null);
    if (errors[name]) setFieldError(name, validateProduct(next)[name]);
  };

  const blurField = (name: FieldName) => setFieldError(name, validateProduct(values)[name]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validateProduct(values);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      document.getElementById(ids[firstInvalid])?.focus();
      return;
    }

    const input = toProductInput(values);
    if (!input) return;

    if (product && !hasChanges(product, input)) {
      onClose();
      return;
    }

    setSaving(true);
    setServerError(null);

    try {
      if (product) {
        await updateProduct(product.id, input);
        toast.success(`«${input.nameAz}» yeniləndi.`);
      } else {
        await createProduct(input);
        toast.success(`«${input.nameAz}» əlavə olundu.`);
      }
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Məhsulu düzəlt' : 'Yeni məhsul'}
      onClose={onClose}
      dismissible={!saving}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div role="alert" className={styles.banner}>
            {serverError}
          </div>
        )}

        <fieldset className={styles.fields} disabled={saving}>
          <Field id={ids.nameAz} label="Ad (Azərbaycan dilində)" required error={errors.nameAz}>
            <Input
              id={ids.nameAz}
              data-autofocus
              autoComplete="off"
              value={values.nameAz}
              aria-invalid={Boolean(errors.nameAz)}
              aria-describedby={describedBy('nameAz')}
              onChange={(event) => changeField('nameAz', event.target.value)}
              onBlur={() => blurField('nameAz')}
            />
          </Field>

          <Field id={ids.nameEn} label="Ad (ingilis dilində)" error={errors.nameEn}>
            <Input
              id={ids.nameEn}
              autoComplete="off"
              value={values.nameEn}
              aria-invalid={Boolean(errors.nameEn)}
              aria-describedby={describedBy('nameEn')}
              onChange={(event) => changeField('nameEn', event.target.value)}
              onBlur={() => blurField('nameEn')}
            />
          </Field>

          <Field id={ids.categoryId} label="Kateqoriya" required error={errors.categoryId}>
            <Select
              id={ids.categoryId}
              aria-labelledby={`${ids.categoryId}-label`}
              aria-describedby={describedBy('categoryId')}
              options={options}
              value={values.categoryId}
              placeholder="Kateqoriya seçin"
              invalid={Boolean(errors.categoryId)}
              disabled={saving || categoriesStatus === 'idle' || categoriesStatus === 'loading'}
              onChange={(value) => changeField('categoryId', value)}
            />
            {categoriesStatus === 'error' && (
              <button
                type="button"
                className={styles.retry}
                onClick={() => void fetchCategories()}
              >
                Kateqoriyalar yüklənmədi. Yenidən cəhd et
              </button>
            )}
          </Field>

          <Field id={ids.price} label="Qiymət" required error={errors.price}>
            <Input
              id={ids.price}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              value={values.price}
              aria-invalid={Boolean(errors.price)}
              aria-describedby={describedBy('price')}
              endSlot={<span className={styles.currency}>₼</span>}
              onChange={(event) => changeField('price', event.target.value)}
              onBlur={() => blurField('price')}
            />
          </Field>

          <div className={styles.statusRow}>
            <span id={ids.status} className={styles.statusLabel}>
              Satış statusu
            </span>
            <div className={styles.statusControl}>
              <Switch
                checked={values.isAvailable}
                aria-labelledby={ids.status}
                onChange={(checked) => setValues((prev) => ({ ...prev, isAvailable: checked }))}
              />
              <span>{values.isAvailable ? 'Satışda' : 'Satışda deyil'}</span>
            </div>
          </div>
        </fieldset>

        <div className={styles.actions}>
          <Button variant="secondary" disabled={saving} onClick={onClose}>
            Ləğv et
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner />}
            {saving ? 'Saxlanılır…' : 'Yadda saxla'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}