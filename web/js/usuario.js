function toggleConfigSubmenu() {
    const submenu = document.getElementById('config-submenu');
    if (submenu) {
        submenu.classList.toggle('open');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    let user = null;
    try {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Erro ao parsear usuário:', e);
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
        return;
    }

    const userNameEl = document.getElementById('userName');
    const userSiapeEl = document.getElementById('userSiape');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (user) {
        if (userNameEl) {
            userNameEl.textContent = `Func. ${user.nome || 'Usuário'}`;
        }
        if (userSiapeEl) {
            if (user.siape && user.siape.trim() !== '') {
                userSiapeEl.textContent = `SIAPE: ${user.siape}`;
                userSiapeEl.style.display = 'block';
            } else {
                userSiapeEl.style.display = 'none';
            }
        }
        if (userAvatarEl && user.nome) {
            const nomeParts = user.nome.trim().split(' ');
            if (nomeParts.length >= 2) {
                userAvatarEl.textContent = (nomeParts[0][0] + nomeParts[nomeParts.length - 1][0]).toUpperCase();
            } else if (nomeParts.length === 1) {
                userAvatarEl.textContent = nomeParts[0][0].toUpperCase();
            }
        }
    } else {
        if (userNameEl) {
            userNameEl.textContent = 'Func. Não logado';
        }
        if (userSiapeEl) {
            userSiapeEl.style.display = 'none';
        }
    }

    if (!user || user.funcao !== 'NAPNE') {
        alert('Acesso negado. Apenas usuários NAPNE podem cadastrar usuários.');
        window.location.href = 'indexfun.html';
        return;
    }

    await loadUsuarios();

    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            // Remove tudo que não é dígito
            let value = e.target.value.replace(/\D/g, '');
            // Limita a 11 dígitos
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            // Aplica formatação: 000.000.000-00
            if (value.length <= 3) {
                e.target.value = value;
            } else if (value.length <= 6) {
                e.target.value = value.replace(/(\d{3})(\d+)/, '$1.$2');
            } else if (value.length <= 9) {
                e.target.value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
            } else {
                e.target.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
            }
        });
        
        // Previne colar texto com formatação
        cpfInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            let digitsOnly = paste.replace(/\D/g, '').substring(0, 11);
            // Aplica formatação após colar
            if (digitsOnly.length <= 3) {
                e.target.value = digitsOnly;
            } else if (digitsOnly.length <= 6) {
                e.target.value = digitsOnly.replace(/(\d{3})(\d+)/, '$1.$2');
            } else if (digitsOnly.length <= 9) {
                e.target.value = digitsOnly.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
            } else {
                e.target.value = digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
            }
        });
    }

    const form = document.getElementById('usuario-form');
    if (!form) {
        console.error('Formulário de usuário não encontrado!');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        // Remove formatação do CPF, mantendo apenas dígitos
        const cpf = document.getElementById('cpf')?.value.replace(/\D/g, '').trim();
        const siape = document.getElementById('siape')?.value.trim();
        const funcao = document.getElementById('funcao')?.value;
        const senha = document.getElementById('senha')?.value;
        const confirmarSenha = document.getElementById('confirmarSenha')?.value;

        if (!nome) {
            alert('Por favor, preencha o nome completo.');
            return;
        }

        if (!email) {
            alert('Por favor, preencha o e-mail.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        if (!funcao) {
            alert('Por favor, selecione uma função.');
            return;
        }

        if (!senha) {
            alert('Por favor, preencha a senha.');
            return;
        }

        if (senha.length < 8) {
            alert('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem.');
            return;
        }

        try {
            const baseUrl = window.location.origin + '/trabalhointegrado';
            const response = await fetch(`${baseUrl}/index.php?recurso=usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    email,
                    cpf: cpf || null,
                    siape: siape || null,
                    funcao,
                    senha
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cadastrar usuário');
            }

            await loadUsuarios();

            alert('Usuário cadastrado com sucesso!');
            form.reset();
        } catch (error) {
            console.error(error);
            alert('Erro ao cadastrar usuário: ' + error.message);
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

function exibirUsuarios(usuarios) {
    const lista = document.getElementById('lista-usuarios');
    if (!lista) {
        console.error('Lista de usuários não encontrada!');
        return;
    }
    
    lista.innerHTML = '';
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum usuário cadastrado ainda.';
        lista.appendChild(li);
        return;
    }

    let usuarioLogado = null;
    try {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            usuarioLogado = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Erro ao obter usuário logado:', e);
    }

    usuarios.forEach(usuario => {
        const li = document.createElement('li');
        const siapeInfo = usuario.siape ? ` - SIAPE: ${usuario.siape}` : '';
        const cpfInfo = usuario.cpf ? ` - CPF: ${usuario.cpf}` : '';
        
        const isUsuarioLogado = usuarioLogado && usuarioLogado.id === usuario.id;
        
        const usuarioInfoDiv = document.createElement('div');
        usuarioInfoDiv.className = 'usuario-info';
        
        const infoDiv = document.createElement('div');
        const h4 = document.createElement('h4');
        h4.textContent = `${usuario.nome} (${usuario.funcao})${siapeInfo}${cpfInfo}`;
        const p = document.createElement('p');
        p.textContent = `E-mail: ${usuario.email}`;
        infoDiv.appendChild(h4);
        infoDiv.appendChild(p);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'usuario-actions';
        
        if (isUsuarioLogado) {
            const span = document.createElement('span');
            span.style.color = '#999';
            span.style.fontSize = '0.9rem';
            span.textContent = '(Você não pode excluir seu próprio usuário)';
            actionsDiv.appendChild(span);
        } else {
            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-excluir';
            btnExcluir.title = 'Excluir usuário';
            btnExcluir.innerHTML = '<i class="fas fa-trash"></i> Excluir';
            btnExcluir.addEventListener('click', () => {
                excluirUsuario(usuario.id, usuario.nome);
            });
            actionsDiv.appendChild(btnExcluir);
        }
        
        usuarioInfoDiv.appendChild(infoDiv);
        usuarioInfoDiv.appendChild(actionsDiv);
        li.appendChild(usuarioInfoDiv);
        lista.appendChild(li);
    });
}

async function excluirUsuario(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const baseUrl = window.location.origin + '/trabalhointegrado';
        const response = await fetch(`${baseUrl}/index.php?recurso=usuarios&id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao excluir usuário');
        }

        await loadUsuarios();

        alert('Usuário excluído com sucesso!');
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir usuário: ' + error.message);
    }
}

async function loadUsuarios() {
    try {
        const baseUrl = window.location.origin + '/trabalhointegrado';
        const response = await fetch(`${baseUrl}/index.php?recurso=usuarios`);
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        const usuarios = await response.json();
        exibirUsuarios(usuarios);
    } catch (error) {
        console.error(error);
        const lista = document.getElementById('lista-usuarios');
        if (lista) {
            lista.innerHTML = '<li>Erro ao carregar usuários.</li>';
        }
    }
}
