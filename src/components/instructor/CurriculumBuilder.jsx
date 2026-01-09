import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, GripVertical, Save, X, Video, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { instructorService } from '../../services/instructorService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

export const CurriculumBuilder = ({ courseId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper function to convert MM:SS or seconds to seconds
  const parseDuration = (duration) => {
    if (!duration) return undefined;
    
    // If it's already a number, return it
    if (typeof duration === 'number') return duration;
    
    // If it's a string like "10:30"
    const str = String(duration).trim();
    if (str.includes(':')) {
      const [minutes, seconds] = str.split(':').map(Number);
      return (minutes * 60) + (seconds || 0);
    }
    
    // If it's just a number as string
    const num = parseInt(str, 10);
    return isNaN(num) ? undefined : num;
  };

  // Section form state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');

  // Lecture form state
  const [addingLectureToSection, setAddingLectureToSection] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    videoUrl: '',
    duration: '',
    isPreview: false,
  });

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getCourseSections(courseId);
      setSections(response.data || []);
    } catch (err) {
      toast.error('Failed to load curriculum');
      setError('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  // Section Handlers
  const handleAddSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    try {
      const response = await instructorService.createSection(courseId, {
        title: sectionTitle,
        order: sections.length + 1,
      });
      setSections([...sections, response.data]);
      setSectionTitle('');
      setIsAddingSection(false);
      toast.success('Section added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create section');
      setError(err.message || 'Failed to create section');
    }
  };

  const handleUpdateSection = async (sectionId) => {
    if (!sectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    try {
      const response = await instructorService.updateSection(sectionId, {
        title: sectionTitle,
      });
      setSections(sections.map(s => s._id === sectionId ? response.data : s));
      setEditingSectionId(null);
      setSectionTitle('');
      toast.success('Section updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update section');
      setError(err.message || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure? This will delete all lectures in this section.')) return;

    try {
      await instructorService.deleteSection(sectionId);
      setSections(sections.filter(s => s._id !== sectionId));
      toast.success('Section deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete section');
      setError(err.message || 'Failed to delete section');
    }
  };

  const startEditSection = (section) => {
    setEditingSectionId(section._id);
    setSectionTitle(section.title);
  };

  const cancelEditSection = () => {
    setEditingSectionId(null);
    setSectionTitle('');
  };

  // Lecture Handlers
  const handleAddLecture = async (sectionId) => {
    if (!lectureForm.title.trim()) {
      toast.error('Please enter a lecture title');
      return;
    }

    try {
      const lectureData = {
        title: lectureForm.title,
        isPreview: lectureForm.isPreview,
      };
      
      // Add optional fields only if provided
      if (lectureForm.videoUrl) {
        lectureData.videoUrl = lectureForm.videoUrl;
      }
      
      if (lectureForm.duration) {
        const durationInSeconds = parseDuration(lectureForm.duration);
        if (durationInSeconds !== undefined) {
          lectureData.duration = durationInSeconds;
        }
      }

      const response = await instructorService.createLecture(sectionId, lectureData);
      
      setSections(sections.map(section => {
        if (section._id === sectionId) {
          return {
            ...section,
            lectures: [...(section.lectures || []), response.data]
          };
        }
        return section;
      }));

      resetLectureForm();
      setAddingLectureToSection(null);
      toast.success('Lecture added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create lecture');
      setError(err.message || 'Failed to create lecture');
    }
  };

  const handleUpdateLecture = async () => {
    if (!lectureForm.title.trim() || !editingLecture) {
      toast.error('Please enter a lecture title');
      return;
    }

    try {
      const lectureData = {
        title: lectureForm.title,
        isPreview: lectureForm.isPreview,
      };
      
      // Add optional fields only if provided
      if (lectureForm.videoUrl) {
        lectureData.videoUrl = lectureForm.videoUrl;
      }
      
      if (lectureForm.duration) {
        const durationInSeconds = parseDuration(lectureForm.duration);
        if (durationInSeconds !== undefined) {
          lectureData.duration = durationInSeconds;
        }
      }

      const response = await instructorService.updateLecture(editingLecture._id, lectureData);
      
      setSections(sections.map(section => ({
        ...section,
        lectures: (section.lectures || []).map(lecture =>
          lecture._id === editingLecture._id ? response.data : lecture
        )
      })));

      resetLectureForm();
      setEditingLecture(null);
      toast.success('Lecture updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update lecture');
      setError(err.message || 'Failed to update lecture');
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    try {
      await instructorService.deleteLecture(lectureId);
      
      setSections(sections.map(section => ({
        ...section,
        lectures: (section.lectures || []).filter(lecture => lecture._id !== lectureId)
      })));

      toast.success('Lecture deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete lecture');
      setError(err.message || 'Failed to delete lecture');
    }
  };

  const startEditLecture = (lecture) => {
    setEditingLecture(lecture);
    setLectureForm({
      title: lecture.title,
      videoUrl: lecture.videoUrl || '',
      duration: lecture.duration || '',
      isPreview: lecture.isPreview || false,
    });
  };

  const resetLectureForm = () => {
    setLectureForm({
      title: '',
      videoUrl: '',
      duration: '',
      isPreview: false,
    });
  };

  const cancelLectureForm = () => {
    resetLectureForm();
    setAddingLectureToSection(null);
    setEditingLecture(null);
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

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <Card key={section._id} className="overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center p-4">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.has(section._id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  {editingSectionId === section._id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={sectionTitle}
                        onChange={(e) => setSectionTitle(e.target.value)}
                        placeholder="Section title"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleUpdateSection(section._id)}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditSection}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Section {index + 1}: {section.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {section.lectures?.length || 0} lectures
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditSection(section)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSection(section._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Content (Lectures) */}
            {expandedSections.has(section._id) && (
              <div className="p-4">
                {/* Lectures List */}
                {section.lectures && section.lectures.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <div
                        key={lecture._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        {editingLecture && editingLecture._id === lecture._id ? (
                          <div className="flex-1 space-y-3">
                            <Input
                              value={lectureForm.title}
                              onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                              placeholder="Lecture title"
                            />
                            <Input
                              value={lectureForm.videoUrl}
                              onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                              placeholder="Video URL"
                              type="url"
                            />
                            <div className="flex items-center gap-4">
                              <Input
                                value={lectureForm.duration}
                                onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                                placeholder="Duration (e.g., 10:30)"
                                className="w-32"
                              />
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={lectureForm.isPreview}
                                  onChange={(e) => setLectureForm({ ...lectureForm, isPreview: e.target.checked })}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span>Free Preview</span>
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleUpdateLecture}>
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelLectureForm}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 flex-1">
                              <Video className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {lectureIndex + 1}. {lecture.title}
                                  </span>
                                  {lecture.isPreview && (
                                    <span className="flex items-center text-xs text-blue-600 gap-1">
                                      <Eye className="w-3 h-3" />
                                      Preview
                                    </span>
                                  )}
                                </div>
                                {lecture.duration && (
                                  <span className="text-sm text-gray-600">{lecture.duration}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditLecture(lecture)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLecture(lecture._id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Lecture Form */}
                {addingLectureToSection === section._id ? (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                    <Input
                      value={lectureForm.title}
                      onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                      placeholder="Lecture title"
                    />
                    <Input
                      value={lectureForm.videoUrl}
                      onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                      placeholder="Video URL"
                      type="url"
                    />
                    <div className="flex items-center gap-4">
                      <Input
                        value={lectureForm.duration}
                        onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                        placeholder="Duration (e.g., 10:30)"
                        className="w-32"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={lectureForm.isPreview}
                          onChange={(e) => setLectureForm({ ...lectureForm, isPreview: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>Free Preview</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddLecture(section._id)}>
                        <Save className="w-4 h-4 mr-1" />
                        Add Lecture
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelLectureForm}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingLectureToSection(section._id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lecture
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Section */}
      {isAddingSection ? (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section title"
              className="flex-1"
            />
            <Button onClick={handleAddSection}>
              <Save className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button variant="outline" onClick={() => { setIsAddingSection(false); setSectionTitle(''); }}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsAddingSection(true)}
          className="w-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Section
        </Button>
      )}

      {sections.length === 0 && !isAddingSection && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No curriculum yet</h3>
          <p className="text-gray-600 mb-4">Start building your course by adding sections and lectures</p>
          <Button onClick={() => setIsAddingSection(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add First Section
          </Button>
        </div>
      )}
    </div>
  );
};
