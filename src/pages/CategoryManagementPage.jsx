import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { categoryService } from '../services/categoryService';
import { Pencil, Trash2, Check, X } from 'lucide-react';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await categoryService.createCategory({ name: newCategory.trim() });
      setSuccess('Category added successfully!');
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEditCategory = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
    setError('');
    setSuccess('');
  };

  const handleUpdateCategory = async (catId) => {
    if (!editingName.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await categoryService.updateCategory(catId, { name: editingName.trim() });
      setSuccess('Category updated successfully!');
      setEditingId(null);
      setEditingName('');
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await categoryService.deleteCategory(catId);
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">Manage Categories</h1>
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleAddCategory} className="flex gap-3 mb-4">
              <Input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="New category name"
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !newCategory.trim()}>
                {loading ? <Spinner size="sm" /> : 'Add Category'}
              </Button>
            </form>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}
            <div>
              <h2 className="text-lg font-semibold mb-2">Existing Categories</h2>
              {categories.length === 0 ? (
                <div className="text-slate-500">No categories found.</div>
              ) : (
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat._id} className="px-3 py-2 bg-white rounded shadow border flex items-center justify-between">
                      {editingId === cat._id ? (
                        <>
                          <Input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            className="flex-1 mr-2"
                            disabled={loading}
                          />
                          <Button size="sm" onClick={() => handleUpdateCategory(cat._id)} disabled={loading || !editingName.trim()} className="mr-1">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditingName(''); }} disabled={loading}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span>{cat.name}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat)} disabled={loading}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(cat._id)} disabled={loading}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
