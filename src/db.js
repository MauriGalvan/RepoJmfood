import { openDB } from 'idb';

const DB_NAME = 'rotiseria';
const DB_VERSION = 5;

const defaultProducts = [
  // Hamburguesas - Cheese
  { nombre: 'Hamburguesa Cheese Simple', precio: 11500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Cheese Doble', precio: 12500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Cheese Triple', precio: 15000, categoria: 'Hamburguesas' },
  // Hamburguesas - Bacon and Cheese
  { nombre: 'Hamburguesa Bacon y Cheese Simple', precio: 11500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Bacon y Cheese Doble', precio: 12500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Bacon y Cheese Triple', precio: 15000, categoria: 'Hamburguesas' },
  // Hamburguesas - Clásica
  { nombre: 'Hamburguesa Clásica Simple', precio: 11500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Clásica Doble', precio: 12500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Clásica Triple', precio: 15000, categoria: 'Hamburguesas' },
  // Hamburguesas - Caramel
  { nombre: 'Hamburguesa Caramel Simple', precio: 11500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Caramel Doble', precio: 12500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Caramel Triple', precio: 15000, categoria: 'Hamburguesas' },
  // Hamburguesas - Cuarto De libra
  { nombre: 'Hamburguesa Cuarto De libra Simple', precio: 11500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Cuarto De libra Doble', precio: 12500, categoria: 'Hamburguesas' },
  { nombre: 'Hamburguesa Cuarto De libra Triple', precio: 15000, categoria: 'Hamburguesas' },

  // Sándwich de Milanesa - Porción Chica (15cm con papas)
  { nombre: 'Sándwich Milanesa Chico Simple', precio: 10000, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Chico A Caballo', precio: 11000, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Chico Completo', precio: 12500, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Chico Napolitana', precio: 12500, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Chico Cheddar Bacon y Verde', precio: 12500, categoria: 'Sándwich de Milanesa' },
  // Sándwich de Milanesa - Porción Grande (30cm con papas, comen 2)
  { nombre: 'Sándwich Milanesa Grande Simple', precio: 16000, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Grande A Caballo', precio: 17000, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Grande Completo', precio: 19000, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Grande Napolitana', precio: 19000, categoria: 'Sándwich de Milanesa' },
  { nombre: 'Sándwich Milanesa Grande Cheddar Bacon y Verde', precio: 19000, categoria: 'Sándwich de Milanesa' },

  // Milanesas al Plato - Porción Chica
  { nombre: 'Milanesa al Plato Chica Simple', precio: 11000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Chica A Caballo', precio: 12000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Chica Completo', precio: 13000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Chica Napolitana', precio: 13000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Chica Cheddar Bacon y Verde', precio: 13000, categoria: 'Milanesas al plato' },
  // Milanesas al Plato - Porción Grande
  { nombre: 'Milanesa al Plato Grande Simple', precio: 18000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Grande A Caballo', precio: 19000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Grande Completo', precio: 20000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Grande Napolitana', precio: 20000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Grande Cheddar Bacon y Verde', precio: 20000, categoria: 'Milanesas al plato' },
  { nombre: 'Milanesa al Plato Grande 3 Gustos (Napo-A caballo-Cheddar)', precio: 20000, categoria: 'Milanesas al plato' },

  // Empanadas
  { nombre: 'Empanada de Carne (unidad)', precio: 2500, categoria: 'Empanadas' },
  { nombre: 'Empanada de Carne (1/2 docena)', precio: 14000, categoria: 'Empanadas' },
  { nombre: 'Empanada de Carne (docena)', precio: 26000, categoria: 'Empanadas' },
  { nombre: 'Empanada de Pollo (unidad)', precio: 2500, categoria: 'Empanadas' },
  { nombre: 'Empanada de Pollo (1/2 docena)', precio: 14000, categoria: 'Empanadas' },
  { nombre: 'Empanada de Pollo (docena)', precio: 26000, categoria: 'Empanadas' },
  { nombre: 'Empanada de Jamón y Queso (unidad)', precio: 2500, categoria: 'Empanadas' },
  { nombre: 'Empanada de Jamón y Queso (1/2 docena)', precio: 14000, categoria: 'Empanadas' },
  { nombre: 'Empanada de Jamón y Queso (docena)', precio: 26000, categoria: 'Empanadas' },

  // Pizzas
  { nombre: 'Pizza Muzza', precio: 12000, categoria: 'Pizzas' },
  { nombre: 'Pizza Doble Muzza', precio: 17000, categoria: 'Pizzas' },
  { nombre: 'Pizza Napolitana', precio: 13500, categoria: 'Pizzas' },
  { nombre: 'Pizza Jamón', precio: 13500, categoria: 'Pizzas' },
  { nombre: 'Pizza Huevo', precio: 13500, categoria: 'Pizzas' },
  { nombre: 'Pizza Fugazzeta Caramelizada', precio: 13500, categoria: 'Pizzas' },
  { nombre: 'Pizza Jamón y Morrón', precio: 15000, categoria: 'Pizzas' },
  { nombre: 'Pizza Jamón y Huevo', precio: 15000, categoria: 'Pizzas' },
  { nombre: 'Pizza Napo y Jamón', precio: 16000, categoria: 'Pizzas' },
  { nombre: 'Pizza Calabresa', precio: 16000, categoria: 'Pizzas' },

  // Papas Fritas - Porción Chica
  { nombre: 'Papas Fritas Chicas Solas', precio: 8000, categoria: 'Papas Fritas' },
  { nombre: 'Papas Fritas Chicas A Caballo', precio: 9500, categoria: 'Papas Fritas' },
  { nombre: 'Papas Fritas Chicas Provenzal', precio: 9500, categoria: 'Papas Fritas' },
  { nombre: 'Papas Fritas Chicas Cheddar Bacon y Verdeo', precio: 10500, categoria: 'Papas Fritas' },
  // Papas Fritas - Porción Grande
  { nombre: 'Papas Fritas Grandes Solas', precio: 11000, categoria: 'Papas Fritas' },
  { nombre: 'Papas Fritas Grandes A Caballo', precio: 12000, categoria: 'Papas Fritas' },
  { nombre: 'Papas Fritas Grandes Provenzal', precio: 12000, categoria: 'Papas Fritas' },
  { nombre: 'Papas Fritas Grandes Cheddar Bacon y Verdeo', precio: 13500, categoria: 'Papas Fritas' },
];

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 5 && db.objectStoreNames.contains('usuarios')) {
        db.deleteObjectStore('usuarios');
      }
      if (!db.objectStoreNames.contains('productos')) {
        const productos = db.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
        productos.createIndex('categoria', 'categoria');
      }
      if (!db.objectStoreNames.contains('clientes')) {
        const clientes = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
        clientes.createIndex('nombre', 'nombre');
      }
      if (!db.objectStoreNames.contains('direcciones')) {
        const dir = db.createObjectStore('direcciones', { keyPath: 'id', autoIncrement: true });
        dir.createIndex('clienteId', 'clienteId');
      }
      if (!db.objectStoreNames.contains('ventas')) {
        const ventas = db.createObjectStore('ventas', { keyPath: 'id', autoIncrement: true });
        ventas.createIndex('fecha', 'fecha');
        ventas.createIndex('clienteId', 'clienteId');
      }
      if (!db.objectStoreNames.contains('items_venta')) {
        const items = db.createObjectStore('items_venta', { keyPath: 'id', autoIncrement: true });
        items.createIndex('ventaId', 'ventaId');
      }
      if (!db.objectStoreNames.contains('caja')) {
        const caja = db.createObjectStore('caja', { keyPath: 'id', autoIncrement: true });
        caja.createIndex('fecha', 'fecha');
      }
      if (!db.objectStoreNames.contains('usuarios')) {
        db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

async function seedProductos() {
  const db = await getDB();
  const tx = db.transaction('productos', 'readwrite');
  await tx.store.clear();
  for (const p of defaultProducts) {
    await tx.store.add(p);
  }
  await tx.done;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function seedUsuarios() {
  const db = await getDB();
  const tx = db.transaction('usuarios', 'readwrite');
  await tx.store.clear();
  const hashed = await hashPassword('rotiseria12');
  await tx.store.add({ usuario: 'jmfood', password: hashed, rol: 'admin' });
  await tx.done;
}

export async function login(usuario, password) {
  const db = await getDB();
  const all = await db.getAll('usuarios');
  const hashed = await hashPassword(password);
  const user = all.find(u => u.usuario === usuario && u.password === hashed);
  return user || null;
}

export async function getUsuarios() {
  const db = await getDB();
  return db.getAll('usuarios');
}

export async function addUsuario(usuario, password, rol = 'usuario') {
  const db = await getDB();
  const hashed = await hashPassword(password);
  return db.add('usuarios', { usuario, password: hashed, rol });
}

export async function deleteUsuario(id) {
  const db = await getDB();
  return db.delete('usuarios', id);
}

// Productos
export async function getProductos() {
  const db = await getDB();
  return db.getAll('productos');
}
export async function addProducto(producto) {
  const db = await getDB();
  return db.add('productos', producto);
}
export async function updateProducto(producto) {
  const db = await getDB();
  return db.put('productos', producto);
}
export async function deleteProducto(id) {
  const db = await getDB();
  return db.delete('productos', id);
}

// Clientes
export async function getClientes() {
  const db = await getDB();
  return db.getAll('clientes');
}
export async function addCliente(cliente) {
  const db = await getDB();
  return db.add('clientes', cliente);
}
export async function updateCliente(cliente) {
  const db = await getDB();
  return db.put('clientes', cliente);
}
export async function deleteCliente(id) {
  const db = await getDB();
  return db.delete('clientes', id);
}

// Direcciones
export async function getDirecciones(clienteId) {
  const db = await getDB();
  const all = await db.getAllFromIndex('direcciones', 'clienteId', clienteId);
  return all;
}
export async function getAllDirecciones() {
  const db = await getDB();
  return db.getAll('direcciones');
}
export async function addDireccion(dir) {
  const db = await getDB();
  return db.add('direcciones', dir);
}
export async function deleteDireccion(id) {
  const db = await getDB();
  return db.delete('direcciones', id);
}

// Ventas
export async function addVenta(venta, items) {
  const db = await getDB();
  const tx = db.transaction(['ventas', 'items_venta'], 'readwrite');
  const ventaId = await tx.objectStore('ventas').add(venta);
  for (const item of items) {
    await tx.objectStore('items_venta').add({ ...item, ventaId });
  }
  await tx.done;
  return ventaId;
}
export async function getVentas() {
  const db = await getDB();
  return db.getAll('ventas');
}
export async function getVenta(id) {
  const db = await getDB();
  return db.get('ventas', id);
}
export async function getItemsVenta(ventaId) {
  const db = await getDB();
  return db.getAllFromIndex('items_venta', 'ventaId', ventaId);
}
export async function deleteVenta(id) {
  const db = await getDB();
  const tx = db.transaction(['ventas', 'items_venta'], 'readwrite');
  await tx.objectStore('ventas').delete(id);
  const items = await db.getAllFromIndex('items_venta', 'ventaId', id);
  for (const item of items) {
    await tx.objectStore('items_venta').delete(item.id);
  }
  await tx.done;
}

// Caja
export async function getUltimaCaja() {
  const db = await getDB();
  const all = await db.getAll('caja');
  return all.length > 0 ? all[all.length - 1] : null;
}
export async function abrirCaja(montoInicial) {
  const db = await getDB();
  return db.add('caja', {
    fecha: new Date().toISOString(),
    montoInicial,
    montoFinal: null,
    totalEfectivo: 0,
    totalTransferencia: 0,
    ventas: [],
    abierta: true,
  });
}
export async function cerrarCaja(id, data) {
  const db = await getDB();
  const caja = await db.get('caja', id);
  return db.put('caja', { ...caja, ...data, abierta: false });
}
export async function getCajas() {
  const db = await getDB();
  return db.getAll('caja');
}

// Init
export async function initDB() {
  await seedProductos();
  await seedUsuarios();
}

export { getDB };
