import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { categoryService } from '../services/categoryService';
import { wishlistService } from '../services/wishlistService';
import { CourseGrid } from '../components/course/CourseGrid';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { COURSE_LEVELS } from '../lib/constants';
import { useAuthStore } from '../store/authStore';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    isFree: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      const ids = response.data.courses?.map(c => c._id) || [];
      setWishlistIds(ids);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleWishlistToggle = async (course) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const courseId = course._id || course.id;
    const isInWishlist = wishlistIds.includes(courseId);

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(courseId);
        setWishlistIds(wishlistIds.filter(id => id !== courseId));
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(courseId);
        setWishlistIds([...wishlistIds, courseId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.level) params.level = filters.level;
      if (filters.category) params.category = filters.category;
      if (filters.isFree) params.isFree = filters.isFree;
      if (filters.search) params.search = filters.search;

      const response = await courseService.getAllCourses(params);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({ level: '', category: '', isFree: '', search: '' });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-600">Explore our wide range of courses</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="primary">{activeFiltersCount}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                {showFilters ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters || 'hidden md:grid'}`}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />

            {/* Level Filter */}
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Levels</option>
              {Object.entries(COURSE_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={filters.isFree}
              onChange={(e) => handleFilterChange('isFree', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Prices</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <CourseGrid 
          courses={courses} 
          loading={loading} 
          onWishlistToggle={handleWishlistToggle}
          wishlistIds={wishlistIds}
        />
      </div>
    </div>
  );
};
