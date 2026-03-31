function toggleConfigSubmenu() {
    const submenu = document.getElementById('config-submenu');
    submenu.classList.toggle('open');
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        alert(text);
        return;
    }
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

function atualizarListaNecessidades(necessidades) {
    const list = document.getElementById('necessidadesList');
    const noItems = document.getElementById('noNecessidades');
    
    if (!list) {
        console.error('Lista de necessidades não encontrada!');
        return;
    }

    list.innerHTML = '';

    if (necessidades.length === 0) {
        if (noItems) noItems.style.display = 'block';
    } else {
        if (noItems) noItems.style.display = 'none';
        necessidades.forEach((necessidade, index) => {
            const li = document.createElement('li');
            const texto = necessidade.descricao || `${necessidade.nome || ''} - ${necessidade.tipo || ''}`;
            li.textContent = `${index + 1}. ${texto}`;
            list.appendChild(li);
        });
    }
}

async function loadNecessidades() {
    try {
        const baseUrl = window.location.origin + '/trabalhointegrado';
        const response = await fetch(`${baseUrl}/index.php?recurso=necessidades`);
        if (!response.ok) throw new Error('Erro ao carregar necessidades');
        const necessidades = await response.json();
        atualizarListaNecessidades(necessidades);
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar necessidades: ' + error.message);
    }
}

// Função para carregar informações do usuário
function carregarUsuario() {
    try {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = 'Não logado';
            }
            return null;
        }
        
        const user = JSON.parse(userStr);
        
        let prefixo = 'Func.';
        if (user.funcao) {
            const funcao = user.funcao.trim().toLowerCase();
            if (funcao === 'docente' || funcao === 'professor') {
                prefixo = 'Prof.';
            } else if (funcao === 'coordenador') {
                prefixo = 'Coord.';
            } else if (funcao === 'napne' || funcao === 'funcionario' || funcao === 'funcionário') {
                prefixo = 'Func.';
            }
        }
        
        const userNameEl = document.getElementById('userName');
        const userSiapeEl = document.getElementById('userSiape');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (userNameEl && user) {
            userNameEl.textContent = `${prefixo} ${user.nome || 'Usuário'}`;
        }
        
        if (userSiapeEl && user) {
            if (user.siape && user.siape.trim() !== '') {
                userSiapeEl.textContent = `SIAPE: ${user.siape}`;
                userSiapeEl.style.display = 'block';
            } else {
                userSiapeEl.style.display = 'none';
            }
        }
        
        if (userAvatarEl && user && user.nome) {
            const nomeParts = user.nome.trim().split(' ');
            if (nomeParts.length >= 2) {
                userAvatarEl.textContent = (nomeParts[0][0] + nomeParts[nomeParts.length - 1][0]).toUpperCase();
            } else if (nomeParts.length === 1) {
                userAvatarEl.textContent = nomeParts[0][0].toUpperCase();
            }
        }
        
        return user;
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = 'Erro ao carregar';
        }
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarUsuario();
    loadNecessidades();

    const form = document.getElementById('necessidadeForm');
    if (!form) {
        console.error('Formulário de necessidade não encontrado!');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nomeInput = document.getElementById('nome');
        const tipoInput = document.getElementById('tipo');
        
        if (!nomeInput || !tipoInput) {
            showMessage('Campos do formulário não encontrados!', 'error');
            return;
        }

        const nome = nomeInput.value.trim();
        const tipo = tipoInput.value.trim();

        if (!nome || !tipo) {
            showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const descricao = `${nome} - ${tipo}`;

        try {
            const baseUrl = window.location.origin + '/trabalhointegrado';
            const response = await fetch(`${baseUrl}/index.php?recurso=necessidades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descricao })
            });
            if (!response.ok) throw new Error('Erro ao cadastrar necessidade');

            form.reset();
            showMessage('Necessidade cadastrada com sucesso!', 'success');
            await loadNecessidades();
        } catch (error) {
            console.error(error);
            showMessage('Erro ao cadastrar necessidade: ' + error.message, 'error');
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('usuario');
                window.location.href = '../html/index.html';
            }
        });
    }
});