// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = [];
        //this.deliveryFee = 5.00;//
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.updateCartDisplay();
    }

    addItem(itemData) {
        const existingItem = this.items.find(item => item.id === itemData.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...itemData,
                quantity: 1
            });
        }
        
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showToast(`${itemData.name} adicionado ao carrinho!`);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showToast('Item removido do carrinho');
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCartToStorage();
                this.updateCartDisplay();
            }
        }
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotal() {
        return this.getSubtotal() //+ this.deliveryFee// ;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    saveCartToStorage() {
        localStorage.setItem('gustoCart', JSON.stringify(this.items));
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('gustoCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    updateCartDisplay() {
        this.updateCartBadges();
        this.updateCartSummary();
        this.renderCartItems();
    }

    updateCartBadges() {
        const totalItems = this.getTotalItems();
        
        // Update mobile cart badge
        const cartBadge = document.getElementById('cart-badge');
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }

        // Update desktop cart summary
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.querySelector('.cart-total');
        if (cartCount && cartTotal) {
            cartCount.textContent = totalItems;
            cartTotal.textContent = this.formatPrice(this.getTotal());
        }
    }

    updateCartSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const cartSummarySection = document.getElementById('cart-summary-section');

        if (subtotalElement && totalElement) {
            subtotalElement.textContent = this.formatPrice(this.getSubtotal());
            totalElement.textContent = this.formatPrice(this.getTotal());
            
            if (this.items.length > 0) {
                cartSummarySection.style.display = 'block';
            } else {
                cartSummarySection.style.display = 'none';
            }
        }
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <span class="empty-cart-icon">🛒</span>
                    <h3>Seu carrinho está vazio</h3>
                    <p>Adicione itens do cardápio para começar seu pedido</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
            
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${this.formatPrice(item.price)} cada</div>
                </div>

                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-item-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-item-id="${item.id}">+</button>
                    <button class="remove-item-btn" data-item-id="${item.id}">Remover</button>

                </div>
            </div>
        `).join('');

        // Add event listeners for quantity controls
        this.attachCartEventListeners();
    }

    attachCartEventListeners() {
        // Quantity increase buttons
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const item = this.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });

        // Quantity decrease buttons
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const item = this.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                this.removeItem(itemId);
            });
        });
    }

    formatPrice(price) {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    checkout() {
        if (this.items.length === 0) {
            this.showToast('Adicione itens ao carrinho antes de finalizar o pedido');
            return;
        }

        // Simulate checkout process
        this.showToast('Pedido finalizado');
        
        // Clear cart after successful checkout
        setTimeout(() => {
            this.items = [];
            this.saveCartToStorage();
            this.updateCartDisplay();
        }, 2000);
    }
}

// Main App Class
class FoodDeliveryApp {
    constructor() {
        this.cart = new ShoppingCart();
        this.currentPage = 'menu';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMenuData();
        this.toggleDesktopHeader();
        window.addEventListener('resize', () => this.toggleDesktopHeader());
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Menu tabs
        this.setupMenuTabs();
        
        // Search functionality
        this.setupSearch();
        
        // Add to cart buttons
        this.setupAddToCartButtons();
        
        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.cart.checkout());
        }

        // Back to menu button
        const backToMenuBtn = document.querySelector('.back-to-menu-btn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => this.showPage('menu'));
        }

        // Desktop cart summary click
        const cartSummary = document.querySelector('.cart-summary');
        if (cartSummary) {
            cartSummary.addEventListener('click', () => this.showPage('orders'));
        }
    }

    setupNavigation() {
        // Bottom navigation
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Desktop navigation
        const desktopNavLinks = document.querySelectorAll('.desktop-nav a[data-page]');
        desktopNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }

        // Update navigation active states
        this.updateNavigationStates(pageName);
    }

    updateNavigationStates(activePage) {
        // Update bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === activePage) {
                item.classList.add('active');
            }
        });

        // Update desktop navigation
        document.querySelectorAll('.desktop-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === activePage) {
                link.classList.add('active');
            }
        });
    }

    setupMenuTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get tab key and render menu
                const tabKey = button.getAttribute('data-tab');
                this.renderMenu(tabKey);
                
                // Smooth scroll to menu content on mobile
                if (window.innerWidth < 768) {
                    document.querySelector('.menu-content').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        let searchTimeout;
        
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = searchInput.value.toLowerCase();
                const menuItems = document.querySelectorAll('.menu-item');
                
                menuItems.forEach(item => {
                    const itemName = item.querySelector('.item-name').textContent.toLowerCase();
                    const itemDescription = item.querySelector('.item-description').textContent.toLowerCase();
                    
                    if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                        item.style.display = 'flex';
                        item.style.animation = 'fadeIn 0.3s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }, 300);
        });
    }

    setupAddToCartButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const menuItem = e.target.closest('.menu-item');
                const itemData = this.extractItemData(menuItem);
                this.cart.addItem(itemData);
            }
        });
    }

    extractItemData(menuItem) {
        const id = menuItem.getAttribute('data-item-id');
        const name = menuItem.querySelector('.item-name').textContent;
        const description = menuItem.querySelector('.item-description').textContent;
        const priceText = menuItem.querySelector('.item-price').getAttribute('data-price');
        const price = parseFloat(priceText);
        const image = menuItem.querySelector('.item-image img').src;

        return { id, name, description, price, image };
    }

    toggleDesktopHeader() {
        const desktopHeader = document.querySelector('.desktop-header');
        if (window.innerWidth >= 768) {
            desktopHeader.style.display = 'flex';
        } else {
            desktopHeader.style.display = 'none';
        }
    }

    setupMenuData() {
        this.menuData = {
            entradas: {
               
                items: [
                    {
                        id: '1',
                        name: 'Camarão empanado com fritas',
                        description: '10 Camarões deliciosos empanados, acompanhados de uma porção generosa de batata frita crocante. Servido com molho especial da casa.',
                        price: 48.50,
                        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
                    },
                    {
                        id: '2',
                        name: 'Calabresa acebolada com batata frita',
                        description: 'Deliciosa calabresa acebolada acompanhada de batata frita crocante. Um clássico da culinária brasileira preparado com ingredientes frescos.',
                        price: 28.50,
                        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop'
                    },
                    {
                        id: '3',
                        name: 'Iscas de Filé mignon com Batata Frita',
                        description: '200g de filé mignon acebolado acompanhado de 250g de batata frita. Carne macia e suculenta preparada no ponto ideal.',
                        price: 48.50,
                        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=200&fit=crop'
                    },
                    {
                        id: '4',
                        name: 'Porção de Batata Frita',
                        description: 'Porção generosa de batata frita crocante por fora e macia por dentro. Perfeita para compartilhar ou como acompanhamento.',
                        price: 18.90,
                        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop'
                    }
                ]
            },
            belem: {
              
                items: [
                    {
                        id: '5',
                        name: 'Combo Açaí Duplo',
                        description: 'Dois açaís de 500ml com granola, banana e leite condensado. Refrescante e nutritivo, perfeito para compartilhar.',
                        price: 35.90,
                        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop'
                    },
                    {
                        id: '6',
                        name: 'Dupla de Pastéis Paraenses',
                        description: 'Dois pastéis tradicionais paraenses com queijo coalho e carne de sol. Receita autêntica da região Norte.',
                        price: 22.50,
                        image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=300&h=200&fit=crop'
                    },
                    {
                        id: '7',
                        name: 'Combo Tapioca Dupla',
                        description: 'Duas tapiocas recheadas com queijo e presunto. Massa crocante e recheio generoso.',
                        price: 26.90,
                        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop'
                    },
                    {
                        id: '8',
                        name: 'Dupla de Coxinhas Gigantes',
                        description: 'Duas coxinhas grandes recheadas com frango desfiado temperado. Crocantes por fora, macias por dentro.',
                        price: 19.90,
                        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
                    }
                ]
            },
            pasteis: {
               
                items: [
                    {
                        id: '9',
                        name: 'Pastel de Camarão',
                        description: 'Pastel crocante recheado com camarões frescos e temperos especiais. Uma explosão de sabores do mar.',
                        price: 18.90,
                        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
                    },
                    {
                        id: '10',
                        name: 'Pastel de Queijo',
                        description: 'Tradicional pastel de queijo derretido, crocante e saboroso. Clássico que nunca sai de moda.',
                        price: 12.50,
                        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop'
                    },
                    {
                        id: '11',
                        name: 'Pastel de Carne',
                        description: 'Pastel recheado com carne moída temperada e cebola. Receita tradicional da família.',
                        price: 15.90,
                        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop'
                    },
                    {
                        id: '12',
                        name: 'Pastel de Frango com Catupiry',
                        description: 'Delicioso pastel recheado com frango desfiado e catupiry cremoso. Combinação irresistível.',
                        price: 16.90,
                        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
                    },
                    {
                        id: '13',
                        name: 'Pastel de Pizza',
                        description: 'Pastel especial com recheio de mussarela, presunto e molho de tomate. O melhor dos dois mundos.',
                        price: 17.50,
                        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop'
                    },
                    {
                        id: '14',
                        name: 'Pastel Doce de Banana com Canela',
                        description: 'Pastel doce recheado com banana caramelizada e canela. Perfeito para sobremesa.',
                        price: 14.90,
                        image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=300&h=200&fit=crop'
                    }
                ]
            }
        };
    }

    renderMenu(tabKey) {
        const data = this.menuData[tabKey];
        const sectionTitle = document.querySelector('.section-title');
        const menuItems = document.querySelector('.menu-items');
        
        sectionTitle.textContent = data.title;
        
        menuItems.innerHTML = data.items.map((item, index) => `
            <div class="menu-item" data-item-id="${item.id}" style="animation-delay: ${(index + 1) * 0.1}s">
            <div class="top-info">
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    <span class="item-price" data-price="${item.price}">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                </div>
                <button class="add-to-cart-btn">Adicionar</button>
            </div>
        `).join('');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Food delivery app with shopping cart loaded!');
    new FoodDeliveryApp();
});