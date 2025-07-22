import api from './api.jsx'

// ✅ Fetch categories (userId pulled from JWT on backend)
export async function fetchCategories() {
  try {
    const res = await api.get('/categories')
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Failed to fetch categories:', err)
    return []
  }
}

// ✅ Create category (userId added on backend via token)
export async function createCategory(data) {
  try {
    const res = await api.post('/categories', data)
    return res.data
  } catch (err) {
    console.error('❌ Failed to create category:', err)
    throw err
  }
}

// ✅ Update category by ID
export async function updateCategory(id, data) {
  try {
    const res = await api.put(`/categories/${id}`, data)
    return res.data
  } catch (err) {
    console.error(`❌ Failed to update category ${id}:`, err)
    throw err
  }
}

// ✅ Delete category by ID
export async function deleteCategory(id) {
  try {
    const res = await api.delete(`/categories/${id}`)
    return res.data
  } catch (err) {
    console.error(`❌ Failed to delete category ${id}:`, err)
    throw err
  }
}
