document.addEventListener('DOMContentLoaded', async function() {
  const userStr = localStorage.getItem('usuario');
  if (!userStr) {
    window.location.href = 'index.html';
    return;
  }
  
  const user = JSON.parse(userStr);
  const funcao = (user?.funcao || '').trim();
  
  if (!user || (funcao !== 'Docente' && funcao.toLowerCase() !== 'docente')) {
    window.location.href = 'index.html';
    return;
  }

  const userNameEl = document.getElementById('userName');
  const userSiapeEl = document.getElementById('userSiape');
  
  if (userNameEl) {
    userNameEl.textContent = `Prof. ${user.nome || 'Usuário'}`;
  }
  
  if (userSiapeEl) {
    if (user.siape && user.siape.trim() !== '') {
      userSiapeEl.textContent = `SIAPE: ${user.siape}`;
      userSiapeEl.style.display = 'block';
    } else {
      userSiapeEl.style.display = 'none';
    }
  }

  try {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    const [alunosRes, peisRes, componentesRes] = await Promise.all([
      fetch(`${baseUrl}?recurso=alunos`).catch(err => {
        console.error('Erro ao buscar alunos:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      }),
      fetch(`${baseUrl}?recurso=peis-adaptativos`).catch(err => {
        console.error('Erro ao buscar PEIs adaptativos:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      }),
      fetch(`${baseUrl}?recurso=componentes`).catch(err => {
        console.error('Erro ao buscar componentes:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      })
    ]);

    const alunos = alunosRes.ok ? await alunosRes.json().catch(() => []) : [];
    const peis = peisRes.ok ? await peisRes.json().catch(() => []) : [];
    const componentes = componentesRes.ok ? await componentesRes.json().catch(() => []) : [];

    const totalAlunos = Array.isArray(alunos) ? alunos.length : 0;
    
    const docenteNome = user.nome || '';
    let peisDoDocente = 0;
    
    if (Array.isArray(peis) && docenteNome) {
      peisDoDocente = peis.filter(pei => {
        if (!pei.descricao) return false;
        try {
          const descData = JSON.parse(pei.descricao);
          return descData.docente === docenteNome;
        } catch (e) {
          return pei.descricao.includes(docenteNome);
        }
      }).length;
    }
    
    const totalComponentes = Array.isArray(componentes) ? componentes.length : 0;

    const totalAlunosEl = document.getElementById('totalAlunos');
    const totalPEIsEl = document.getElementById('totalPEIs');
    const totalComponentesEl = document.getElementById('totalComponentes');
    
    if (totalAlunosEl) {
      totalAlunosEl.textContent = totalAlunos;
    }
    if (totalPEIsEl) {
      totalPEIsEl.textContent = peisDoDocente;
    }
    if (totalComponentesEl) {
      totalComponentesEl.textContent = totalComponentes;
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    const totalAlunosEl = document.getElementById('totalAlunos');
    const totalPEIsEl = document.getElementById('totalPEIs');
    const totalComponentesEl = document.getElementById('totalComponentes');
    
    if (totalAlunosEl) totalAlunosEl.textContent = '0';
    if (totalPEIsEl) totalPEIsEl.textContent = '0';
    if (totalComponentesEl) totalComponentesEl.textContent = '0';
  }

  const submenuLinks = document.querySelectorAll('.submenu a');
  submenuLinks.forEach(link => {
  });

  const menuItems = document.querySelectorAll('.main-menu > li > a');
  menuItems.forEach(item => {
    if (item.closest('.submenu')) {
      return; 
    }
    
    if (item.getAttribute('onclick')) {
      return; 
    }

    if (!item.getAttribute('href') || item.getAttribute('href') === '#') {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        menuItems.forEach(i => {
          if (!i.closest('.submenu')) {
            i.classList.remove('active');
          }
        });
        this.classList.add('active');
      });
    }
  });

  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const module = this.closest('.module-card').querySelector('.module-header h3').textContent;
      const action = this.textContent.trim();
    });
  });

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
