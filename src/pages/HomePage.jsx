import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { CourseGrid } from '../components/course/CourseGrid';
import { useAuthStore } from '../store/authStore';

export const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseService.getAllCourses({ limit: 8 });
        setFeaturedCourses(response.data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Learn Skills, Earn Certificates
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Join thousands of students learning from expert instructors and get certified.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button size="lg" variant="secondary">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-gray-600 mt-2">Explore our most popular courses</p>
            </div>
            <Link to="/courses">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <CourseGrid courses={featuredCourses} loading={loading} />
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join SkillCerts today and unlock access to thousands of courses.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
