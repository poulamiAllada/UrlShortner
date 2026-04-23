import app from './app.js';
import './src/config/db.js';
import './src/config/cache.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});