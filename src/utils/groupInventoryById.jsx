export function groupInventoryById(rawInventory) {
  const grouped = {}

  for (const item of rawInventory) {
    const id = item.inventory_id

    if (!grouped[id]) {
      grouped[id] = {
        inventory_id: item.inventory_id,
        name: item.name,
        barcode: item.barcode,
        unit: item.unit,
        cost_per_unit: item.cost_per_unit,
        low_stock_threshold: item.low_stock_threshold,
        category_id: item.category_id,
        category_name: item.category_name,
        supplier_id: item.supplier_id,
        supplier_name: item.supplier_name,
        locations: [],
      }
    }

    // Add location info if it exists
    if (item.location_id) {
      grouped[id].locations.push({
        location_id: item.location_id,
        location_name: item.location_name,
        quantity: item.quantity,
        low_stock_threshold: item.location_low_stock_threshold,
        updated_at: item.location_updated_at,
      })
    }
  }

  return Object.values(grouped)
}
