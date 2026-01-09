import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDuration } from '../../lib/utils';
import { COURSE_LEVELS } from '../../lib/constants';

export const CourseCard = ({ course, onWishlistToggle, isInWishlist }) => {
  const levelColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <Link to={`/courses/${course._id || course.id}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={course.thumbnail || 'https://via.placeholder.com/400x225'}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.isFree && (
            <Badge className="absolute top-3 left-3" variant="success">
              Free
            </Badge>
          )}
          {course.level && (
            <Badge className="absolute top-3 right-3" variant={levelColors[course.level]}>
              {COURSE_LEVELS[course.level]}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/courses/${course._id || course.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
        </Link>
        
        {course.instructor && (
          <p className="text-sm text-gray-600 mt-1">
            {course.instructor.name}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          {course.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
              {course.ratingCount > 0 && (
                <span className="text-gray-500">({course.ratingCount})</span>
              )}
            </div>
          )}
          
          {course.totalDuration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xl font-bold text-gray-900">
          {course.isFree ? 'Free' : formatCurrency(course.price)}
        </div>
        
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle(course);
            }}
            className={`transition-colors ${isInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-red-500' : ''}`} />
          </button>
        )}
      </CardFooter>
    </Card>
  );
};
