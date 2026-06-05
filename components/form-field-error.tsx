export function FormFieldError({
  name,
  errors,
  touched,
  showAll,
}: {
  name: string;
  errors: Record<string, unknown>;
  touched: Record<string, unknown>;
  showAll: boolean;
}) {
  const err = errors[name];
  if (!err) return null;
  if (!showAll && !touched[name]) return null;
  return <p className="mt-1 text-xs text-red-500">{String(err)}</p>;
}
