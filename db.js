// ─── InvenTrack Pro · IndexedDB Layer ────────────────────────────────────────
const DB_NAME = 'InvenTrackDB';
const DB_VERSION = 1;
const STORE = 'products';

const SEED = [
  {id:1,name:'Wireless Mouse',sku:'WM-001',category:'Electronics',stock:12,reorder:20,price:599,velocity:2.8,lead:7,history:[42,38,35,28,22,18,15,12]},
  {id:2,name:'USB-C Hub 7-Port',sku:'UC-007',category:'Electronics',stock:45,reorder:15,price:1299,velocity:1.5,lead:10,history:[60,58,55,52,50,48,46,45]},
  {id:3,name:'A4 Paper Ream',sku:'PP-A4',category:'Office Supplies',stock:8,reorder:30,price:249,velocity:5.2,lead:3,history:[80,72,65,55,44,32,20,8]},
  {id:4,name:'Ballpoint Pen Box',sku:'BP-100',category:'Office Supplies',stock:0,reorder:50,price:89,velocity:7.1,lead:5,history:[90,80,65,50,35,20,8,0]},
  {id:5,name:'Lab Beaker 500ml',sku:'LB-500',category:'Lab Equipment',stock:60,reorder:10,price:349,velocity:0.8,lead:14,history:[65,64,63,62,62,61,61,60]},
  {id:6,name:'Bubble Wrap Roll',sku:'BW-30',category:'Packaging',stock:25,reorder:20,price:180,velocity:2.2,lead:5,history:[40,38,35,32,30,28,26,25]},
  {id:7,name:'Mineral Water Case',sku:'MW-24',category:'Beverages',stock:18,reorder:24,price:320,velocity:3.5,lead:2,history:[50,46,42,38,33,28,23,18]},
  {id:8,name:'Copper Wire Spool',sku:'CW-10M',category:'Raw Materials',stock:100,reorder:30,price:750,velocity:1.2,lead:21,history:[108,107,105,104,103,102,101,100]},
];

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('sku', 'sku', { unique: true });
      }
    };
    req.onsuccess = async e => {
      _db = e.target.result;
      // Seed if empty
      const all = await dbGetAll();
      if (all.length === 0) {
        for (const p of SEED) await dbAdd(p);
      }
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

function tx(mode = 'readonly') {
  return _db.transaction(STORE, mode).objectStore(STORE);
}

function dbGetAll() {
  return new Promise((res, rej) => {
    const req = tx().getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function dbGet(id) {
  return new Promise((res, rej) => {
    const req = tx().get(id);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function dbAdd(product) {
  return new Promise((res, rej) => {
    const req = tx('readwrite').add(product);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function dbPut(product) {
  return new Promise((res, rej) => {
    const req = tx('readwrite').put(product);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function dbDelete(id) {
  return new Promise((res, rej) => {
    const req = tx('readwrite').delete(id);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

function dbClear() {
  return new Promise((res, rej) => {
    const req = tx('readwrite').clear();
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

async function dbReset() {
  await dbClear();
  for (const p of SEED) await dbAdd(p);
  _db = null;
  await openDB();
}
