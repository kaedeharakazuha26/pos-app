import { useState } from "react";
import { formatCurrency } from "../../pos-utils";
import type { Product } from "../../types";

type Props = {
  products: Product[];
  onRestock: (productId: string, quantity: number) => void;
};

export function InventoryPage({ products, onRestock }: Props) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const filteredProducts = products.filter(
    (product) =>
      !search.trim() ||
      product.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      product.sku.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <div className="panel">
      <div className="panel-header split-header">
        <h3>Inventory Restock</h3>
        <input
          type="search"
          placeholder="Search SKU or product"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Stock</th>
            <th>Cost</th>
            <th>Restock Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>{product.stock}</td>
              <td>{formatCurrency(product.costPrice)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={quantities[product.id] || ""}
                  onChange={(event) =>
                    setQuantities({
                      ...quantities,
                      [product.id]: event.target.value,
                    })
                  }
                />
              </td>
              <td>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    const quantity = Number(quantities[product.id] || 0);
                    if (quantity > 0) {
                      onRestock(product.id, quantity);
                      setQuantities({ ...quantities, [product.id]: "" });
                    }
                  }}
                >
                  Restock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
