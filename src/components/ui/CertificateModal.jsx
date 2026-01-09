import { X, Download, Award } from 'lucide-react';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CertificateModal = ({ certificateData, onClose }) => {
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!certificateData) return null;

  const { userName, courseTitle, completionDate, certificateId, instructorName } = certificateData;

  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Generate filename
      const sanitizedCourseName = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `skillcert_certificate_${sanitizedUserName}_${sanitizedCourseName}.pdf`;
      
      // Capture the certificate as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Convert to PDF (landscape A4)
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-auto" onClick={onClose}>
      <div className="relative w-full max-w-6xl my-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close and Download buttons */}
        <div className="absolute -top-12 sm:-top-14 right-0 flex gap-2 z-10">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-lg transition flex items-center gap-2 text-sm sm:text-base"
            title="Download as PDF"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Download PDF</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-900 p-2 rounded-lg shadow-lg transition"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Certificate - Landscape Orientation */}
        <div 
          ref={certificateRef}
          className="certificate-container bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-3 sm:p-6 rounded-lg"
        >
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-10 lg:p-16 relative aspect-[1.414/1]">
            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-l-4 border-t-4 border-blue-600 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-r-4 border-t-4 border-blue-600 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 sm:w-16 h-12 sm:h-16 border-l-4 border-b-4 border-blue-600 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 sm:w-16 h-12 sm:h-16 border-r-4 border-b-4 border-blue-600 rounded-br-lg" />

            {/* Inner border */}
            <div className="absolute top-6 left-6 right-6 bottom-6 sm:top-8 sm:left-8 sm:right-8 sm:bottom-8 border-2 border-purple-200 rounded-md pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 text-center h-full flex flex-col justify-between">
              {/* Logo/Header */}
              <div className="mb-2 sm:mb-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Award className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600" />
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wider uppercase">
                    SkillCert
                  </h1>
                  <Award className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 tracking-widest">ONLINE LEARNING PLATFORM</p>
              </div>

              {/* Certificate Title */}
              <div className="mb-3 sm:mb-6">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-800 tracking-wider uppercase mb-1 sm:mb-2">
                  Certificate
                </h2>
                <p className="text-base sm:text-xl lg:text-2xl text-gray-600 tracking-wider uppercase">
                  of Completion
                </p>
              </div>

              {/* Recipient */}
              <div className="mb-3 sm:mb-6 flex-1 flex flex-col justify-center">
                <p className="text-xs sm:text-base lg:text-lg text-gray-600 mb-1 sm:mb-2 italic">This certifies that</p>
                <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 border-b-2 border-blue-600 inline-block pb-1 sm:pb-2 px-4 sm:px-8 mx-auto">
                  {userName}
                </h3>
                <p className="text-xs sm:text-base lg:text-lg text-gray-600 mb-1 sm:mb-2 italic">has successfully completed the course</p>
                <h4 className="text-lg sm:text-2xl lg:text-3xl font-semibold text-gray-800 px-4 sm:px-8">
                  {courseTitle}
                </h4>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 pt-4 sm:pt-6 border-t-2 border-gray-200 text-xs sm:text-sm lg:text-base">
                <div className="text-left">
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{formattedDate}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-500 mb-1">Certificate ID</p>
                  <p className="font-mono font-semibold text-gray-900 text-xs sm:text-sm break-all">{certificateId}</p>
                </div>

                <div className="text-right">
                  <p className="text-gray-500 mb-1">Instructor</p>
                  <div className="border-t-2 border-gray-800 pt-1 inline-block">
                    <p className="font-semibold text-gray-900">{instructorName}</p>
                  </div>
                </div>
              </div>

              {/* Verification Notice */}
              <div className="mt-2 sm:mt-4 text-xs text-gray-400">
                <p>Verify at: skillcert.com/verify/{certificateId}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
