import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, orderBy, setDoc } from 'firebase/firestore';

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

// Initialize Firebase App & Firestore
let firebaseApp: any = null;
let db: any = null;
let firebaseConfig: any = null;

try {
  const possiblePaths = [
    path.join(process.cwd(), 'firebase-applet-config.json'),
    path.join(__dirname, 'firebase-applet-config.json'),
    path.join(__dirname, '..', 'firebase-applet-config.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        firebaseConfig = JSON.parse(fs.readFileSync(p, 'utf-8'));
        break;
      } catch (e) {
        console.warn(`Failed to parse config at ${p}:`, e);
      }
    }
  }

  if (firebaseConfig && firebaseConfig.projectId) {
    firebaseApp = initializeApp(firebaseConfig);
    if (firebaseConfig.firestoreDatabaseId) {
      db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(firebaseApp);
    }
    console.log('Firebase successfully initialized in server.ts with database ID:', firebaseConfig.firestoreDatabaseId || '(default)');
  } else {
    console.warn('firebase-applet-config.json not found or invalid. Falling back to local storage.');
  }
} catch (err) {
  console.error('Error initializing Firebase with dynamic config:', err);
}

// Default initial products using generated asset paths
const DEFAULT_PRODUCTS = [
  {
    id: '1',
    title: 'Tablou Porsche 911 GT3 RS - Hand Drawn',
    category: 'tablou',
    price: 180,
    imageUrl: '/images/car_canvas_print_1783457503595.jpg',
    description: 'Desen tehnic de mână realizat în tuș și cărbune, imprimat pe hârtie premium texturată de 300g/m². Fiecare lucrare vine înrămată individual în ramă neagră metalică de tip Porsche Minimalist.',
    isHidden: false,
    createdAt: new Date('2026-07-01T10:00:00Z').toISOString()
  },
  {
    id: '2',
    title: 'Agendă Premium Porsche Classic - Black Leather',
    category: 'agenda',
    price: 120,
    imageUrl: '/images/agenda_premium_1783457480402.jpg',
    description: 'Agendă exclusivă din piele ecologică neagră fină, cu silueta Porsche 911 embosată discret pe copertă. Hârtie crem calitativă de 90g, perfectă pentru schițe și notițe zilnice.',
    isHidden: false,
    createdAt: new Date('2026-07-02T12:00:00Z').toISOString()
  },
  {
    id: '3',
    title: 'Set Stickere Auto „Minimalist Silhouette”',
    category: 'sticker',
    price: 45,
    imageUrl: '/images/stickers_collection_1783457490627.jpg',
    description: 'Pachet de 5 stickere auto premium fabricate din vinil premium cu finisaj mat rezistent la apă, UV și intemperii extreme. Culoare alb mat și roșu vibrant.',
    isHidden: false,
    createdAt: new Date('2026-07-03T14:30:00Z').toISOString()
  },
  {
    id: '4',
    title: 'Tablou BMW E30 M3 - Technical Pencil Sketch',
    category: 'tablou',
    price: 165,
    imageUrl: '/images/hero_porsche_sketch_1783457469507.jpg',
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

// Define interfaces
interface FirebaseProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  isHidden: boolean;
  createdAt: string;
}

interface FirebaseContact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Fetch products from Firebase or Local Fallback
async function getFirebaseProducts(): Promise<FirebaseProduct[]> {
  if (!db) {
    return readProducts();
  }
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    
    if (snapshot.empty) {
      console.log('Firestore products collection is empty. Seeding default products...');
      const defaultProds = readProducts(); // reads defaults or PRODUCTS_FILE
      for (const prod of defaultProds) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      return defaultProds;
    }

    const items: FirebaseProduct[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      let imageUrl = data.imageUrl || '';
      if (imageUrl.startsWith('/src/assets/images/')) {
        imageUrl = imageUrl.replace('/src/assets/images/', '/images/');
      }
      items.push({
        id: docSnap.id,
        title: data.title || '',
        category: data.category || 'tablou',
        price: Number(data.price) || 0,
        imageUrl: imageUrl,
        description: data.description || '',
        isHidden: !!data.isHidden,
        createdAt: data.createdAt || new Date().toISOString()
      });
    });
    
    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (err) {
    console.error('Error fetching products from Firestore:', err);
    return readProducts(); // fallback
  }
}

async function addFirebaseProduct(productData: Omit<FirebaseProduct, 'id' | 'createdAt' | 'isHidden'>): Promise<FirebaseProduct> {
  const id = Date.now().toString();
  const product: FirebaseProduct = {
    id,
    ...productData,
    isHidden: false,
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'products', id), product);
      console.log('Successfully saved new product to Firestore:', id);
    } catch (err) {
      console.error('Failed to save product to Firestore, saving locally:', err);
      const local = readProducts();
      local.push(product);
      writeProducts(local);
    }
  } else {
    const local = readProducts();
    local.push(product);
    writeProducts(local);
  }

  return product;
}

async function updateFirebaseProduct(id: string, updates: Partial<FirebaseProduct>): Promise<FirebaseProduct | null> {
  if (db) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const cleanUpdates: any = {};
        if (updates.isHidden !== undefined) cleanUpdates.isHidden = updates.isHidden;
        if (updates.title !== undefined) cleanUpdates.title = updates.title;
        if (updates.category !== undefined) cleanUpdates.category = updates.category;
        if (updates.price !== undefined) cleanUpdates.price = updates.price;
        if (updates.imageUrl !== undefined) cleanUpdates.imageUrl = updates.imageUrl;
        if (updates.description !== undefined) cleanUpdates.description = updates.description;
        
        await updateDoc(docRef, cleanUpdates);
        
        const updatedData = { ...currentData, ...cleanUpdates };
        return {
          id,
          title: updatedData.title || '',
          category: updatedData.category || 'tablou',
          price: Number(updatedData.price) || 0,
          imageUrl: updatedData.imageUrl || '',
          description: updatedData.description || '',
          isHidden: !!updatedData.isHidden,
          createdAt: updatedData.createdAt || new Date().toISOString()
        };
      }
    } catch (err) {
      console.error('Failed to update product in Firestore:', err);
    }
  }

  // Local fallback
  const local = readProducts();
  const index = local.findIndex(p => p.id === id);
  if (index === -1) return null;
  local[index] = { ...local[index], ...updates };
  writeProducts(local);
  return local[index];
}

async function deleteFirebaseProduct(id: string): Promise<boolean> {
  let deleted = false;
  if (db) {
    try {
      await deleteDoc(doc(db, 'products', id));
      deleted = true;
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
    }
  }

  // Local sync/fallback
  const local = readProducts();
  const filtered = local.filter(p => p.id !== id);
  if (filtered.length !== local.length) {
    writeProducts(filtered);
    deleted = true;
  }
  return deleted;
}

// Fetch contacts from Firebase or Local Fallback
async function getFirebaseContacts(): Promise<FirebaseContact[]> {
  if (!db) {
    return readContacts();
  }
  try {
    const contactsCol = collection(db, 'contacts');
    const snapshot = await getDocs(contactsCol);

    if (snapshot.empty) {
      console.log('Firestore contacts collection is empty. Seeding default contacts...');
      const defaultConts = readContacts();
      for (const cont of defaultConts) {
        await setDoc(doc(db, 'contacts', cont.id), cont);
      }
      return defaultConts;
    }

    const items: FirebaseContact[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        message: data.message || '',
        createdAt: data.createdAt || new Date().toISOString(),
        isRead: !!data.isRead
      });
    });
    
    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (err) {
    console.error('Error fetching contacts from Firestore:', err);
    return readContacts();
  }
}

async function addFirebaseContact(contactData: Omit<FirebaseContact, 'id' | 'createdAt' | 'isRead'>): Promise<FirebaseContact> {
  const id = `msg-${Date.now()}`;
  const contact: FirebaseContact = {
    id,
    ...contactData,
    createdAt: new Date().toISOString(),
    isRead: false
  };

  if (db) {
    try {
      await setDoc(doc(db, 'contacts', id), contact);
    } catch (err) {
      console.error('Failed to save contact message to Firestore:', err);
      const local = readContacts();
      local.push(contact);
      writeContacts(local);
    }
  } else {
    const local = readContacts();
    local.push(contact);
    writeContacts(local);
  }

  return contact;
}

async function markFirebaseContactAsRead(id: string): Promise<FirebaseContact | null> {
  if (db) {
    try {
      const docRef = doc(db, 'contacts', id);
      await updateDoc(docRef, { isRead: true });
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id,
          name: data.name || '',
          email: data.email || '',
          message: data.message || '',
          createdAt: data.createdAt || new Date().toISOString(),
          isRead: true
        };
      }
    } catch (err) {
      console.error('Failed to mark contact as read in Firestore:', err);
    }
  }

  const local = readContacts();
  const contact = local.find(c => c.id === id);
  if (!contact) return null;
  contact.isRead = true;
  writeContacts(local);
  return contact;
}

async function deleteFirebaseContact(id: string): Promise<boolean> {
  let deleted = false;
  if (db) {
    try {
      await deleteDoc(doc(db, 'contacts', id));
      deleted = true;
    } catch (err) {
      console.error('Failed to delete contact from Firestore:', err);
    }
  }

  const local = readContacts();
  const filtered = local.filter(c => c.id !== id);
  if (filtered.length !== local.length) {
    writeContacts(filtered);
    deleted = true;
  }
  return deleted;
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

// --- API ROUTES (DEFINED ON A ROUTER TO BE MOUNTED FLEXIBLY) ---
const apiRouter = express.Router();

// 1. Admin Login
apiRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === 'admin' && password === 'admin') || (username === 'admin' && password === 'aem_design_2026')) {
    res.json({ token: ADMIN_TOKEN, message: 'Autentificare reușită.' });
  } else {
    res.status(401).json({ error: 'Nume de utilizator sau parolă incorectă.' });
  }
});

// 1.5. Upload Product Image (Admin Only)
apiRouter.post('/upload', requireAdmin, (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Nicio imagine primisă.' });
  }

  // If running on Vercel serverless functions, bypass read-only filesystem by returning base64 directly
  if (process.env.VERCEL === '1') {
    console.log('Vercel serverless environment detected. Returning base64 image data directly.');
    return res.json({ imageUrl: image });
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
    console.warn('Error saving uploaded image to filesystem, falling back to returning base64:', err);
    res.json({ imageUrl: image });
  }
});

// 2. Get Products (Public)
apiRouter.get('/products', async (req, res) => {
  try {
    const products = await getFirebaseProducts();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Eroare la încărcarea catalogului.' });
  }
});

// 3. Add Product (Admin Only)
apiRouter.post('/products', requireAdmin, async (req, res) => {
  const { title, category, price, imageUrl, description } = req.body;
  
  if (!title || !category || price === undefined || !imageUrl) {
    return res.status(400).json({ error: 'Câmpuri obligatorii lipsă (titlu, categorie, preț, imagine).' });
  }

  try {
    const newProduct = await addFirebaseProduct({
      title,
      category,
      price: parseFloat(price),
      imageUrl,
      description: description || ''
    });
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Eroare la salvarea produsului.' });
  }
});

// 4. Update Product (Admin Only - can be toggle visibility/delete/modify)
apiRouter.patch('/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { isHidden, title, category, price, imageUrl, description } = req.body;

  try {
    const updatedProduct = await updateFirebaseProduct(id, {
      isHidden,
      title,
      category,
      price: price !== undefined ? parseFloat(price) : undefined,
      imageUrl,
      description
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
    }
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Eroare la actualizarea produsului.' });
  }
});

// 5. Delete Product (Admin Only)
apiRouter.delete('/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteFirebaseProduct(id);
    if (!success) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
    }
    res.json({ message: 'Produs șters cu succes.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Eroare la ștergerea produsului.' });
  }
});

// 6. Contact Form Submission (Public)
apiRouter.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Toate câmpurile (nume, email, mesaj) sunt obligatorii.' });
  }

  try {
    const newContact = await addFirebaseContact({ name, email, message });
    res.status(201).json({ success: true, message: 'Mesajul a fost trimis cu succes! Te vom contacta în curând.', contact: newContact });
  } catch (err) {
    console.error('Error adding contact message:', err);
    res.status(500).json({ error: 'Eroare la trimiterea mesajului.' });
  }
});

// 7. Get Contact Messages (Admin Only)
apiRouter.get('/contacts', requireAdmin, async (req, res) => {
  try {
    const contacts = await getFirebaseContacts();
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Eroare la obținerea mesajelor.' });
  }
});

// 8. Mark Contact Message as Read (Admin Only)
apiRouter.patch('/contacts/:id/read', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await markFirebaseContactAsRead(id);
    if (!updated) {
      return res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ error: 'Eroare la actualizarea mesajului.' });
  }
});

// 9. Delete Contact Message (Admin Only)
apiRouter.delete('/contacts/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteFirebaseContact(id);
    if (!success) {
      return res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
    }
    res.json({ message: 'Mesaj șters cu succes.' });
  } catch (err) {
    console.error('Error deleting contact message:', err);
    res.status(500).json({ error: 'Eroare la ștergerea mesajului.' });
  }
});

// Mount the api router at both /api and / to be extremely resilient on serverless hosts like Vercel
app.use('/api', apiRouter);
app.use(apiRouter);


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
