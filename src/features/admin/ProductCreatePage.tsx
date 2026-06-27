import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CirclePlus, PackagePlus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { catalogApi, queryKeys } from '../../api/endpoints';
import { useToast } from '../../components/system/ToastProvider';
import { Button } from '../../components/ui/Button';
import { Alert, ErrorAlert } from '../../components/ui/Feedback';
import { FieldFrame, Input, Textarea } from '../../components/ui/FormField';
import { Card, PageHeader } from '../../components/ui/Surface';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const variantSchema = z.object({
  skuCode: z.string().min(1, 'SKU code is required').max(100),
  attributesText: z.string().min(1, 'Add at least one key=value attribute'),
  price: z.number().min(0, 'Price cannot be negative').max(99_999_999),
  currency: z.string().length(3, 'Use a three-letter ISO currency').transform((value) => value.toUpperCase()),
});
const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required').max(4000),
  category: z.string().min(1, 'Category is required').max(100),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});
type FormValues = z.infer<typeof schema>;

export function ProductCreatePage() {
  useDocumentTitle('Product setup');
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', description: '', category: '', variants: [{ skuCode: '', attributesText: 'color=black\nsize=M', price: 0, currency: 'PLN' }] } });
  const variants = useFieldArray({ control: form.control, name: 'variants' });
  const create = useMutation({
    mutationFn: catalogApi.create,
    onSuccess: async () => { form.reset(); notify('Product published and catalog cache invalidated.', 'success'); await queryClient.invalidateQueries({ queryKey: queryKeys.products }); },
  });
  const submit = form.handleSubmit((values) => create.mutate({
    name: values.name,
    description: values.description,
    category: values.category,
    variants: values.variants.map((variant) => ({ skuCode: variant.skuCode, attributes: parseAttributes(variant.attributesText), priceMinor: Math.round(variant.price * 100), currency: variant.currency })),
  }));

  return <div className="page stack-lg"><PageHeader eyebrow="Catalog administration" title="Create product" description="Define immutable SKU identifiers, arbitrary product attributes, and prices in minor currency units." />{create.isSuccess ? <Alert tone="success" title="Product created">The catalog cache will be invalidated and customers can load the new product.</Alert> : null}{create.isError ? <ErrorAlert error={create.error} /> : null}<form onSubmit={submit} className="stack"><Card className="form-section"><div className="form-section__heading"><div className="form-section__icon"><PackagePlus /></div><div><h2>Product information</h2><p>Customer-facing title, description, and category.</p></div></div><div className="form-grid"><FieldFrame label="Product name" htmlFor="name" error={form.formState.errors.name?.message}><Input id="name" invalid={Boolean(form.formState.errors.name)} {...form.register('name')} /></FieldFrame><FieldFrame label="Category" htmlFor="category" error={form.formState.errors.category?.message}><Input id="category" invalid={Boolean(form.formState.errors.category)} {...form.register('category')} /></FieldFrame><div className="form-grid__wide"><FieldFrame label="Description" htmlFor="description" error={form.formState.errors.description?.message}><Textarea id="description" rows={5} invalid={Boolean(form.formState.errors.description)} {...form.register('description')} /></FieldFrame></div></div></Card><Card className="form-section"><div className="panel-heading"><div><p className="eyebrow">Sellable variants</p><h2>SKUs and attributes</h2></div><Button type="button" variant="secondary" icon={CirclePlus} onClick={() => variants.append({ skuCode: '', attributesText: '', price: 0, currency: 'PLN' })}>Add variant</Button></div>{form.formState.errors.variants?.root?.message ? <p className="field__error">{form.formState.errors.variants.root.message}</p> : null}<div className="variant-form-list">{variants.fields.map((field, index) => <fieldset key={field.id} className="variant-form"><legend>Variant {index + 1}</legend><div className="form-grid"><FieldFrame label="SKU code" htmlFor={`sku-${index}`} error={form.formState.errors.variants?.[index]?.skuCode?.message}><Input id={`sku-${index}`} invalid={Boolean(form.formState.errors.variants?.[index]?.skuCode)} {...form.register(`variants.${index}.skuCode`)} /></FieldFrame><FieldFrame label="Currency" htmlFor={`currency-${index}`} error={form.formState.errors.variants?.[index]?.currency?.message}><Input id={`currency-${index}`} maxLength={3} invalid={Boolean(form.formState.errors.variants?.[index]?.currency)} {...form.register(`variants.${index}.currency`)} /></FieldFrame><FieldFrame label="Price" htmlFor={`price-${index}`} error={form.formState.errors.variants?.[index]?.price?.message}><Input id={`price-${index}`} type="number" min="0" step="0.01" invalid={Boolean(form.formState.errors.variants?.[index]?.price)} {...form.register(`variants.${index}.price`, { valueAsNumber: true })} /></FieldFrame><div className="form-grid__wide"><FieldFrame label="Attributes" htmlFor={`attributes-${index}`} error={form.formState.errors.variants?.[index]?.attributesText?.message} hint="One key=value pair per line"><Textarea id={`attributes-${index}`} rows={3} invalid={Boolean(form.formState.errors.variants?.[index]?.attributesText)} {...form.register(`variants.${index}.attributesText`)} /></FieldFrame></div></div>{variants.fields.length > 1 ? <Button type="button" variant="danger" size="sm" icon={Trash2} onClick={() => variants.remove(index)}>Remove variant</Button> : null}</fieldset>)}</div></Card><Button className="align-self-start" type="submit" size="lg" loading={create.isPending}>Publish product</Button></form></div>;
}

function parseAttributes(value: string): Record<string, string> {
  return Object.fromEntries(value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const separator = line.indexOf('='); return separator < 1 ? [line, 'true'] : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]; }));
}
