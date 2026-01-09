import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Star, Users, Award, Play, Heart, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { reviewService } from '../services/reviewService';
import { wishlistService } from '../services/wishlistService';
import { sectionService } from '../services/sectionService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency, formatDuration } from '../lib/utils';
import { COURSE_LEVELS } from '../lib/constants';
import { useAuthStore } from '../store/authStore';
import { ReviewSection } from '../components/course/ReviewSection';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    fetchCourseDetails();
    fetchSections();
    fetchReviews();
    if (isAuthenticated) {
      checkEnrollment();
      checkWishlistStatus();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await courseService.getCourse(id);
      setCourse(response.data);
    } catch (error) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await sectionService.getCourseSections(id);
      setSections(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getCourseReviews(id, { limit: 10 });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await enrollmentService.checkEnrollment(id);
      setIsEnrolled(response.data.enrolled);
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistService.checkWishlist(id);
      setIsInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addToWishlist(id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
      setError(error.message || 'Failed to update wishlist');
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If it's a paid course, redirect to payment page
    if (!course.isFree) {
      navigate(`/payment/${id}`);
      return;
    }

    // For free courses, enroll directly
    setEnrolling(true);
    try {
      await enrollmentService.enrollCourse(id);
      setIsEnrolled(true);
      toast.success('Successfully enrolled in the course!');
      navigate('/my-learning');
    } catch (error) {
      const errorMessage = error.message || 'Failed to enroll';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error && !course) return <Alert variant="error">{error}</Alert>;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  const levelColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {course.category && (
                  <Badge variant="primary">{course.category.name}</Badge>
                )}
                {course.level && (
                  <Badge variant={levelColors[course.level]}>
                    {COURSE_LEVELS[course.level]}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm">
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{course.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({course.ratingCount} ratings)</span>
                  </div>
                )}
                
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">By</span>
                    <span className="font-medium">{course.instructor.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    {course.isFree ? 'Free' : formatCurrency(course.price)}
                  </div>

                  {isEnrolled ? (
                    <Button
                      onClick={() => navigate('/my-learning')}
                      className="w-full mb-3"
                    >
                      Go to Course
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full mb-3"
                    >
                      {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll Now' : 'Buy Now'}
                    </Button>
                  )}

                  {!isEnrolled && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleWishlistToggle}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                      {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </Button>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    {course.totalDuration && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5" />
                        <span>{formatDuration(course.totalDuration)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-700">
                      <BookOpen className="w-5 h-5" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Award className="w-5 h-5" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      {sections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          <div className="mb-4 text-sm text-gray-600">
            {sections.length} sections • {sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0)} lectures
          </div>
          
          <div className="space-y-3">
            {sections.map((section) => (
              <Card key={section._id}>
                <CardContent className="p-0">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">
                          {section.lectures?.length || 0} lectures
                        </p>
                      </div>
                    </div>
                    {expandedSections.has(section._id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Section Lectures */}
                  {expandedSections.has(section._id) && section.lectures && section.lectures.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {section.lectures.map((lecture, index) => (
                        <div
                          key={lecture._id}
                          className="px-6 py-3 flex items-center justify-between border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {lecture.isPreview ? (
                              <Play className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900">
                                  {index + 1}. {lecture.title}
                                </span>
                                {lecture.isPreview && (
                                  <Badge variant="success" className="text-xs">Free Preview</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {lecture.duration && (
                              <>
                                <Clock className="w-3 h-3" />
                                {formatDuration(lecture.duration)}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ReviewSection
          courseId={id}
          reviews={reviews}
          userReview={reviews.find(r => r.user?._id === user?._id)}
          isEnrolled={isEnrolled}
          onReviewSubmitted={fetchReviews}
        />
      </div>
    </div>
  );
};
