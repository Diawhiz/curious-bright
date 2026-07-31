import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import roomsRouter from './routes/rooms';
import submissionsRouter from './routes/submissions';
import healthRouter from './routes/health';
import reportsRouter from './routes/reports';
import usersRouter from './routes/users';
import searchRouter from './routes/search';
import analyticsRouter from './routes/analytics';
import organizationsRouter from './routes/organizations';
import booksRouter from './routes/books';
import moderatorApplicationsRouter from './routes/moderatorApplications';
import { initTypesense } from './lib/typesense';
import { syncToTypesense } from './jobs/syncSearch';
import { runBookIngestion } from './jobs/ingestBooks';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/health', healthRouter);
app.use('/submissions', submissionsRouter);
app.use('/rooms', roomsRouter);
app.use('/reports', reportsRouter);
app.use('/users', usersRouter);
app.use('/search', searchRouter);
app.use('/analytics', analyticsRouter);
app.use('/organizations', organizationsRouter);
app.use('/books', booksRouter);
app.use('/moderator-applications', moderatorApplicationsRouter);

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  
  // Run initial book ingestion and Typesense search sync
  runBookIngestion().catch((e) => console.error('Initial book ingestion error:', e));
  await initTypesense();
  syncToTypesense();
});
