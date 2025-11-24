// app.js — Carrito interactivo
// Autor: alumno — ejemplo para trabajo práctico

// ----------  Estructuras de datos: Array, Map, Objetos, Clases  ----------

// Prototipo / Clase base (polimorfismo con subclases Product)
class Product {
  constructor(id, name, price, type = 'physical', img = ''){
    this.id = id;
    this.name = name;
    this.price = price;
    this.type = type;
    this.img = img;
  }
  getLabel(){
    return `${this.name} - S/ ${this.price.toFixed(2)}`;
  }
}

// Subclase para producto digital (polimorfismo)
class DigitalProduct extends Product{
  constructor(id, name, price, fileSizeMB, img = ''){
    super(id, name, price, 'digital', img);
    this.fileSizeMB = fileSizeMB;
  }
  getLabel(){
    return `${this.name} (digital ${this.fileSizeMB}MB) - S/ ${this.price.toFixed(2)}`;
  }
}

// Inventario usando Map (clave -> producto)
const inventory = new Map();

// Productos base (arrays + estructura de objetos/clases)
const initialProducts = [
 new Product(1, 'Auriculares BT', 79.90, 'physical', 'img/auricularesbt.jpg'),
  new Product(2, 'Teclado mecánico', 249.00, 'physical', 'img/teclado.jpg'),
  new DigitalProduct(3, 'Ebook: Aprender JS', 20.00, 5, 'img/ebookaprender.jpg'),
  new Product(4, 'Mouse inalámbrico', 89.50, 'physical', 'img/mouse.jpg'),
  new Product(5, 'Monitor Gamer 27"', 999.00, 'physical', 'img/monitorgamer.jpg'),
  new Product(6, 'Laptop ASUS Intel i7', 3500.00, 'physical', 'img/laptopasus.jpg'),
  new Product(7, 'Micrófono Condensador USB', 149.00, 'physical', 'img/microfono.jpg')
];
initialProducts.forEach(p => inventory.set(p.id, p));

// Carrito gestionado como Map<productId, cantidad>
const cart = new Map();

// ------ Referencias del DOM ------
const productsEl = document.getElementById('products');
const cartCountEl = document.getElementById('cartCount');
const viewCartBtn = document.getElementById('viewCartBtn');
const cartPanel = document.getElementById('cartPanel');
const cartListEl = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');

// ----------  Funciones: flecha, recursiva, de orden superior  ----------

// Arrow function
const formatPrice = price => price.toFixed(2);

// Función recursiva — calcula suma total
function sumPricesRecursive(items){
  if(items.length === 0) return 0;
  if(items.length === 1) return items[0];
  const [first, ...rest] = items;
  return first + sumPricesRecursive(rest);
}

// Función de orden superior (filtrado)
function filterInventory(callback){
  return [...inventory.values()].filter(callback);
}

// Función que devuelve función — closures
function increaseBy(percent){
  return function(price){
    return price * (1 + percent/100);
  }
}
const add10Percent = increaseBy(10);


// ------------------ Renderización ------------------
function renderProducts(list){
  productsEl.innerHTML = '';
  list.forEach(product => {

    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" class="product-img">
  <h3>${product.name}</h3>
  <p class="price">S/ ${formatPrice(product.price)}</p>
  <p class="meta">Tipo: ${product.type}</p>
  <div class="controls">
    <button data-id="${product.id}" class="addBtn">Agregar</button>
    <button data-id="${product.id}" class="infoBtn">Info</button>
  </div>
`;

    // Eventos: focus
    card.addEventListener('focus', () => card.style.outline = '2px solid rgba(11,111,183,.2)');
    card.addEventListener('blur', () => card.style.outline = '');

    productsEl.appendChild(card);
  });
}


// ------------------ Carrito ------------------
function addToCart(productId, qty = 1){
  const id = Number(productId);
  const current = cart.get(id) || 0;
  cart.set(id, current + qty);
  updateCartUI();
}

function removeFromCart(productId){
  cart.delete(Number(productId));
  updateCartUI();
}

function clearCart(){
  cart.clear();
  updateCartUI();
}

function calculateTotal(){
  const totals = [...cart.entries()].map(([id, qty]) => {
    const product = inventory.get(id);
    return product ? product.price * qty : 0;
  });

  return sumPricesRecursive(totals);
}

function updateCartUI(){
  const totalItems = [...cart.values()].reduce((a,b)=>a+b,0);
  cartCountEl.textContent = totalItems;

  cartListEl.innerHTML = '';
  cart.forEach((qty, id) => {
    const product = inventory.get(id);

    const li = document.createElement('li');
    li.textContent = `${product.name} x ${qty} — S/ ${formatPrice(product.price * qty)}`;

    const rem = document.createElement('button');
    rem.textContent = 'Eliminar';
    rem.addEventListener('click', () => removeFromCart(id));

    li.appendChild(rem);
    cartListEl.appendChild(li);
  });

  const total = calculateTotal();
  cartTotalEl.textContent = formatPrice(total);
}


// -------- Delegación de eventos para productos --------
productsEl.addEventListener('click', (e) => {
  const add = e.target.closest('.addBtn');
  const info = e.target.closest('.infoBtn');

  if(add){
    addToCart(add.dataset.id);
    showTemporaryMessage('Producto agregado al carrito');
  }

  if(info){
    const p = inventory.get(Number(info.dataset.id));
    alert(p.getLabel());
  }
});


// -------- Botones del carrito --------
viewCartBtn.addEventListener('click', () => {
  cartPanel.hidden = !cartPanel.hidden;
});

clearCartBtn.addEventListener('click', () => {
  if(confirm('¿Vaciar el carrito?')) clearCart();
});

checkoutBtn.addEventListener('click', () => {
  if(cart.size === 0) return alert('El carrito está vacío');

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Procesando...';

  setTimeout(() => {
    alert('Pago simulado: ¡Compra realizada!');
    clearCart();
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Pagar';
  }, 1500);
});


// -------- Buscador --------
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const results = filterInventory(p => p.name.toLowerCase().includes(q));
  renderProducts(results);
});


// -------- Eventos globales --------
window.addEventListener('load', () => {
  renderProducts([...inventory.values()]);
  console.log('Precio con +10% (ejemplo):', add10Percent(100));
});

window.addEventListener('scroll', () => {
  const hdr = document.querySelector('.site-header');
  hdr.style.boxShadow = window.scrollY > 50
    ? '0 6px 20px rgba(0,0,0,.08)'
    : '';
});

// Atajo teclado: presionar "/" activa buscador
window.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if(e.key === '/'){
    if(active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    searchInput.focus();
  }
});


// -------- Mensajes temporales --------
let msgTimer;
function showTemporaryMessage(text){
  const el = document.createElement('div');
  el.textContent = text;
  el.style.position = 'fixed';
  el.style.bottom = '20px';
  el.style.left = '20px';
  el.style.background = '#111';
  el.style.color = '#fff';
  el.style.padding = '.5rem 1rem';
  el.style.borderRadius = '8px';
  document.body.appendChild(el);

  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.remove(), 1200);
}


// -------- Ejemplo de prototipo (forma antigua) --------
function LegacyProduct(id,name,price){
  this.id = id;
  this.name = name;
  this.price = price;
}
LegacyProduct.prototype.info = function(){
  return `${this.name} - S/ ${this.price.toFixed(2)}`;
};
// -------- SLIDER AUTOMÁTICO --------
let slideIndex = 0;

function showSlides() {
  const slides = document.querySelectorAll('.slide');

  slides.forEach(s => s.classList.remove('active'));

  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;

  slides[slideIndex - 1].classList.add('active');

  setTimeout(showSlides, 3000); // 3 segundos
}

// Iniciar slider cuando cargue la página
window.addEventListener('load', showSlides);
// Ejemplo de creación de prototipo
const legacy = new LegacyProduct(99,'Producto legado', 9.9);
// No lo agregamos al inventario directo, solo demostración técnica
