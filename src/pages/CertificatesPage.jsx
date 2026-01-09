import { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { certificateService } from '../services/certificateService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatDate } from '../lib/utils';
import { CertificateModal } from '../components/ui/CertificateModal';
import { downloadCertificate } from '../lib/downloadCertificate';

export const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateService.getMyCertificates();
      setCertificates(response.data || []);
    } catch (error) {
      toast.error('Failed to load certificates');
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (certificate) => {
    try {
      setViewLoading(true);
      const response = await certificateService.viewCertificate(certificate.course._id);
      setSelectedCertificate(response.data);
      toast.success('Certificate loaded');
    } catch (error) {
      toast.error('Failed to view certificate');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      setDownloadingId(certificate._id);
      
      // Fetch certificate data
      const response = await certificateService.viewCertificate(certificate.course._id);
      const certData = response.data;
      
      // Format date
      const formattedDate = new Date(certData.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      // Use the utility function to download
      await downloadCertificate({
        userName: certData.userName,
        courseTitle: certData.courseTitle,
        completionDate: formattedDate,
        certificateId: certData.certificateId,
        instructorName: certData.instructorName,
      });
      
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleVerify = (certificateId) => {
    window.open(`/verify-certificate/${certificateId}`, '_blank');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">
            {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'} earned
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-600 mb-6">
                Complete courses to earn certificates and showcase your skills
              </p>
              <Button onClick={() => window.location.href = '/my-learning'}>
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <Award className="w-12 h-12" />
                    <Badge variant="success" className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {certificate.course?.title || 'Course Title'}
                  </h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Certificate ID:</span>
                      <span className="font-mono font-medium text-gray-900">
                        {certificate.certificateId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Issued on:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(certificate.issuedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleView(certificate)}
                      className="w-full"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                    <Button
                      onClick={() => handleDownload(certificate)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                      disabled={downloadingId === certificate._id}
                    >
                      {downloadingId === certificate._id ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleVerify(certificate.certificateId)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Verify Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        {certificates.length > 0 && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    About Your Certificates
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• All certificates are digitally signed and verifiable</li>
                    <li>• Share your certificate ID with employers to verify authenticity</li>
                    <li>• Certificates never expire and can be downloaded anytime</li>
                    <li>• Add certificates to your LinkedIn profile to showcase your skills</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificate Modal */}
        {selectedCertificate && (
          <CertificateModal
            certificateData={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </div>
    </div>
  );
};
