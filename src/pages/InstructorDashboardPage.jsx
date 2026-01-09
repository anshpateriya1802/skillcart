import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';

export const InstructorDashboardPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await instructorService.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    setActionLoading(courseId);
    try {
      await instructorService.togglePublish(courseId);
      // Update local state
      setCourses(courses.map(course => 
        course._id === courseId 
          ? { ...course, published: !currentStatus }
          : course
      ));
    } catch (error) {
      setError('Failed to update course status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setActionLoading(courseId);
    try {
      await instructorService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      setError('Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageLoader />;

  const publishedCount = courses.filter(c => c.published).length;
  const draftCount = courses.filter(c => !c.published).length;
  const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
              <p className="text-gray-600">Manage your courses and content</p>
            </div>
            <Link to="/instructor/courses/create">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New Course
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Published</p>
                  <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
                </div>
                <Eye className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600">{draftCount}</p>
                </div>
                <EyeOff className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating courses and share your knowledge with students
              </p>
              <Link to="/instructor/courses/create">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            {courses.map((course) => (
              <Card key={course._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/200x120'}
                      alt={course.title}
                      className="w-48 h-28 object-cover rounded-lg flex-shrink-0"
                    />

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {course.title}
                            </h3>
                            {course.published ? (
                              <Badge variant="success">Published</Badge>
                            ) : (
                              <Badge variant="warning">Draft</Badge>
                            )}
                            {course.level && (
                              <Badge variant="default">
                                {COURSE_LEVELS[course.level]}
                              </Badge>
                            )}
                          </div>
                          {course.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {course.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium text-gray-900">
                              {course.isFree ? 'Free' : formatCurrency(course.price)}
                            </span>
                            {course.category && (
                              <span>• {course.category.name}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link to={`/instructor/courses/${course._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          
                          <Button
                            variant={course.published ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleTogglePublish(course._id, course.published)}
                            disabled={actionLoading === course._id}
                          >
                            {course.published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCourse(course._id)}
                            disabled={actionLoading === course._id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
