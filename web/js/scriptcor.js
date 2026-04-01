document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user || user.funcao !== 'Coordenador') {
    window.location.href = 'index.html';
    return;
  }

  const userNameEl = document.getElementById('userName');
  const userSiapeEl = document.getElementById('userSiape');
  const userAvatarEl = document.getElementById('userAvatar');
  
  if (userNameEl) {
    userNameEl.textContent = `Coord. ${user.nome || 'Usuário'}`;
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

  try {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    const [alunosRes, usuariosRes, peisRes] = await Promise.all([
      fetch(`${baseUrl}?recurso=alunos`).catch(err => {
        console.error('Erro ao buscar alunos:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      }),
      fetch(`${baseUrl}?recurso=usuarios`).catch(err => {
        console.error('Erro ao buscar usuários:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      }), 
      fetch(`${baseUrl}?recurso=peis-adaptativos`).catch(err => {
        console.error('Erro ao buscar PEIs adaptativos:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      })
    ]);

    const alunos = alunosRes.ok ? await alunosRes.json().catch(() => []) : [];
    const usuarios = usuariosRes.ok ? await usuariosRes.json().catch(() => []) : [];
    const peis = peisRes.ok ? await peisRes.json().catch(() => []) : [];

    const professores = Array.isArray(usuarios) 
      ? usuarios.filter(usuario => {
          const funcao = (usuario.funcao || '').trim().toLowerCase();
          return funcao === 'docente' || funcao === 'professor';
        })
      : [];

    const totalAlunosEl = document.getElementById('totalAlunos');
    const totalProfessoresEl = document.getElementById('totalProfessores');
    const totalPEIsEl = document.getElementById('totalPEIs');
    
    if (totalAlunosEl) {
      totalAlunosEl.textContent = Array.isArray(alunos) ? alunos.length : 0;
    }
    if (totalProfessoresEl) {
      totalProfessoresEl.textContent = professores.length;
    }
    if (totalPEIsEl) {
      totalPEIsEl.textContent = Array.isArray(peis) ? peis.length : 0;
    }

    const activitiesList = document.getElementById('activitiesList');
    if (activitiesList) {
      activitiesList.innerHTML = ''; 
      
      const numAlunos = Array.isArray(alunos) ? alunos.length : 0;
      const numProfessores = professores.length;
      const numPeis = Array.isArray(peis) ? peis.length : 0;
      
      const atividadesRecentes = [
        `Sistema possui ${numAlunos} alunos cadastrados.`,
        `Sistema possui ${numProfessores} professores ativos.`,
        `Total de ${numPeis} PEIs no sistema.`,
        "Relatórios do último semestre disponíveis.",
        "Novos componentes curriculares adicionados ao sistema."
      ];

      atividadesRecentes.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        activitiesList.appendChild(li);
      });
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    const totalAlunosEl = document.getElementById('totalAlunos');
    const totalProfessoresEl = document.getElementById('totalProfessores');
    const totalPEIsEl = document.getElementById('totalPEIs');
    
    if (totalAlunosEl) totalAlunosEl.textContent = '0';
    if (totalProfessoresEl) totalProfessoresEl.textContent = '0';
    if (totalPEIsEl) totalPEIsEl.textContent = '0';
  }

  const btnAlunos = document.getElementById('btnAlunos');
  if (btnAlunos) {
    btnAlunos.addEventListener('click', () => {
      window.location.href = 'alunos.html';
    });
  }

  const btnPEIs = document.getElementById('btnPEIs');
  if (btnPEIs) {
    btnPEIs.addEventListener('click', () => {
      window.location.href = 'peis.html';
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
