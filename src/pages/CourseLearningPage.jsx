import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Clock,
  Award,
  Home,
  Library,
  LayoutDashboard,
  X,
  Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { sectionService } from '../services/sectionService';
import { certificateService } from '../services/certificateService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatDuration } from '../lib/utils';
import { CertificateModal } from '../components/ui/CertificateModal';

export const CourseLearningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details and progress
      const [courseRes, progressRes, sectionsRes] = await Promise.all([
        courseService.getCourse(id),
        progressService.getCourseProgress(id),
        sectionService.getCourseSections(id),
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);
      setSections(sectionsRes.data);
      
      // Set first lecture as current
      if (sectionsRes.data[0]?.lectures[0]) {
        setCurrentLecture(sectionsRes.data[0].lectures[0]);
      }

      // Expand first section by default
      if (sectionsRes.data[0]?._id) {
        setExpandedSections({ [sectionsRes.data[0]._id]: true });
      }

      // Check if certificate exists or needs to be generated
      if (progressRes.data.progressPercentage === 100) {
        checkAndGenerateCertificate();
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkAndGenerateCertificate = async () => {
    try {
      // Try to get existing certificate
      const certResponse = await certificateService.getCertificate(id);
      if (certResponse.data) {
        setHasCertificate(true);
      }
    } catch (error) {
      // Certificate doesn't exist, generate it
      if (error.response?.status === 404) {
        await generateCertificate();
      }
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLectureClick = (lecture) => {
    setCurrentLecture(lecture);
  };

  const handleMarkComplete = async () => {
    if (!currentLecture) return;

    try {
      const response = await progressService.toggleLectureCompletion(id, currentLecture._id);
      
      // Update progress state with response
      setProgress({
        ...progress,
        completedLectures: response.data.progress.completedLectures,
        progressPercentage: response.data.progress.progressPercentage,
      });

      // Move to next lecture only if marking as complete
      const wasCompleted = isLectureCompleted(currentLecture._id);
      if (!wasCompleted) {
        toast.success('Lecture marked as complete!');
        const allLectures = sections.flatMap(s => s.lectures);
        const currentIndex = allLectures.findIndex(l => l._id === currentLecture._id);
        if (currentIndex < allLectures.length - 1) {
          setCurrentLecture(allLectures[currentIndex + 1]);
        }
        
        // Check if course is now 100% complete and generate certificate
        if (response.data.progress.progressPercentage === 100 && !hasCertificate) {
          generateCertificate();
        }
      } else {
        toast.success('Lecture marked as incomplete');
      }
    } catch (error) {
      console.error('Failed to toggle lecture completion:', error);
      toast.error('Failed to update lecture status');
    }
  };

  const generateCertificate = async () => {
    try {
      setGeneratingCertificate(true);
      const response = await certificateService.generateCertificate(id);
      if (response.data) {
        setHasCertificate(true);
        toast.success('🎉 Congratulations! Your certificate has been generated!');
      }
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      // Check if certificate already exists
      if (error.response?.data?.message?.includes('already exists')) {
        setHasCertificate(true);
      } else {
        toast.error('Failed to generate certificate. Please try again.');
      }
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleViewCertificate = async () => {
    try {
      // If no certificate yet, try to generate it first
      if (!hasCertificate) {
        await generateCertificate();
      }
      
      const response = await certificateService.viewCertificate(id);
      setCertificateData(response.data);
      toast.success('Certificate loaded');
    } catch (error) {
      toast.error('Failed to view certificate. Please ensure the course is fully completed.');
    }
  };

  const isLectureCompleted = (lectureId) => {
    return progress?.completedLectures?.some(id => 
      (typeof id === 'string' ? id : id._id) === lectureId
    ) || false;
  };

  if (loading) return <PageLoader />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Small Navigation Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4">
        <Link
          to="/"
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors group relative"
          title="Home"
        >
          <Home className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        </Link>
        <Link
          to="/courses"
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors group relative"
          title="All Courses"
        >
          <Library className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        </Link>
        <Link
          to="/my-learning"
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors group relative"
          title="My Learning"
        >
          <LayoutDashboard className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
        </Link>
        
        <div className="flex-1" />
        
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors group"
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          {showSidebar ? (
            <X className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col bg-gray-900 p-4">
          <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
              {currentLecture ? (
                <iframe
                  src={currentLecture.videoUrl}
                  title={currentLecture.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a lecture to start learning</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info and Controls */}
            <div className="bg-gray-800 text-white p-6 mt-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">
                    {currentLecture?.title || 'No lecture selected'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {course.title}
                  </p>
                </div>
                
                {currentLecture && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isLectureCompleted(currentLecture._id)}
                    variant={isLectureCompleted(currentLecture._id) ? 'secondary' : 'primary'}
                    size="lg"
                  >
                    {isLectureCompleted(currentLecture._id) ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        Mark Complete
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              {progress && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Course Progress</span>
                    <span className="font-semibold">{Math.round(progress.progressPercentage || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progressPercentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {progress.completedCount || 0} of {progress.totalLectures || 0} lectures completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Course Content */}
      {showSidebar && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Course Content</h3>
            <p className="text-sm text-gray-600">
              {sections.length} sections • {sections.reduce((acc, s) => acc + s.lectures.length, 0)} lectures
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {sections.map((section) => (
                <div key={section._id}>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">{section.title}</h4>
                        <p className="text-xs text-gray-500">
                          {section.lectures.length} lectures
                        </p>
                      </div>
                    </div>
                    {expandedSections[section._id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Lectures List */}
                  {expandedSections[section._id] && (
                    <div className="bg-gray-50">
                      {section.lectures.map((lecture) => {
                        const isCompleted = isLectureCompleted(lecture._id);
                        const isCurrent = currentLecture?._id === lecture._id;

                        return (
                          <div
                            key={lecture._id}
                            className={`px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors border-l-4 ${
                              isCurrent ? 'bg-blue-50 border-blue-600' : 'border-transparent'
                            }`}
                          >
                            {/* Checkbox for completion */}
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await progressService.toggleLectureCompletion(id, lecture._id);
                                  setProgress({
                                    ...progress,
                                    completedLectures: response.data.progress.completedLectures,
                                    progressPercentage: response.data.progress.progressPercentage,
                                  });
                                } catch (error) {
                                  console.error('Failed to toggle lecture completion:', error);
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                            />
                            
                            <button
                              onClick={() => handleLectureClick(lecture)}
                              className="flex items-center gap-3 flex-1 text-left min-w-0"
                            >
                              <Play className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className={`text-sm flex-1 truncate ${
                                isCurrent ? 'font-semibold text-blue-600' : 'text-gray-700'
                              }`}>
                                {lecture.title}
                              </span>
                            </button>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatDuration(lecture.duration)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Completion CTA */}
          {progress?.progressPercentage === 100 && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200">
              <div className="flex items-start gap-3">
                <Award className="w-7 h-7 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-1">
                    Congratulations! 🎉
                  </h4>
                  <p className="text-sm text-green-800 mb-3">
                    You've completed this course
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={handleViewCertificate}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                      disabled={generatingCertificate}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {generatingCertificate ? 'Generating...' : 'View Certificate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/certificates')}
                      className="w-full"
                    >
                      Go to Certificates
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {certificateData && (
        <CertificateModal
          certificateData={certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
};
