import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase limit to support base64 image uploads up to 20MB
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Ensure the data directory and uploads directory exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve static uploaded files BEFORE Vite middleware
app.use('/uploads', express.static(UPLOADS_DIR));

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Default initial products using generated asset paths
const DEFAULT_PRODUCTS = [
  {
    id: '1',
    title: 'Tablou Porsche 911 GT3 RS - Hand Drawn',
    category: 'tablou',
    price: 180,
    imageUrl: '/src/assets/images/car_canvas_print_1783457503595.jpg',
    description: 'Desen tehnic de mână realizat în tuș și cărbune, imprimat pe hârtie premium texturată de 300g/m². Fiecare lucrare vine înrămată individual în ramă neagră metalică de tip Porsche Minimalist.',
    isHidden: false,
    createdAt: new Date('2026-07-01T10:00:00Z').toISOString()
  },
  {
    id: '2',
    title: 'Agendă Premium Porsche Classic - Black Leather',
    category: 'agenda',
    price: 120,
    imageUrl: '/src/assets/images/agenda_premium_1783457480402.jpg',
    description: 'Agendă exclusivă din piele ecologică neagră fină, cu silueta Porsche 911 embosată discret pe copertă. Hârtie crem calitativă de 90g, perfectă pentru schițe și notițe zilnice.',
    isHidden: false,
    createdAt: new Date('2026-07-02T12:00:00Z').toISOString()
  },
  {
    id: '3',
    title: 'Set Stickere Auto „Minimalist Silhouette”',
    category: 'sticker',
    price: 45,
    imageUrl: '/src/assets/images/stickers_collection_1783457490627.jpg',
    description: 'Pachet de 5 stickere auto premium fabricate din vinil premium cu finisaj mat rezistent la apă, UV și intemperii extreme. Culoare alb mat și roșu vibrant.',
    isHidden: false,
    createdAt: new Date('2026-07-03T14:30:00Z').toISOString()
  },
  {
    id: '4',
    title: 'Tablou BMW E30 M3 - Technical Pencil Sketch',
    category: 'tablou',
    price: 165,
    imageUrl: '/src/assets/images/hero_porsche_sketch_1783457469507.jpg',
    description: 'Ilustrație tehnică detaliată a legendarului model sportiv BMW E30 M3, punând în evidență liniile clasice ale caroseriei. Imprimare de înaltă rezoluție pe carton d-art de 250g.',
    isHidden: false,
    createdAt: new Date('2026-07-04T16:00:00Z').toISOString()
  }
];

const DEFAULT_CONTACTS = [
  {
    id: 'msg-1',
    name: 'Andrei Popescu',
    email: 'andrei.p@example.com',
    message: 'Salut! Aș dori să știu dacă puteți desena un model specific, un Audi R8 V10 din 2018, pentru un tablou personalizat de dimensiuni mari (A2). Mulțumesc!',
    createdAt: new Date('2026-07-06T09:15:00Z').toISOString(),
    isRead: false
  },
  {
    id: 'msg-2',
    name: 'Elena Ionescu',
    email: 'elena.ionescu@example.com',
    message: 'Agendele comandate au sosit și sunt absolut spectaculoase! Calitatea finisajului din piele este superbă. Cu siguranță voi mai comanda ca cadou pentru prieteni.',
    createdAt: new Date('2026-07-07T11:20:00Z').toISOString(),
    isRead: true
  }
];

// Helper functions for reading/writing data
function readProducts(): any[] {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
      return DEFAULT_PRODUCTS;
    }
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products file, returning default products:', err);
    return DEFAULT_PRODUCTS;
  }
}

function writeProducts(products: any[]): void {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing products file:', err);
  }
}

function readContacts(): any[] {
  try {
    if (!fs.existsSync(CONTACTS_FILE)) {
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(DEFAULT_CONTACTS, null, 2), 'utf-8');
      return DEFAULT_CONTACTS;
    }
    const data = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading contacts file:', err);
    return DEFAULT_CONTACTS;
  }
}

function writeContacts(contacts: any[]): void {
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing contacts file:', err);
  }
}

// Simple Admin Authentication Middleware
const ADMIN_TOKEN = 'aem-design-secure-token-2026';

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Neautorizat. Sesiune admin invalidă.' });
  }
}

// --- API ROUTES ---

// 1. Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === 'admin' && password === 'admin') || (username === 'admin' && password === 'aem_design_2026')) {
    res.json({ token: ADMIN_TOKEN, message: 'Autentificare reușită.' });
  } else {
    res.status(401).json({ error: 'Nume de utilizator sau parolă incorectă.' });
  }
});

// 1.5. Upload Product Image (Admin Only)
app.post('/api/upload', requireAdmin, (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Nicio imagine primisă.' });
  }

  try {
    // Check if the data is a valid Base64 image
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Format imagine invalid. Trimiteți o imagine validă.' });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const extension = matches[1].split('/')[1] || 'jpg';
    const cleanFilename = `aem-upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, cleanFilename);

    fs.writeFileSync(filePath, imageBuffer);

    // Return the serving URL of the saved file
    const imageUrl = `/uploads/${cleanFilename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error('Error saving uploaded image:', err);
    res.status(500).json({ error: 'Eroare la salvarea fișierului pe server.' });
  }
});

// 2. Get Products (Public)
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// 3. Add Product (Admin Only)
app.post('/api/products', requireAdmin, (req, res) => {
  const { title, category, price, imageUrl, description } = req.body;
  
  if (!title || !category || price === undefined || !imageUrl) {
    return res.status(400).json({ error: 'Câmpuri obligatorii lipsă (titlu, categorie, preț, imagine).' });
  }

  const products = readProducts();
  const newProduct = {
    id: Date.now().toString(),
    title,
    category,
    price: parseFloat(price),
    imageUrl,
    description: description || '',
    isHidden: false,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

// 4. Update Product (Admin Only - can be toggle visibility/delete/modify)
app.patch('/api/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { isHidden, title, category, price, imageUrl, description } = req.body;

  const products = readProducts();
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
  }

  const product = products[productIndex];
  if (isHidden !== undefined) product.isHidden = isHidden;
  if (title !== undefined) product.title = title;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = parseFloat(price);
  if (imageUrl !== undefined) product.imageUrl = imageUrl;
  if (description !== undefined) product.description = description;

  writeProducts(products);
  res.json(product);
});

// 5. Delete Product (Admin Only)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let products = readProducts();
  const originalLength = products.length;
  products = products.filter(p => p.id !== id);

  if (products.length === originalLength) {
    return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
  }

  writeProducts(products);
  res.json({ message: 'Produs șters cu succes.' });
});

// 6. Contact Form Submission (Public)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Toate câmpurile (nume, email, mesaj) sunt obligatorii.' });
  }

  const contacts = readContacts();
  const newContact = {
    id: `msg-${Date.now()}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    isRead: false
  };

  contacts.push(newContact);
  writeContacts(contacts);
  res.status(201).json({ success: true, message: 'Mesajul a fost trimis cu succes! Te vom contacta în curând.' });
});

// 7. Get Contact Messages (Admin Only)
app.get('/api/contacts', requireAdmin, (req, res) => {
  const contacts = readContacts();
  res.json(contacts);
});

// 8. Mark Contact Message as Read (Admin Only)
app.patch('/api/contacts/:id/read', requireAdmin, (req, res) => {
  const { id } = req.params;
  const contacts = readContacts();
  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
  }

  contact.isRead = true;
  writeContacts(contacts);
  res.json(contact);
});

// 9. Delete Contact Message (Admin Only)
app.delete('/api/contacts/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let contacts = readContacts();
  const originalLength = contacts.length;
  contacts = contacts.filter(c => c.id !== id);

  if (contacts.length === originalLength) {
    return res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
  }

  writeContacts(contacts);
  res.json({ message: 'Mesaj șters cu succes.' });
});


// Export the app for serverless platforms like Vercel
export default app;


// --- VITE DEV AND PRODUCTION ASSETS INGESTION ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only run the server directly if not running in a serverless function environment like Vercel
if (!process.env.VERCEL) {
  startServer();
}
