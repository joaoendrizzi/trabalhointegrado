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
        if (!userStr) {
            alert('Você precisa estar logado para alterar a senha.');
            window.location.href = 'index.html';
            return;
        }
        user = JSON.parse(userStr);
    } catch (e) {
        console.error('Erro ao parsear usuário:', e);
        alert('Erro ao carregar dados do usuário.');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
        return;
    }

    const userAvatar = document.getElementById('userAvatar');
    const userNameDiv = document.getElementById('userName');
    const userSiapeDiv = document.getElementById('userSiape');
    
    if (userNameDiv && user) {
        let prefixo = 'Usuário';
        if (user.funcao === 'NAPNE') {
            prefixo = 'Func.';
        } else if (user.funcao === 'Coordenador') {
            prefixo = 'Coord.';
        } else if (user.funcao === 'Docente') {
            prefixo = 'Prof.';
        }
        userNameDiv.textContent = `${prefixo} ${user.nome || 'Usuário'}`;
    }
    
    if (userSiapeDiv && user) {
        if (user.siape && user.siape.trim() !== '') {
            userSiapeDiv.textContent = `SIAPE: ${user.siape}`;
            userSiapeDiv.style.display = 'block';
        } else {
            userSiapeDiv.style.display = 'none';
        }
    }
    
    if (userAvatar && user && user.nome) {
        const nomeParts = user.nome.trim().split(' ');
        if (nomeParts.length >= 2) {
            userAvatar.textContent = (nomeParts[0][0] + nomeParts[nomeParts.length - 1][0]).toUpperCase();
        } else if (nomeParts.length === 1) {
            userAvatar.textContent = nomeParts[0][0].toUpperCase();
        }
    }

    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            
            const icon = button.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            } else {
                input.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });

    const form = document.getElementById('change-password-form');
    if (form) {
        const currentUser = user; 
        
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            let submitUser = null;
            try {
                const userStr = localStorage.getItem('usuario');
                if (userStr) {
                    submitUser = JSON.parse(userStr);
                }
            } catch (e) {
                console.error('Erro ao parsear usuário no submit:', e);
            }
            
            const activeUser = submitUser || currentUser;
            
            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;

            if (!currentPassword) {
                alert('Por favor, insira a senha atual.');
                return;
            }
            if (!newPassword) {
                alert('Por favor, insira a nova senha.');
                return;
            }
            if (newPassword.length < 8) {
                alert('A nova senha deve ter pelo menos 8 caracteres.');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('A nova senha e a confirmação não coincidem.');
                return;
            }
            if (currentPassword === newPassword) {
                alert('A nova senha deve ser diferente da senha atual.');
                return;
            }

            if (!activeUser || !activeUser.id) {
                alert('Erro: ID do usuário não encontrado. Faça login novamente.');
                window.location.href = 'index.html';
                return;
            }

            try {
                const baseUrl = window.location.origin + '/trabalhointegrado';
                const url = `${baseUrl}/index.php?recurso=usuarios&id=${activeUser.id}&acao=alterar-senha`;
                
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        senha_atual: currentPassword,
                        nova_senha: newPassword
                    })
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text.trim());
                } catch (e) {
                    const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
                    if (jsonStart > 0) {
                        data = JSON.parse(text.substring(jsonStart).trim());
                    } else {
                        throw new Error(text || 'Erro desconhecido ao alterar senha');
                    }
                }

                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Erro ao alterar senha');
                }

                alert('Senha alterada com sucesso! Você será redirecionado para fazer login novamente.');
                
                localStorage.removeItem('usuario');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erro ao alterar senha:', error);
                const errorMessage = error.message || 'Erro desconhecido ao alterar senha';
                alert('Erro ao alterar senha: ' + errorMessage);
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('usuario');
                window.location.href = 'index.html';
            }
        });
    }
});