import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Add product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
