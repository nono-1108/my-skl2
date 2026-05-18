# Struktur API Backend Node.js untuk Aplikasi SKL

## Tech Stack
- Node.js + Express.js
- MySQL (sequelize ORM)
- JWT Auth untuk Operator Fakultas
- CORS enabled
- Pagination, search, sort
- Rate limiting, validation (Joi/Zod)

## Install
```
npm init -y
npm i express mysql2 sequelize jsonwebtoken bcryptjs joi cors helmet dotenv multer
npm i -D nodemon
```

## Environment (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=skl_db
JWT_SECRET=your-secret-key
PORT=3000
```

## Routes (app.js)
```js
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth'); // JWT middleware

const app = express();
app.use(cors());
app.use(express.json());

// Public
app.get('/api/skl', getAllSKL); // ?page=1&limit=10&search=nim&sort=nim&dir=asc
app.get('/api/skl/:id', getSKLById);

// Protected (Operator)
app.use(auth);
app.post('/api/skl', createSKL);
app.put('/api/skl/:id', updateSKL);
app.delete('/api/skl/:id', deleteSKL); // soft delete
app.post('/api/skl/:id/print', printSKL); // mark printed

app.listen(process.env.PORT);
```

## Controller Examples
```js
// GET /api/skl
async function getAllSKL(req, res) {
  const { page = 1, limit = 10, search, sort = 'nim', dir = 'ASC' } = req.query;
  const offset = (page - 1) * limit;
  const where = { is_deleted: false };
  if (search) {
    where[Op.or] = [
      { nim: { [Op.like]: `%${search}%` } },
      { nama: { [Op.like]: `%${search}%` } },
      { nomor_surat: { [Op.like]: `%${search}%` } }
    ];
  }
  const { count, rows } = await SKL.findAndCountAll({
    where,
    order: [[sort, dir]],
    limit, offset,
    attributes: { exclude: ['updated_at'] }
  });
  res.json({ data: rows, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } });
}

// POST /api/skl (Validation + Unique NIM check)
async function createSKL(req, res) {
  const { nim, ipk } = req.body;
  // Joi validate
  if (ipk < 0 || ipk > 4) throw new Error('IPK invalid');
  const existing = await SKL.findOne({ where: { nim, is_deleted: false } });
  if (existing) throw new Error('NIM sudah ada');
  const skl = await SKL.create(req.body);
  res.json(skl);
}

// DELETE /api/skl/:id (soft delete if not printed)
async function deleteSKL(req, res) {
  const skl = await SKL.findByPk(req.params.id);
  if (!skl || skl.is_deleted) throw new Error('Not found');
  if (skl.is_printed) throw new Error('Cannot delete printed SKL');
  await skl.update({ is_deleted: true });
  res.json({ message: 'Deleted' });
}
```

## Frontend Integration
- Use Axios for API calls
- Store JWT in localStorage
- Error handling for 401/409 etc.

Deploy: Vercel/Netlify (frontend), Heroku/Render (backend + MySQL).

For production: Add PDF/QR server-side (Puppeteer), email notifications.