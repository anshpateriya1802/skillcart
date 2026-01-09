import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistService } from '../services/wishlistService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';

export const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId) => {
    setRemoving(courseId);
    try {
      await wishlistService.removeFromWishlist(courseId);
      setWishlist({
        ...wishlist,
        courses: wishlist.courses.filter(course => course._id !== courseId)
      });
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      setError('Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return <PageLoader />;

  const courses = wishlist?.courses || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} saved
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Wishlist Content */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Save courses you're interested in for later
              </p>
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Course Image */}
                    <Link 
                      to={`/courses/${course._id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                        alt={course.title}
                        className="w-full md:w-64 h-40 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        {course.level && (
                          <Badge variant="primary">
                            {COURSE_LEVELS[course.level]}
                          </Badge>
                        )}
                        {course.isFree && (
                          <Badge variant="success">Free</Badge>
                        )}
                      </div>

                      <Link to={`/courses/${course._id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                      </Link>

                      {course.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {course.instructor && (
                        <p className="text-sm text-gray-600 mb-4">
                          By {course.instructor.name}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <Link to={`/courses/${course._id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleRemove(course._id)}
                          disabled={removing === course._id}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          {removing === course._id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        {course.isFree ? 'Free' : formatCurrency(course.price)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
