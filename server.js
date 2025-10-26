const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/userRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CSV to JSON Converter API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});