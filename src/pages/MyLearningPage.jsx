import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock } from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { formatCurrency } from '../lib/utils';

export const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, [filter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await enrollmentService.getMyEnrollments(status);
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 font-medium ${
              filter === 'ongoing'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 font-medium ${
              filter === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Enrollments Grid */}
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start learning by enrolling in a course
              </p>
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment._id} className="group hover:shadow-lg transition-shadow">
                <Link to={`/courses/${enrollment.course._id}/learn`}>
                  <img
                    src={enrollment.course.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={enrollment.course.title}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
                  />
                </Link>
                <CardContent className="p-4">
                  <Link to={`/courses/${enrollment.course._id}/learn`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {enrollment.course.title}
                    </h3>
                  </Link>
                  
                  {enrollment.course.instructor && (
                    <p className="text-sm text-gray-600 mb-3">
                      {enrollment.course.instructor.name}
                    </p>
                  )}

                  {enrollment.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">
                          {Math.round(enrollment.progress.progressPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link to={`/courses/${enrollment.course._id}/learn`}>
                    <Button variant="outline" className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
