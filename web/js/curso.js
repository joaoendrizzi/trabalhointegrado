function toggleConfigSubmenu() {
    const submenu = document.getElementById('config-submenu');
    submenu.classList.toggle('open');
}

function exibirCursos(cursos) {
    const lista = document.getElementById('lista-cursos');
    if (!lista) {
        console.error('Lista de cursos não encontrada!');
        return;
    }
    
    lista.innerHTML = '';
    cursos.forEach(curso => {
        console.log('Processando curso:', curso, 'Tipo:', curso.tipo, 'Tipo é string?', typeof curso.tipo);
        const li = document.createElement('li');
        
        const cursoItem = document.createElement('div');
        cursoItem.className = 'curso-item';
        
        const cursoInfo = document.createElement('div');
        cursoInfo.className = 'curso-info';
        
        const h4 = document.createElement('h4');
        h4.textContent = curso.nome;
        
        const p = document.createElement('p');
        let tipoExibido = 'Não informado';
        if (curso.tipo !== null && curso.tipo !== undefined && String(curso.tipo).trim() !== '') {
            tipoExibido = String(curso.tipo).trim();
        }
        p.innerHTML = `<strong>Tipo:</strong> ${tipoExibido}`;
        
        cursoInfo.appendChild(h4);
        cursoInfo.appendChild(p);
        
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete';
        btnDelete.title = 'Excluir curso';
        btnDelete.innerHTML = '<i class="fas fa-trash"></i> Excluir';
        btnDelete.onclick = () => excluirCurso(curso.id, curso.nome);
        
        cursoItem.appendChild(cursoInfo);
        cursoItem.appendChild(btnDelete);
        li.appendChild(cursoItem);
        lista.appendChild(li);
    });
}

async function excluirCurso(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir o curso "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const baseUrl = window.location.origin + '/trabalhointegrado';
        const response = await fetch(`${baseUrl}/index.php?recurso=cursos&id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir curso' }));
            throw new Error(errorData.error || 'Erro ao excluir curso');
        }

        const result = await response.json();
        alert('Curso excluído com sucesso!');
        await loadCursos();
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir curso: ' + error.message);
    }
}

async function loadCursos() {
    try {
        const baseUrl = window.location.origin + '/trabalhointegrado';
        const response = await fetch(`${baseUrl}/index.php?recurso=cursos`);
        if (!response.ok) throw new Error('Erro ao carregar cursos');
        const cursos = await response.json();
        console.log('Cursos recebidos do servidor:', cursos);
        
        cursos.forEach(curso => {
            if (!curso.tipo || curso.tipo === '') {
                console.warn('Curso sem tipo:', curso);
            }
        });
        
        exibirCursos(cursos);
        return cursos;
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar cursos: ' + error.message);
        return [];
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
    loadCursos();

    const form = document.getElementById('curso-form');
    if (!form) {
        console.error('Formulário de curso não encontrado!');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nomeInput = document.getElementById('nome');
        if (!nomeInput) {
            alert('Campo nome não encontrado!');
            return;
        }
        
        const nome = nomeInput.value.trim();
        const tipoInput = document.getElementById('tipo');
        
        if (!tipoInput) {
            alert('Campo tipo não encontrado!');
            return;
        }
        
        const tipoRaw = tipoInput.value;
        const tipo = tipoRaw ? tipoRaw.trim() : '';
        const selectedIndex = tipoInput.selectedIndex;
        const selectedOption = tipoInput.options[selectedIndex];
        
        console.log('=== DEBUG TIPO ===');
        console.log('Select element:', tipoInput);
        console.log('Valor do select (raw):', tipoRaw);
        console.log('Valor do select (typeof):', typeof tipoRaw);
        console.log('Selected index:', selectedIndex);
        console.log('Selected option:', selectedOption);
        console.log('Selected option value:', selectedOption ? selectedOption.value : 'não encontrado');
        console.log('Selected option text:', selectedOption ? selectedOption.text : 'não encontrado');
        console.log('Tipo após trim:', tipo);
        console.log('Tipo length:', tipo.length);
        if (tipo.length > 0) {
            console.log('Tipo charCodeAt(0):', tipo.charCodeAt(0));
            console.log('Tipo bytes:', new TextEncoder().encode(tipo));
        }
        console.log('==================');

        if (!nome) {
            alert('Por favor, preencha o nome do curso.');
            return;
        }

        if (!tipo) {
            alert('Por favor, selecione o tipo de curso.');
            return;
        }

        const dadosEnvio = { nome, tipo };
        console.log('Dados que serão enviados:', dadosEnvio);
        console.log('JSON stringify:', JSON.stringify(dadosEnvio));

        try {
            const baseUrl = window.location.origin + '/trabalhointegrado';
            const response = await fetch(`${baseUrl}/index.php?recurso=cursos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosEnvio)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errorData.error || 'Erro ao cadastrar curso');
            }

            const cursoCriado = await response.json();
            console.log('Curso criado retornado:', cursoCriado);
            
            if (cursoCriado && cursoCriado.id) {
                const cursos = await loadCursos();
                if (!cursoCriado.tipo && tipo) {
                    cursoCriado.tipo = tipo;
                }
            }

            alert('Curso cadastrado com sucesso!');
            form.reset();
        } catch (error) {
            console.error(error);
            alert('Erro ao cadastrar curso: ' + error.message);
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
