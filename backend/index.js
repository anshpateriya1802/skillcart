import express from 'express';
import { env } from './utils/env.js';
import { connectDB } from './db/dbconnect.js';
import userRouter from './routes/user.routes.js';
import courseRouter from './routes/course.routes.js';
import categoryRouter from './routes/category.routes.js';
import enrollmentRouter from './routes/enrollment.routes.js';
import paymentRouter from './routes/payment.routes.js';
import progressRouter from './routes/progress.routes.js';
import reviewRouter from './routes/review.routes.js';
import sectionRouter from './routes/section.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import lectureRouter from './routes/lecture.routes.js';
import certificateRouter from './routes/certificate.routes.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/user', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/progress', progressRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/sections', sectionRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/lectures', lectureRouter);
app.use('/api/certificates', certificateRouter);


const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${env.NODE_ENV}`);
});
