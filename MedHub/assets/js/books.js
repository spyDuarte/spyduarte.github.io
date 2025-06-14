/**
 * MedResources - Books Page JavaScript
 * Handles filtering, searching, and interactions for the books page
 */

// ===== GLOBAL VARIABLES =====
let allBooks = [];
let currentFilter = 'all';
let currentPage = 1;
const booksPerPage = 12;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeBooksPage();
    loadBooksData();
    setupEventListeners();
    
    console.log('Books page initialized');
});

// ===== BOOKS DATA =====
function loadBooksData() {
    // In a real application, this would come from an API
    allBooks = [
        {
            id: 1,
            title: "Gray's Anatomy",
            category: "anatomy",
            rating: 4.8,
            reviews: 1250,
            description: "O atlas de anatomia mais respeitado mundialmente, com ilustrações detalhadas e descrições precisas.",
            image: "../assets/images/books/grays-anatomy.jpg",
            url: "https://www.elsevier.com/books/grays-anatomy/standring/978-0-7020-7707-4",
            author: "Susan Standring",
            edition: "42ª Edição",
            year: 2020,
            pages: 1584,
            isbn: "978-0-7020-7707-4",
            publisher: "Elsevier",
            language: "Português/Inglês",
            level: "Intermediário",
            price: "R$ 890,00",
            tags: ["anatomia", "atlas", "referência", "estudantes", "profissionais"]
        },
        {
            id: 2,
            title: "Netter - Atlas de Anatomia Humana",
            category: "anatomy",
            rating: 4.9,
            reviews: 2100,
            description: "Ilustrações artísticas e didáticas que facilitam o aprendizado da anatomia humana.",
            image: "../assets/images/books/netter-anatomy.jpg",
            url: "https://www.elsevier.com/books/netter-atlas-of-human-anatomy/netter/978-0-323-39321-1",
            author: "Frank H. Netter",
            edition: "7ª Edição",
            year: 2019,
            pages: 672,
            isbn: "978-0-323-39321-1",
            publisher: "Elsevier",
            language: "Português",
            level: "Básico",
            price: "R$ 450,00",
            tags: ["anatomia", "atlas", "ilustrações", "didático", "colorido"]
        },
        {
            id: 3,
            title: "Guyton - Tratado de Fisiologia Médica",
            category: "physiology",
            rating: 4.8,
            reviews: 1800,
            description: "O livro-texto mais utilizado para ensino de fisiologia, com explicações claras e didáticas.",
            image: "../assets/images/books/guyton-physiology.jpg",
            url: "https://www.elsevier.com/books/guyton-and-hall-textbook-of-medical-physiology/hall/978-0-323-59712-8",
            author: "John E. Hall",
            edition: "13ª Edição",
            year: 2021,
            pages: 1152,
            isbn: "978-0-323-59712-8",
            publisher: "Elsevier",
            language: "Português",
            level: "Intermediário",
            price: "R$ 520,00",
            tags: ["fisiologia", "medicina", "textbook", "completo", "didático"]
        },
        {
            id: 4,
            title: "Goodman & Gilman - As Bases Farmacológicas da Terapêutica",
            category: "pharmacology",
            rating: 4.9,
            reviews: 950,
            description: "O texto de referência em farmacologia, cobrindo desde princípios básicos até aplicações clínicas.",
            image: "../assets/images/books/goodman-gilman.jpg",
            url: "https://www.mhprofessional.com/goodman-and-gilmans-the-pharmacological-basis-of-therapeutics-13th-edition-9781259584732-usa",
            author: "Laurence Brunton",
            edition: "13ª Edição",
            year: 2018,
            pages: 1808,
            isbn: "978-1-259-58473-2",
            publisher: "McGraw-Hill",
            language: "Português",
            level: "Avançado",
            price: "R$ 780,00",
            tags: ["farmacologia", "terapêutica", "medicamentos", "clínica", "referência"]
        },
        {
            id: 5,
            title: "Robbins - Patologia Básica",
            category: "pathology",
            rating: 4.8,
            reviews: 1400,
            description: "O livro-texto essencial para compreender os mecanismos das doenças e suas manifestações.",
            image: "../assets/images/books/robbins.jpg",
            url: "https://www.elsevier.com/books/robbins-basic-pathology/kumar/978-0-323-35317-5",
            author: "Vinay Kumar",
            edition: "10ª Edição",
            year: 2018,
            pages: 928,
            isbn: "978-0-323-35317-5",
            publisher: "Elsevier",
            language: "Português",
            level: "Intermediário",
            price: "R$ 450,00",
            tags: ["patologia", "doenças", "mecanismos", "básico", "essencial"]
        },
        {
            id: 6,
            title: "Sobotta - Atlas de Anatomia",
            category: "anatomy",
            rating: 4.7,
            reviews: 680,
            description: "Atlas alemão com fotografias reais e ilustrações de alta qualidade para estudo detalhado.",
            image: "../assets/images/books/sobotta-anatomy.jpg",
            url: "https://www.elsevier.com/books/sobotta-atlas-of-anatomy/paulsen/978-0-7020-6760-0",
            author: "Friedrich Paulsen",
            edition: "24ª Edição",
            year: 2017,
            pages: 800,
            isbn: "978-0-7020-6760-0",
            publisher: "Elsevier",
            language: "Português",
            level: "Avançado",
            price: "R$ 690,00",
            tags: ["anatomia", "atlas", "fotografias", "detalhado", "alemão"]
        }
        // Mais livros podem ser adicionados aqui
    ];
    
    displayBooks(allBooks);
    updateBookCount();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleBookSearch);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    
    // Filter buttons
    document.querySelectorAll('[onclick^="filterBooks"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            filterBooks(category);
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sort-books');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // View toggle
    document.querySelectorAll('.view-toggle button').forEach(button => {
        button.addEventListener('click', handleViewToggle);
    });
}

// ===== FILTERING FUNCTIONS =====
function filterBooks(category) {
    currentFilter = category;
    currentPage = 1;
    
    // Update active filter button
    updateActiveFilterButton(category);
    
    // Filter books
    let filteredBooks;
    if (category === 'all') {
        filteredBooks = allBooks;
    } else {
        filteredBooks = allBooks.filter(book => book.category === category);
    }
    
    // Apply current search if exists
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        filteredBooks = searchBooks(filteredBooks, searchInput.value.trim());
    }
    
    displayBooks(filteredBooks);
    updateBookCount(filteredBooks.length);
    
    // Announce filter change for screen readers
    announce(`Filtrado por ${getCategoryName(category)}. ${filteredBooks.length} livros encontrados.`);
}

function updateActiveFilterButton(activeCategory) {
    // Remove active class from all buttons
    document.querySelectorAll('[onclick^="filterBooks"]').forEach(button => {
        button.classList.remove('btn-secondary');
        button.classList.add('btn-outline');
    });
    
    // Add active class to current button
    document.querySelectorAll('[onclick^="filterBooks"]').forEach(button => {
        const category = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (category === activeCategory) {
            button.classList.remove('btn-outline');
            button.classList.add('btn-secondary');
        }
    });
}

function getCategoryName(category) {
    const categoryNames = {
        'all': 'Todos os livros',
        'anatomy': 'Anatomia',
        'physiology': 'Fisiologia',
        'pharmacology': 'Farmacologia',
        'pathology': 'Patologia'
    };
    return categoryNames[category] || category;
}

// ===== SEARCH FUNCTIONS =====
function handleBookSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    // Reset to first page when searching
    currentPage = 1;
    
    // Get currently filtered books
    let filteredBooks;
    if (currentFilter === 'all') {
        filteredBooks = allBooks;
    } else {
        filteredBooks = allBooks.filter(book => book.category === currentFilter);
    }
    
    // Apply search
    if (query) {
        filteredBooks = searchBooks(filteredBooks, query);
    }
    
    displayBooks(filteredBooks);
    updateBookCount(filteredBooks.length);
    
    // Show no results message if needed
    if (filteredBooks.length === 0 && query) {
        showNoResults(query);
    }
}

function searchBooks(books, query) {
    return books.filter(book => {
        return book.title.toLowerCase().includes(query) ||
               book.description.toLowerCase().includes(query) ||
               book.author.toLowerCase().includes(query) ||
               book.tags.some(tag => tag.toLowerCase().includes(query));
    });
}

function handleSearchKeydown(event) {
    if (event.key === 'Escape') {
        event.target.value = '';
        filterBooks(currentFilter); // Reset to current filter
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayBooks(books) {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;
    
    // Clear current books
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        showNoResults();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = books.slice(startIndex, endIndex);
    
    // Create book cards
    booksToShow.forEach((book, index) => {
        const bookCard = createBookCard(book, startIndex + index);
        booksGrid.appendChild(bookCard);
    });
    
    // Update pagination
    updatePagination(books.length);
    
    // Trigger animations
    animateBookCards();
}

function createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = 'card book-item animate-fadeInUp';
    card.style.animationDelay = `${index * 0.1}s`;
    card.setAttribute('data-category', book.category);
    
    card.innerHTML = `
        <div class="relative">
            <img alt="${book.title}" class="card-image" src="${book.image}" loading="lazy"
                 onerror="this.src='../assets/images/placeholder-book.jpg'">
            <button class="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors favorite-btn"
                    onclick="toggleBookFavorite(${book.id}, this)" 
                    aria-label="Adicionar aos favoritos">
                <svg class="w-5 h-5 text-gray-400 hover:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
            </button>
            <div class="absolute top-2 left-2">
                <span class="bg-${getCategoryColor(book.category)}-100 text-${getCategoryColor(book.category)}-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    ${getCategoryName(book.category)}
                </span>
            </div>
        </div>
        <div class="card-content">
            <h3 class="card-title text-lg font-semibold text-[var(--text-primary)] mb-2">${book.title}</h3>
            <p class="text-sm text-[var(--text-secondary)] mb-2">por ${book.author}</p>
            <p class="card-description text-sm text-[var(--text-secondary)] mb-3 line-clamp-3">${book.description}</p>
            
            <div class="flex items-center gap-2 mb-3">
                <div class="flex items-center">
                    ${generateStarRating(book.rating)}
                    <span class="text-sm text-gray-600 ml-1">(${book.rating})</span>
                </div>
                <span class="text-sm text-gray-500">${book.reviews} avaliações</span>
            </div>
            
            <div class="text-sm text-[var(--text-secondary)] mb-3">
                <div class="flex justify-between">
                    <span>Edição:</span>
                    <span class="font-medium">${book.edition}</span>
                </div>
                <div class="flex justify-between">
                    <span>Páginas:</span>
                    <span class="font-medium">${book.pages}</span>
                </div>
                <div class="flex justify-between">
                    <span>Preço:</span>
                    <span class="font-bold text-[var(--primary-color)]">${book.price}</span>
                </div>
            </div>
            
            <div class="flex gap-2">
                <button onclick="viewBookDetails(${book.id})" 
                        class="btn-outline font-medium py-2 px-4 rounded-md text-sm flex-1 text-center">
                    Ver Detalhes
                </button>
                <a href="${book.url}" target="_blank" 
                   class="btn-primary font-medium py-2 px-4 rounded-md text-sm flex-1 text-center"
                   onclick="trackBookClick(${book.id})">
                    Comprar
                </a>
            </div>
        </div>
    `;
    
    return card;
}

function getCategoryColor(category) {
    const colors = {
        'anatomy': 'blue',
        'physiology': 'green',
        'pharmacology': 'purple',
        'pathology': 'red'
    };
    return colors[category] || 'gray';
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="text-yellow-500">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHtml += '<span class="text-yellow-500">☆</span>';
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<span class="text-gray-300">☆</span>';
    }
    
    return starsHtml;
}

function showNoResults(query = '') {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;
    
    booksGrid.innerHTML = `
        <div class="col-span-full text-center py-16">
            <div class="max-w-md mx-auto">
                <svg class="w-24 h-24 mx-auto mb-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-5.586L4.293 6.707A1 1 0 014 6V4z" clip-rule="evenodd"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    ${query ? `Nenhum resultado para "${query}"` : 'Nenhum livro encontrado'}
                </h3>
                <p class="text-gray-600 mb-6">
                    ${query ? 'Tente usar termos diferentes ou remover alguns filtros.' : 'Ajuste os filtros ou termo de busca.'}
                </p>
                <button onclick="clearFilters()" class="btn-primary px-6 py-2 rounded-md">
                    Limpar Filtros
                </button>
            </div>
        </div>
    `;
}

// ===== PAGINATION =====
function updatePagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    
    // Remove existing pagination
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    if (totalPages <= 1) return;
    
    // Create pagination
    const pagination = document.createElement('div');
    pagination.className = 'pagination flex justify-center items-center gap-2 mt-8';
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = createPaginationButton('Anterior', currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage || 
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = createPaginationButton(i.toString(), i, i === currentPage);
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'px-2 text-gray-500';
            pagination.appendChild(ellipsis);
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = createPaginationButton('Próximo', currentPage + 1);
        pagination.appendChild(nextBtn);
    }
    
    // Add to page
    const booksGrid = document.getElementById('books-grid');
    booksGrid.parentNode.appendChild(pagination);
}

function createPaginationButton(text, page, isActive = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `px-4 py-2 rounded-md font-medium transition-colors ${
        isActive 
            ? 'bg-[var(--primary-color)] text-white' 
            : 'bg-white text-[var(--text-primary)] border border-[var(--border-light)] hover:bg-[var(--secondary-color)]'
    }`;
    button.onclick = () => goToPage(page);
    return button;
}

function goToPage(page) {
    currentPage = page;
    
    // Get current filtered books
    let filteredBooks = getCurrentFilteredBooks();
    
    displayBooks(filteredBooks);
    
    // Scroll to top of books grid
    document.getElementById('books-grid').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function getCurrentFilteredBooks() {
    let filteredBooks;
    if (currentFilter === 'all') {
        filteredBooks = allBooks;
    } else {
        filteredBooks = allBooks.filter(book => book.category === currentFilter);
    }
    
    // Apply search if exists
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        filteredBooks = searchBooks(filteredBooks, searchInput.value.trim());
    }
    
    return filteredBooks;
}

// ===== SORTING =====
function handleSortChange(event) {
    const sortValue = event.target.value;
    let filteredBooks = getCurrentFilteredBooks();
    
    switch (sortValue) {
        case 'title-asc':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'rating-desc':
            filteredBooks.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-asc':
            filteredBooks.sort((a, b) => a.rating - b.rating);
            break;
        case 'price-asc':
            filteredBooks.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            break;
        case 'price-desc':
            filteredBooks.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            break;
        case 'year-desc':
            filteredBooks.sort((a, b) => b.year - a.year);
            break;
        default:
            // Default: no sorting or by relevance
            break;
    }
    
    currentPage = 1;
    displayBooks(filteredBooks);
}

function parsePrice(priceString) {
    return parseFloat(priceString.replace(/[^\d,]/g, '').replace(',', '.'));
}

// ===== UTILITY FUNCTIONS =====
function updateBookCount(count = null) {
    const totalCount = count !== null ? count : allBooks.length;
    const countElement = document.getElementById('book-count');
    
    if (countElement) {
        countElement.textContent = `${totalCount} livro${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`;
    }
}

function animateBookCards() {
    const bookCards = document.querySelectorAll('.book-item');
    bookCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function clearFilters() {
    // Reset search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset filter
    currentFilter = 'all';
    currentPage = 1;
    
    // Reset sort
    const sortSelect = document.getElementById('sort-books');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    // Update display
    filterBooks('all');
    
    announce('Filtros limpos. Mostrando todos os livros.');
}

function initializeBooksPage() {
    // Add sort dropdown if not exists
    addSortDropdown();
    
    // Add view toggle if not exists
    addViewToggle();
    
    // Add book count display
    addBookCountDisplay();
    
    // Initialize favorites
    loadBookFavorites();
}

function addSortDropdown() {
    const headerSection = document.querySelector('section[class*="bg-gradient"]');
    if (!headerSection || document.getElementById('sort-books')) return;
    
    const sortContainer = document.createElement('div');
    sortContainer.className = 'flex justify-center mt-6';
    sortContainer.innerHTML = `
        <select id="sort-books" class="form-input-custom max-w-xs">
            <option value="default">Ordenar por...</option>
            <option value="title-asc">Título (A-Z)</option>
            <option value="title-desc">Título (Z-A)</option>
            <option value="rating-desc">Melhor Avaliação</option>
            <option value="rating-asc">Menor Avaliação</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="year-desc">Mais Recente</option>
        </select>
    `;
    
    headerSection.appendChild(sortContainer);
}

function addViewToggle() {
    // This could be implemented to switch between grid and list views
    console.log('View toggle functionality can be added here');
}

function addBookCountDisplay() {
    const booksSection = document.querySelector('#books-grid').parentNode;
    const countDisplay = document.createElement('div');
    countDisplay.className = 'text-center mb-6';
    countDisplay.innerHTML = `<p id="book-count" class="text-[var(--text-secondary)]"></p>`;
    
    booksSection.insertBefore(countDisplay, document.getElementById('books-grid'));
}

// ===== FAVORITES FUNCTIONALITY =====
function loadBookFavorites() {
    const favorites = JSON.parse(localStorage.getItem('medresources-book-favorites') || '[]');
    
    // Update UI for favorited books
    favorites.forEach(bookId => {
        const favoriteBtn = document.querySelector(`[onclick*="toggleBookFavorite(${bookId}"]`);
        if (favoriteBtn) {
            markAsFavorite(favoriteBtn);
        }
    });
}

function toggleBookFavorite(bookId, button) {
    let favorites = JSON.parse(localStorage.getItem('medresources-book-favorites') || '[]');
    const book = allBooks.find(b => b.id === bookId);
    
    if (!book) return;
    
    if (favorites.includes(bookId)) {
        // Remove from favorites
        favorites = favorites.filter(id => id !== bookId);
        unmarkAsFavorite(button);
        showNotification(`"${book.title}" removido dos favoritos`, 'success');
    } else {
        // Add to favorites
        favorites.push(bookId);
        markAsFavorite(button);
        showNotification(`"${book.title}" adicionado aos favoritos`, 'success');
    }
    
    localStorage.setItem('medresources-book-favorites', JSON.stringify(favorites));
}

function markAsFavorite(button) {
    const icon = button.querySelector('svg');
    icon.classList.remove('text-gray-400');
    icon.classList.add('text-red-500');
    button.setAttribute('aria-label', 'Remover dos favoritos');
}

function unmarkAsFavorite(button) {
    const icon = button.querySelector('svg');
    icon.classList.remove('text-red-500');
    icon.classList.add('text-gray-400');
    button.setAttribute('aria-label', 'Adicionar aos favoritos');
}

// ===== BOOK DETAILS =====
function viewBookDetails(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;
    
    // Create modal with book details
    const modal = createBookDetailsModal(book);
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.remove('hidden');
        modal.classList.add('animate-fadeIn');
        
        // Focus first interactive element
        const firstButton = modal.querySelector('button');
        if (firstButton) {
            firstButton.focus();
        }
    }, 10);
}

function createBookDetailsModal(book) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden';
    modal.onclick = (e) => {
        if (e.target === modal) closeBookDetails(modal);
    };
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-[var(--text-primary)]">${book.title}</h2>
                <button onclick="closeBookDetails(this.closest('.fixed'))" 
                        class="text-gray-500 hover:text-gray-700 p-2"
                        aria-label="Fechar detalhes">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img src="${book.image}" alt="${book.title}" class="w-full rounded-lg shadow-md mb-4"
                             onerror="this.src='../assets/images/placeholder-book.jpg'">
                        
                        <div class="space-y-4">
                            <div class="flex items-center gap-4">
                                ${generateStarRating(book.rating)}
                                <span class="text-lg font-medium">${book.rating}</span>
                                <span class="text-[var(--text-secondary)]">(${book.reviews} avaliações)</span>
                            </div>
                            
                            <div class="text-2xl font-bold text-[var(--primary-color)]">${book.price}</div>
                            
                            <div class="flex gap-3">
                                <a href="${book.url}" target="_blank" 
                                   class="btn-primary px-6 py-3 rounded-lg flex-1 text-center"
                                   onclick="trackBookClick(${book.id})">
                                    Comprar Agora
                                </a>
                                <button onclick="toggleBookFavorite(${book.id}, this)" 
                                        class="btn-outline p-3 rounded-lg">
                                    ♡
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Sobre o Livro</h3>
                            <p class="text-[var(--text-secondary)] leading-relaxed">${book.description}</p>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Detalhes</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="font-medium">Autor:</span>
                                    <span class="text-[var(--text-secondary)]">${book.author}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Edição:</span>
                                    <span class="text-[var(--text-secondary)]">${book.edition}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Ano:</span>
                                    <span class="text-[var(--text-secondary)]">${book.year}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Páginas:</span>
                                    <span class="text-[var(--text-secondary)]">${book.pages}</span>
                                </div>
                                <div>
                                    <span class="font-medium">ISBN:</span>
                                    <span class="text-[var(--text-secondary)]">${book.isbn}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Editora:</span>
                                    <span class="text-[var(--text-secondary)]">${book.publisher}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Idioma:</span>
                                    <span class="text-[var(--text-secondary)]">${book.language}</span>
                                </div>
                                <div>
                                    <span class="font-medium">Nível:</span>
                                    <span class="text-[var(--text-secondary)]">${book.level}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Tags</h3>
                            <div class="flex flex-wrap gap-2">
                                ${book.tags.map(tag => `
                                    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

function closeBookDetails(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('animate-fadeIn');
    
    // Remove modal after animation
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// ===== ANALYTICS =====
function trackBookClick(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (book) {
        console.log(`Book clicked: ${book.title} (ID: ${bookId})`);
        
        // In a real application, send to analytics service
        // gtag('event', 'book_click', {
        //     book_id: bookId,
        //     book_title: book.title,
        //     book_category: book.category
        // });
    }
}

// ===== LOAD MORE FUNCTIONALITY =====
function loadMoreBooks() {
    // In a real application, this would load more books from an API
    showNotification('Funcionalidade em desenvolvimento', 'info');
}

// Make functions available globally
window.filterBooks = filterBooks;
window.viewBookDetails = viewBookDetails;
window.toggleBookFavorite = toggleBookFavorite;
window.closeBookDetails = closeBookDetails;
window.trackBookClick = trackBookClick;
window.loadMoreBooks = loadMoreBooks;