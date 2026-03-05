import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import userDataManipulationRoutes from './src/routes/uerDatamanipulationRoutes.js';
import passwordResetPageRoute from './src/routes/passowrdResetPageRoute.js';
import passport from 'passport';


const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userDataManipulationRoutes);
app.use('/reset-password', passwordResetPageRoute);

app.get('/', (req, res) => {
    res.send('Welcome to the Bible App API!');
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});



