/* * SMOKINK BH - SISTEMA COMPLETO 2026
 * Senha: pablogay24
 * Instagram: @smoking_bh
 */

const WHATS_APP = "5531989202706";
const ADMIN_PASS = "pablogay24";
let clickCount = 0;

// ESTRUTURA DE ESTOQUE ATUALIZADA (CORRIGIDA)
let inventory = JSON.parse(localStorage.getItem('smokink_inventory')) || [
    { 
        id: 1, 
        brand: "ELFBAR", 
        price: 90.00, // Adicionei a vírgula que faltava aqui
        img: "elfobar.png", // Imagem corrigida para o Elfbar
        sold_total: 250,
        flavors: [
            { name: "Strawberry Ice", stock: 4 },
            { name: "Icy Mint", stock: 2 },
            { name: "Peach Mango Watermelon", stock: 1 },
            { name: "Sakura Grape", stock: 2 },
            { name: "Watermelon Ice", stock: 4 },
            { name: "Pear Watermelon Dragon", stock: 1 }
        ]
    },
    { 
        id: 2, 
        brand: "IGNITE ULTRA SLIM", 
        price: 110.00, 
        img: "ignite.png", // Imagem corrigida para o Ignite
        sold_total: 180,
        flavors: [
            { name: "Strawberry Watermelon Ice", stock: 8 },
            { name: "Watermelon Mix", stock: 9 },
            { name: "Strawberry Banana", stock: 2 },
            { name: "Watermelon Dragon Fruit", stock: 2 },
            { name: "Strawberry", stock: 1 },
            { name: "Watermelon Ice", stock: 1 }
        ]
    }
];

let cart = [];

// --- ACESSO SECRETO (CLIQUE 5X NA LOGO) ---
function secretAccess() {
    clickCount++;
    if (clickCount >= 5) {
        const adminBtn = document.getElementById('nav-admin');
        if(adminBtn) adminBtn.classList.remove('hidden');
        alert("🛡️ PAINEL GESTOR HABILITADO NO MENU!");
        clickCount = 0;
    }
}

// --- FUMAÇA NEON ---
const canvas = document.getElementById('smoke-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let smokeParticles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    class Smoke {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.size = Math.random() * 30 + 20;
            this.opacity = 1;
        }
        update() { this.y -= 0.7; this.opacity -= 0.012; this.size += 0.3; }
        draw() {
            ctx.fillStyle = `rgba(0, 243, 255, ${this.opacity})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    window.addEventListener('mousemove', (e) => { for(let i=0; i<2; i++) smokeParticles.push(new Smoke(e.x, e.y)); });
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        smokeParticles.forEach((p, i) => { p.update(); p.draw(); if(p.opacity<=0) smokeParticles.splice(i,1); });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- INICIALIZAÇÃO ---
function init() {
    let w = 0;
    const progress = document.getElementById('load-progress');
    const preloader = document.getElementById('hacker-preloader');
    
    const interval = setInterval(() => {
        w += 20; 
        if(progress) progress.style.width = w + '%';
        if(w >= 100) { 
            clearInterval(interval); 
            if(preloader) preloader.classList.add('hidden'); 
        }
    }, 100);
    
    renderStore();
    renderAdmin();
    updateStats();
    setupForms();
}

function renderStore() {
    const grid = document.getElementById('products-grid');
    if(!grid) return;
    grid.innerHTML = inventory.map(item => `
        <div class="product-card">
            <img src="${item.img}" class="product-img">
            <div class="card-info">
                <span class="orbitron-text" style="color:var(--cyan); font-weight:900;">${item.brand}</span>
                <select id="flavor-select-${item.id}" class="flavor-select">
                    ${item.flavors.map(f => f.stock > 0 ? `<option value="${f.name}">${f.name} (${f.stock} un)</option>` : `<option disabled>${f.name} (Esgotado)</option>`).join('')}
                </select>
                <span class="card-price">R$ ${item.price.toFixed(2)}</span>
                <button class="add-btn-store" onclick="addToCart(${item.id})">ADICIONAR AO PEDIDO</button>
            </div>
        </div>
    `).join('');
}

function renderAdmin() {
    const list = document.getElementById('admin-inventory-list');
    if(!list) return;
    list.innerHTML = inventory.map(prod => `
        <div style="margin-bottom: 25px; border: 1px solid #222; padding: 15px; border-radius: 4px;">
            <h5 class="orbitron-text" style="color: var(--cyan); margin-bottom:10px;">${prod.brand}</h5>
            ${prod.flavors.map((f, fIdx) => `
                <div style="display:flex; justify-content:space-between; margin: 8px 0; font-size:0.9rem;">
                    <span>${f.name}</span>
                    <div>
                        <input type="number" id="stock-${prod.id}-${fIdx}" value="${f.stock}" style="width:50px; background:#000; color:#fff; border:1px solid #333;">
                        <button onclick="updateStock(${prod.id}, ${fIdx})" style="background:var(--cyan); border:none; padding:2px 8px; cursor:pointer; font-weight:bold;">OK</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

window.updateStock = (prodId, flavorIdx) => {
    const newVal = parseInt(document.getElementById(`stock-${prodId}-${flavorIdx}`).value);
    const prod = inventory.find(p => p.id === prodId);
    const flavor = prod.flavors[flavorIdx];

    if (newVal < flavor.stock) {
        prod.sold_total += (flavor.stock - newVal);
    }

    flavor.stock = newVal;
    localStorage.setItem('smokink_inventory', JSON.stringify(inventory));
    renderStore();
    updateStats();
    alert("Dados Salvos com Sucesso!");
};

function updateStats() {
    const totalStock = document.getElementById('stat-total-stock');
    const totalSold = document.getElementById('stat-total-sold');
    if(totalStock) totalStock.innerText = inventory.reduce((total, p) => total + p.flavors.reduce((st, f) => st + f.stock, 0), 0);
    if(totalSold) totalSold.innerText = inventory.reduce((total, p) => total + p.sold_total, 0);
}

window.switchView = (view) => {
    if (view === 'admin') {
        if (prompt("SENHA DE GESTOR:") !== ADMIN_PASS) return alert("ACESSO NEGADO!");
    }
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const targetView = document.getElementById(`view-${view}`);
    const targetNav = document.getElementById(`nav-${view}`);
    if(targetView) targetView.classList.remove('hidden');
    if(targetNav) targetNav.classList.add('active');
};

window.addToCart = (id) => {
    const prod = inventory.find(p => p.id === id);
    const flavorName = document.getElementById(`flavor-select-${id}`).value;
    cart.push({ brand: prod.brand, flavor: flavorName, price: prod.price });
    updateCartUI();
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.remove('hidden');
};

function updateCartUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-items');
    const total = document.getElementById('cart-total-price');
    if(count) count.innerText = cart.length;
    if(list) {
        list.innerHTML = cart.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid #222; padding-bottom:8px;">
                <div><strong>${item.brand}</strong><br><small style="color:var(--cyan)">${item.flavor}</small></div>
                <div style="text-align:right;">R$ ${item.price.toFixed(2)} <br> <button onclick="cart.splice(${idx},1); updateCartUI()" style="color:red; background:none; border:none; cursor:pointer; font-size:0.7rem;">[REMOVER]</button></div>
            </div>
        `).join('');
    }
    if(total) total.innerText = `R$ ${cart.reduce((a,b)=>a+b.price,0).toFixed(2)}`;
}

window.checkout = () => {
    if(cart.length === 0) return alert("CARRINHO VAZIO!");
    const pedido = cart.map(i => `• ${i.brand} (${i.flavor})`).join('%0A');
    const total = cart.reduce((a,b)=>a+b.price,0);
    window.open(`https://wa.me/${WHATS_APP}?text=🔥 *NOVO PEDIDO SMOKINK BH*%0A%0A${pedido}%0A%0A💰 *TOTAL: R$ ${total.toFixed(2)}*%0A📍 Pampulha e Região.`);
};

function setupForms() {
    const form = document.getElementById('feedback-form');
    if(form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const nome = document.getElementById('form-name').value;
            const tipo = document.getElementById('form-type').value;
            const msg = document.getElementById('form-message').value;
            const texto = `💬 *OUVIDORIA SMOKINK*%0A*Tipo:* ${tipo}%0A*Nome:* ${nome}%0A*Mensagem:* ${msg}`;
            window.open(`https://wa.me/${WHATS_APP}?text=${texto}`);
        };
    }
}

// Fechamento do Carrinho
const closeCart = document.getElementById('close-cart');
const overlay = document.getElementById('cart-overlay');
if(closeCart) {
    closeCart.onclick = () => { 
        document.getElementById('cart-drawer').classList.remove('open'); 
        if(overlay) overlay.classList.add('hidden'); 
    };
}
if(overlay) {
    overlay.onclick = () => {
        document.getElementById('cart-drawer').classList.remove('open'); 
        overlay.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', init);
