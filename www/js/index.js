/**
 * Sistema de Lembretes com IA
 * JavaScript Principal
 */

// Configuração da API
const API_BASE_URL = 'https://karidsonbessa.com/lembretes/api';

// Estado da aplicação
const state = {
    lembretes: [],
    currentLembrete: null,
    isLoading: false
};

// Elementos do DOM
const elements = {
    // Tabs
    tabChat: document.getElementById('tab-chat'),
    tabLembretes: document.getElementById('tab-lembretes'),
    tabNovo: document.getElementById('tab-novo'),
    navItems: document.querySelectorAll('.nav-item'),
    
    // Chat
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    btnSend: document.getElementById('btn-send'),
    
    // Lembretes
    lembretesList: document.getElementById('lembretes-list'),
    searchInput: document.getElementById('search-input'),
    emptyState: document.getElementById('empty-state'),
    
    // Formulário
    formLembrete: document.getElementById('form-lembrete'),
    lembreteId: document.getElementById('lembrete-id'),
    lembreteTitulo: document.getElementById('lembrete-titulo'),
    lembreteConteudo: document.getElementById('lembrete-conteudo'),
    btnCancelar: document.getElementById('btn-cancelar'),
    btnSalvarText: document.getElementById('btn-salvar-text'),
    btnSalvarLoading: document.getElementById('btn-salvar-loading'),
    
    // Modal
    modal: document.getElementById('modal-view'),
    modalTitulo: document.getElementById('modal-titulo'),
    modalConteudo: document.getElementById('modal-conteudo'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnEdit: document.getElementById('btn-edit'),
    btnDelete: document.getElementById('btn-delete'),
    
    // Outros
    btnSync: document.getElementById('btn-sync'),
    toastContainer: document.getElementById('toast-container'),
    loadingOverlay: document.getElementById('loading-overlay')
};

// =============================================
// Inicialização
// =============================================

document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('DOMContentLoaded', onDOMReady, false);

function onDeviceReady() {
    console.log('Cordova está pronto!');
}

function onDOMReady() {
    initEventListeners();
    carregarLembretes();
}

// =============================================
// Event Listeners
// =============================================

function initEventListeners() {
    // Navegação por abas
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            changeTab(tab);
        });
    });
    
    // Chat
    elements.chatInput.addEventListener('input', autoResize);
    elements.chatInput.addEventListener('input', toggleSendButton);
    elements.chatInput.addEventListener('keydown', handleChatKeydown);
    elements.btnSend.addEventListener('click', enviarPergunta);
    
    // Busca
    elements.searchInput.addEventListener('input', debounce(filtrarLembretes, 300));
    
    // Formulário
    elements.formLembrete.addEventListener('submit', salvarLembrete);
    elements.btnCancelar.addEventListener('click', cancelarEdicao);
    
    // Modal
    elements.btnCloseModal.addEventListener('click', fecharModal);
    elements.btnEdit.addEventListener('click', editarLembrete);
    elements.btnDelete.addEventListener('click', deletarLembrete);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) fecharModal();
    });
    
    // Sincronização
    elements.btnSync.addEventListener('click', sincronizar);
}

// =============================================
// Navegação
// =============================================

function changeTab(tabName) {
    // Atualizar navegação
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    // Atualizar conteúdo
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.id === `tab-${tabName}`);
    });
    
    // Se for a aba de novo lembrete e não estiver editando, limpar formulário
    if (tabName === 'novo' && !elements.lembreteId.value) {
        limparFormulario();
    }
}

// =============================================
// API - Lembretes
// =============================================

async function carregarLembretes() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/lembretes.php`);
        const data = await response.json();
        
        if (data.success) {
            state.lembretes = data.data;
            renderizarLembretes();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao carregar lembretes:', error);
        showToast('Erro ao carregar lembretes', 'error');
        // Mostrar estado vazio em caso de erro
        state.lembretes = [];
        renderizarLembretes();
    } finally {
        showLoading(false);
    }
}

async function salvarLembrete(e) {
    e.preventDefault();
    
    const id = elements.lembreteId.value;
    const titulo = elements.lembreteTitulo.value.trim();
    const conteudo = elements.lembreteConteudo.value.trim();
    
    if (!titulo || !conteudo) {
        showToast('Preencha todos os campos', 'error');
        return;
    }
    
    try {
        elements.btnSalvarText.classList.add('hidden');
        elements.btnSalvarLoading.classList.remove('hidden');
        
        const url = id ? `${API_BASE_URL}/lembretes.php?id=${id}` : `${API_BASE_URL}/lembretes.php`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, conteudo })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(id ? 'Lembrete atualizado!' : 'Lembrete salvo!', 'success');
            limparFormulario();
            await carregarLembretes();
            changeTab('lembretes');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showToast('Erro ao salvar lembrete', 'error');
    } finally {
        elements.btnSalvarText.classList.remove('hidden');
        elements.btnSalvarLoading.classList.add('hidden');
    }
}

async function deletarLembrete() {
    if (!state.currentLembrete) return;
    
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) return;
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/lembretes.php?id=${state.currentLembrete.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Lembrete excluído!', 'success');
            fecharModal();
            await carregarLembretes();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        showToast('Erro ao excluir lembrete', 'error');
    } finally {
        showLoading(false);
    }
}

// =============================================
// API - Chat com IA
// =============================================

async function enviarPergunta() {
    const pergunta = elements.chatInput.value.trim();
    if (!pergunta) return;
    
    // Adicionar mensagem do usuário
    adicionarMensagem(pergunta, 'user');
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';
    toggleSendButton();
    
    // Adicionar indicador de digitação
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>Pensando</p>
        </div>
    `;
    elements.chatMessages.appendChild(typingDiv);
    scrollToBottom();
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta })
        });
        
        const data = await response.json();
        
        // Remover indicador de digitação
        typingDiv.remove();
        
        if (data.success) {
            adicionarMensagem(data.resposta, 'bot');
            
            // Mostrar quais lembretes foram usados
            if (data.lembretes_usados > 0) {
                const lembretesInfo = `📚 Baseado em: ${data.lembretes_titulos.join(', ')}`;
                const infoDiv = document.createElement('div');
                infoDiv.className = 'message bot';
                infoDiv.innerHTML = `
                    <div class="message-avatar">ℹ️</div>
                    <div class="message-content" style="font-size: 12px; color: var(--text-muted);">
                        <p>${lembretesInfo}</p>
                    </div>
                `;
                elements.chatMessages.appendChild(infoDiv);
            }
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        typingDiv.remove();
        console.error('Erro no chat:', error);
        adicionarMensagem('Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.', 'bot');
    }
    
    scrollToBottom();
}

function adicionarMensagem(texto, tipo) {
    const div = document.createElement('div');
    div.className = `message ${tipo}`;
    
    const avatar = tipo === 'user' ? '👤' : '🤖';
    
    // Processar markdown básico
    const htmlContent = processarMarkdown(texto);
    
    div.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${htmlContent}</div>
    `;
    
    elements.chatMessages.appendChild(div);
    scrollToBottom();
}

function processarMarkdown(texto) {
    // Processar blocos de código
    texto = texto.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Processar código inline
    texto = texto.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Processar negrito
    texto = texto.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Processar itálico
    texto = texto.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Processar listas numeradas
    texto = texto.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    texto = texto.replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>');
    
    // Processar listas com marcadores
    texto = texto.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    texto = texto.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        if (!match.includes('<ol>')) {
            return '<ul>' + match + '</ul>';
        }
        return match;
    });
    
    // Processar parágrafos
    texto = texto.split('\n\n').map(p => {
        if (!p.trim()) return '';
        if (p.startsWith('<')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    
    return texto;
}

// =============================================
// Renderização
// =============================================

function renderizarLembretes(lembretes = state.lembretes) {
    elements.lembretesList.innerHTML = '';
    
    if (lembretes.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.lembretesList.classList.add('hidden');
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    elements.lembretesList.classList.remove('hidden');
    
    lembretes.forEach(lembrete => {
        const card = document.createElement('div');
        card.className = 'lembrete-card';
        card.onclick = () => abrirModal(lembrete);
        
        const data = new Date(lembrete.criado_em).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        card.innerHTML = `
            <h3 class="lembrete-titulo">${escapeHtml(lembrete.titulo)}</h3>
            <p class="lembrete-preview">${escapeHtml(lembrete.conteudo)}</p>
            <div class="lembrete-meta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>${data}</span>
            </div>
        `;
        
        elements.lembretesList.appendChild(card);
    });
}

function filtrarLembretes() {
    const termo = elements.searchInput.value.toLowerCase().trim();
    
    if (!termo) {
        renderizarLembretes();
        return;
    }
    
    const filtrados = state.lembretes.filter(l => 
        l.titulo.toLowerCase().includes(termo) || 
        l.conteudo.toLowerCase().includes(termo)
    );
    
    renderizarLembretes(filtrados);
}

// =============================================
// Modal
// =============================================

function abrirModal(lembrete) {
    state.currentLembrete = lembrete;
    elements.modalTitulo.textContent = lembrete.titulo;
    elements.modalConteudo.textContent = lembrete.conteudo;
    elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
    state.currentLembrete = null;
}

function editarLembrete() {
    if (!state.currentLembrete) return;
    
    elements.lembreteId.value = state.currentLembrete.id;
    elements.lembreteTitulo.value = state.currentLembrete.titulo;
    elements.lembreteConteudo.value = state.currentLembrete.conteudo;
    elements.btnSalvarText.textContent = 'Atualizar Lembrete';
    
    fecharModal();
    changeTab('novo');
}

// =============================================
// Formulário
// =============================================

function limparFormulario() {
    elements.formLembrete.reset();
    elements.lembreteId.value = '';
    elements.btnSalvarText.textContent = 'Salvar Lembrete';
}

function cancelarEdicao() {
    limparFormulario();
    changeTab('lembretes');
}

// =============================================
// Utilitários
// =============================================

function showLoading(show) {
    state.isLoading = show;
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

function showToast(message, type = 'info') {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function autoResize() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
}

function toggleSendButton() {
    elements.btnSend.disabled = !elements.chatInput.value.trim();
}

function handleChatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarPergunta();
    }
}

function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function sincronizar() {
    elements.btnSync.classList.add('syncing');
    await carregarLembretes();
    elements.btnSync.classList.remove('syncing');
    showToast('Sincronizado!', 'success');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
