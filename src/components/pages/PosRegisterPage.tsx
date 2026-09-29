import { formatCurrency } from '../../pos-utils'
import type { CartItem, Product, ProductVariant } from '../../types'

type Props = {
  locked: boolean
  products: Product[]
  categories: string[]
  search: string
  category: string
  setSearch: (value: string) => void
  setCategory: (value: string) => void
  cart: CartItem[]
  total: number
  add: (product: Product, variant?: ProductVariant) => void
  update: (id: string, direction: number, variantId?: string) => void
  clear: () => void
  pay: () => void
}

export function PosRegisterPage({ locked, products, categories, search, category, setSearch, setCategory, cart, total, add, update, clear, pay }: Props) {
  return (
    <div className="pos-layout">
      <div className="pos-product-panel panel">
        <div className="panel-header split-header">
          <h3>Products</h3>
          <div className="toolbar-inline">
            <input type="search" placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((entry) => <option key={entry}>{entry}</option>)}</select>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product) => {
            const variants = product.variants || []
            return (
              <div key={product.id} className="product-card">
                <button type="button" className="product-card-main" onClick={() => add(product)}>
                  <div className="product-card-top"><span className="product-chip">{product.category}</span><span className="stock-pill">{product.stock} in stock</span></div>
                  <h4>{product.name}</h4><p>{product.sku}</p><strong>{formatCurrency(product.sellingPrice)}</strong>
                </button>
                {variants.length > 0 && <div className="variant-buttons">{variants.map((variant) => <button type="button" key={variant.id} className="secondary-button" onClick={() => add(product, variant)}>{variant.name} · {formatCurrency(variant.sellingPrice)}</button>)}</div>}
              </div>
            )
          })}
        </div>
      </div>
      <div className="pos-cart-panel panel">
        <div className="panel-header"><h3>Current Order</h3></div>
        {locked ? <div className="empty-state-box"><h3>REGISTER LOCKED</h3><p>Start of Day required before sales can be processed.</p></div> : <>
          <div className="cart-items">
            {cart.length === 0 ? <div className="empty-state-box"><h3>Cart is empty</h3><p>Add a product to begin the sale.</p></div> : cart.map((item) => <div key={`${item.productId}-${item.variantId || 'base'}`} className="cart-row"><div><strong>{item.productName}{item.variantName ? ` · ${item.variantName}` : ''}</strong><small>{formatCurrency(item.unitPrice)} each</small></div><div className="cart-counter"><button type="button" onClick={() => update(item.productId, -1, item.variantId)}>-</button><span>{item.quantity}</span><button type="button" onClick={() => update(item.productId, 1, item.variantId)}>+</button></div><button type="button" className="link-button" onClick={() => update(item.productId, -item.quantity, item.variantId)}>Remove</button></div>)}
          </div>
          <div className="totals-box"><div><span>Subtotal</span><strong>{formatCurrency(total)}</strong></div><div className="grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div></div>
          <div className="cart-actions"><button type="button" className="secondary-button" onClick={clear}>Clear Cart</button><button type="button" className="primary-button" onClick={pay} disabled={cart.length === 0}>Pay {formatCurrency(total)}</button></div>
        </>}
      </div>
    </div>
  )
}
