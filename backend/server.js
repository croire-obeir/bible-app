import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import userDataManipulationRoutes from './src/routes/uerDatamanipulationRoutes.js';
import passwordResetPageRoute from './src/routes/passowrdResetPageRoute.js';
import refreshTokenauthRoute from './src/routes/refreshTokenAuthRoute.js';
import youtubeRoutes from './src/routes/youtubeRoutes.js';
import passport from 'passport';
import mediaClassesRoutes from './src/routes/mediaClassesRoutes.js';
import mediaByClassRoutes from './src/routes/mediaByClassRoutes.js';
import newMediaRoutes from './src/routes/newMediaRoutes.js';
import appInstallationsRoutes from './src/routes/appInstallationsRoutes.js';
import dailyVerseRoutes from './src/routes/dailyVerseRoutes.js';




const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userDataManipulationRoutes);
app.use('/reset-password', passwordResetPageRoute);
app.use('/api/refresh-token', refreshTokenauthRoute);
app.use('/api/sync', youtubeRoutes);
app.use('/auth', youtubeRoutes);
app.use('/api/media-classes', mediaClassesRoutes);
app.use('/api/media', mediaByClassRoutes);
app.use('/api/new-media', newMediaRoutes);
app.use('/api/app-installations', appInstallationsRoutes);
app.use('/api/daily-verse', dailyVerseRoutes);

app.get('/', (req, res) => {
    res.send('Bienvenue a L\'API Croire et Obeir API!, hahahahahaha');
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});


