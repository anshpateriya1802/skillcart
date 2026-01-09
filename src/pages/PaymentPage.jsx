import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { courseService } from '../services/courseService';
import { paymentService } from '../services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentPage = () => {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    fetchCourse();
    loadScript();
  }, [id]);

  const loadScript = async () => {
    const loaded = await loadRazorpayScript();
    setScriptLoaded(loaded);
    if (!loaded) {
      setError('Failed to load payment gateway. Please refresh the page.');
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await courseService.getCourse(id);
      setCourse(response.data);
    } catch (error) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      console.log('Creating order for course ID:', id);
      // Step 1: Create order on backend
      const orderResponse = await paymentService.createOrder(id);
      console.log('Order response:', orderResponse);
      const { orderId, amount, currency, key, courseTitle } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'SkillCerts',
        description: courseTitle,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Payment successful - redirect to success page
            navigate(`/payment/success?orderId=${response.razorpay_order_id}`);
          } catch (error) {
            setError('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          courseId: id,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      setError(error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Secure payment powered by Razorpay</p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Course Details */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/120x80'}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    {course.instructor && (
                      <p className="text-sm text-gray-600">By {course.instructor.name}</p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Course Price</span>
                    <span className="font-medium">{formatCurrency(course.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Platform Fee</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(course.price)}</span>
                  </div>
                </div>

                {/* Payment Method Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Secure Payment</p>
                      <p className="text-blue-800">
                        Your payment is secured with industry-standard encryption. 
                        We support UPI, Cards, Net Banking, and Wallets.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || !scriptLoaded}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay {formatCurrency(course.price)}
                    </>
                  )}
                </Button>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">We accept:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">UPI</Badge>
                    <Badge variant="default">Credit Card</Badge>
                    <Badge variant="default">Debit Card</Badge>
                    <Badge variant="default">Net Banking</Badge>
                    <Badge variant="default">Wallets</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">What you'll get:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Full lifetime access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>All course materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Access on mobile and desktop</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Money-back guarantee</h4>
                    <p className="text-sm text-gray-600">
                      30-day money-back guarantee if you're not satisfied with the course.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
