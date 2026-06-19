import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './api/auth';
import { tenantsRouter } from './api/tenants';
import { professionalsRouter } from './api/professionals';
import { servicesRouter } from './api/services';
import { appointmentsRouter } from './api/appointments';
import { adminRouter } from './api/admin';
import { plansRouter } from './api/plans';
import { reviewsRouter } from './api/reviews';
import { notificationsRouter } from './api/notifications';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/professionals', professionalsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/plans', plansRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);

app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => { res.sendFile(path.join(clientDist, 'index.html')); });

app.use(errorHandler);

app.listen(PORT, () => { console.log(`Server on port ${PORT}`); });
