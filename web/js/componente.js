function toggleConfigSubmenu() {
    const submenu = document.getElementById('config-submenu');
    submenu.classList.toggle('open');
}

function exibirComponentes(componentes) {
    const lista = document.getElementById('lista-componentes');
    if (!lista) {
        console.error('Lista de componentes não encontrada!');
        return;
    }
    
    lista.innerHTML = '';
    
    if (!Array.isArray(componentes) || componentes.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum componente cadastrado.';
        lista.appendChild(li);
        return;
    }
    
    componentes.forEach(componente => {
        const li = document.createElement('li');
        
        const componenteItem = document.createElement('div');
        componenteItem.className = 'componente-item';
        
        const componenteInfo = document.createElement('div');
        componenteInfo.className = 'componente-info';
        
        const nome = componente.nome || componente.Nome || '';
        const ementa = componente.ementa || componente.Ementa || componente.descricao || '';
        const id = componente.id || componente.Id || null;
        
        const h4 = document.createElement('h4');
        h4.textContent = nome;
        
        const p = document.createElement('p');
        p.textContent = ementa;
        
        componenteInfo.appendChild(h4);
        componenteInfo.appendChild(p);
        
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete';
        btnDelete.title = 'Excluir componente';
        btnDelete.innerHTML = '<i class="fas fa-trash"></i> Excluir';
        btnDelete.onclick = () => excluirComponente(id, nome);
        
        componenteItem.appendChild(componenteInfo);
        componenteItem.appendChild(btnDelete);
        li.appendChild(componenteItem);
        
        lista.appendChild(li);
    });
}

async function excluirComponente(id, nome) {
    if (!id) {
        alert('Erro: ID do componente não encontrado.');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o componente "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
        const response = await fetch(`${baseUrl}?recurso=componentes&id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir componente' }));
            throw new Error(errorData.error || 'Erro ao excluir componente');
        }

        const result = await response.json();
        alert('Componente excluído com sucesso!');
        await loadComponentes();
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir componente: ' + error.message);
    }
}

async function loadComponentes() {
    try {
        const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
        const response = await fetch(`${baseUrl}?recurso=componentes`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro ao carregar componentes' }));
            throw new Error(errorData.error || 'Erro ao carregar componentes');
        }
        const componentes = await response.json();
        exibirComponentes(Array.isArray(componentes) ? componentes : []);
    } catch (error) {
        console.error('Erro ao carregar componentes:', error);
        alert('Erro ao carregar componentes: ' + error.message);
    }
}

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
    loadComponentes();

    const form = document.getElementById('componente-form');
    if (!form) {
        console.error('Formulário de componente não encontrado!');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nomeInput = document.getElementById('nome');
        const descricaoInput = document.getElementById('descricao');
        
        if (!nomeInput || !descricaoInput) {
            alert('Campos do formulário não encontrados!');
            return;
        }
        
        const nome = nomeInput.value.trim();
        const descricao = descricaoInput.value.trim();

        if (!nome || !descricao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
            const response = await fetch(`${baseUrl}?recurso=componentes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, ementa: descricao })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro ao cadastrar componente' }));
                throw new Error(errorData.error || 'Erro ao cadastrar componente');
            }

            await loadComponentes();

            alert('Componente cadastrado com sucesso!');
            form.reset();
        } catch (error) {
            console.error('Erro ao cadastrar componente:', error);
            alert('Erro ao cadastrar componente: ' + error.message);
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