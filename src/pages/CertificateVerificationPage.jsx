import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  CheckCircle,
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { CertificateTemplate } from "../components/ui/CertificateTemplate";
import { certificateService } from "../services/certificateService";

export const CertificateVerificationPage = () => {
  const { certificateId: urlCertificateId } = useParams();
  const [searchParams] = useSearchParams();

  const [certificateId, setCertificateId] = useState(
    urlCertificateId || searchParams.get("id") || ""
  );
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (urlCertificateId) {
      verifyCertificate(urlCertificateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCertificateId]);

  const verifyCertificate = async (id) => {
    const certId = (id || certificateId).trim();

    if (!certId) {
      setError("Please enter a certificate ID");
      setCertificate(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);
    setSearched(true);

    try {
      const res = await certificateService.verifyCertificate(certId);

      if (res.success && res.certificate) {
        setCertificate(res.certificate);
      } else {
        setError("Certificate not found or invalid");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Certificate not found or invalid"
      );
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-slate-50 px-2 py-8 sm:px-4 sm:py-12">
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
                <ShieldCheck className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-indigo-600 mb-2 sm:mb-3" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Certificate Verification
                </h1>
                <p className="text-slate-600 mt-1 sm:mt-2 text-base sm:text-lg">
                    Verify SkillCerts certificates instantly
                </p>
            </div>

            {/* Search */}
            <Card className="shadow-md">
                <CardContent className="p-4 sm:p-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            verifyCertificate();
                        }}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="text"
                            value={certificateId}
                            onChange={(e) => setCertificateId(e.target.value)}
                            placeholder="SC-934B47CAE8B6"
                            disabled={loading}
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border rounded-lg font-mono text-base sm:text-lg focus:ring-2 focus:ring-indigo-500"
                        />

                        <Button disabled={loading} className="px-4 sm:px-5 w-full sm:w-auto">
                            {loading ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Verify
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Result */}
            {searched && (
                <div className="mt-6 sm:mt-8">
                    {loading ? (
                        <div className="flex justify-center py-8 sm:py-10">
                            <Spinner size="lg" />
                        </div>
                    ) : certificate ? (
                        <div className="overflow-x-auto">
                            <CertificateTemplate
                                userName={certificate?.user?.name}
                                courseTitle={certificate?.course?.title}
                                instructorName={certificate?.course?.instructor?.name}
                                certificateId={certificate?.certificateId}
                                completionDate={
                                    certificate?.completionDate ||
                                    (certificate?.issuedAt ? new Date(certificate.issuedAt).toDateString() : "")
                                }
                            />
                        </div>
                    ) : (
                        <Card className="border border-red-400 bg-red-50">
                            <CardContent className="p-4 sm:p-6 text-center">
                                <XCircle className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-red-600 mb-1 sm:mb-2" />
                                <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    </div>
);
};
