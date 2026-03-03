import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import userDataManipulationRoutes from './src/routes/uerDatamanipulationRoutes.js'
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userDataManipulationRoutes);

const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.send('API is running!!!');
});

// Allow Express to serve the HTML file
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/reset-password.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});



