import { Router } from 'express';
import {
  generateCertificate,
  getMyCertificates,
  getCertificate,
  viewCertificate,
  verifyCertificate,
  verifyCertificateJson,
} from '../controller/certificate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const certificateRouter = Router();

// Public verification endpoints
certificateRouter.get('/verify/:certificateId', verifyCertificate);
certificateRouter.get('/verify/:certificateId/json', verifyCertificateJson);

// Protected routes
certificateRouter.use(authenticate);

certificateRouter.get('/my', getMyCertificates);
certificateRouter.get('/course/:courseId', getCertificate);
certificateRouter.post('/generate/:courseId', generateCertificate);
certificateRouter.get('/view/:courseId', viewCertificate);

export default certificateRouter;
