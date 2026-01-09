import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Settings } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { CurriculumBuilder } from '../components/instructor/CurriculumBuilder';

export const CourseEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('curriculum'); // curriculum or settings

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getMyCourses();
      const foundCourse = response.data.find(c => c._id === id);
      
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
        <Button onClick={() => navigate('/instructor/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">Course not found</Alert>
        <Button onClick={() => navigate('/instructor/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/instructor/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <div className="flex items-center gap-3">
                <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-gray-600">
                  {course.isFree ? 'Free' : `₹${course.price}`}
                </span>
                {course.level && (
                  <span className="text-gray-600 capitalize">{course.level}</span>
                )}
              </div>
            </div>

            <Link to={`/instructor/courses/${id}/form`}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'curriculum'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-5 h-5 inline-block mr-2" />
              Curriculum
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'curriculum' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Organize your course content into sections and lectures. Students will progress through your course in this order.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <CurriculumBuilder courseId={id} />
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips for Great Course Content</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>Group related lectures into sections for better organization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>Keep lectures concise (5-15 minutes is ideal)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>Mark one or two lectures as "Free Preview" to attract students</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>Add accurate video durations to help students plan their learning</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>Use clear, descriptive titles that tell students what they'll learn</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
