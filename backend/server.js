import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import passport from 'passport';

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.send('API is running!');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});



