document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('usuario');
        const currentPath = window.location.pathname;
        if (currentPath.includes('/html/')) {
          window.location.href = 'index.html';
        } else {
          window.location.href = '../html/index.html';
        }
      }
      return false;
    });
  }

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
    console.warn('Usuário não autorizado ou não é NAPNE');
  } else {

  try {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    const [alunosRes, peisGeralRes, peisAdaptativosRes] = await Promise.all([
      fetch(`${baseUrl}?recurso=alunos`).catch(err => {
        console.error('Erro ao buscar alunos:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      }),
      fetch(`${baseUrl}?recurso=peis-gerais`).catch(err => {
        console.error('Erro ao buscar PEIs gerais:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      }),
      fetch(`${baseUrl}?recurso=peis-adaptativos`).catch(err => {
        console.error('Erro ao buscar PEIs adaptativos:', err);
        return { ok: false, json: () => Promise.resolve([]) };
      })
    ]);

    const alunos = alunosRes.ok ? await alunosRes.json().catch(() => []) : [];
    const peisGeral = peisGeralRes.ok ? await peisGeralRes.json().catch(() => []) : [];
    const peisAdaptativos = peisAdaptativosRes.ok ? await peisAdaptativosRes.json().catch(() => []) : [];

    const alunosComMonitoria = Array.isArray(alunos) 
      ? alunos.filter(aluno => aluno.monitoria === 'Sim' || aluno.monitoria === 'sim').length 
      : 0;

    const totalAlunosEl = document.getElementById('totalAlunos');
    const totalPEIsEl = document.getElementById('totalPEIs');
    const totalAtendimentosEl = document.getElementById('totalAtendimentos');
    
    if (totalAlunosEl) {
      totalAlunosEl.textContent = Array.isArray(alunos) ? alunos.length : 0;
    }
    if (totalPEIsEl) {
      const totalPeisGeral = Array.isArray(peisGeral) ? peisGeral.length : 0;
      totalPEIsEl.textContent = totalPeisGeral;
    }
    if (totalAtendimentosEl) {
      totalAtendimentosEl.textContent = alunosComMonitoria;
    }

    const updatesList = document.getElementById('updatesList');
    if (updatesList) {
      updatesList.innerHTML = ''; 
      
      const numAlunos = Array.isArray(alunos) ? alunos.length : 0;
      const numPeisGeral = Array.isArray(peisGeral) ? peisGeral.length : 0;
      
      const atualizacoes = [
        `Sistema possui ${numAlunos} alunos cadastrados.`,
        `Total de ${numPeisGeral} PEIs Gerais ativos no sistema.`,
        `${alunosComMonitoria} alunos com acompanhamento de monitor.`,
        "Relatórios do semestre atual disponíveis.",
        "Novos cadastros de necessidades educacionais realizados."
      ];

      atualizacoes.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        updatesList.appendChild(li);
      });
    }

    const alunosList = document.getElementById('alunosList');
    if (alunosList && Array.isArray(alunos)) {
      alunosList.innerHTML = ''; 
      alunos.slice(0, 10).forEach(aluno => {
        const li = document.createElement('li');
        li.textContent = `${aluno.nome} - ${aluno.matricula || 'N/A'}`;
        alunosList.appendChild(li);
      });
    }

    const peisList = document.getElementById('peisList');
    if (peisList && Array.isArray(peisGeral)) {
      peisList.innerHTML = ''; 
      peisGeral.slice(0, 10).forEach(pei => {
        const li = document.createElement('li');
        li.textContent = `PEI Geral: ${pei.alunoNome || pei.aluno_nome || 'Aluno ID: ' + (pei.aluno_id || 'N/A')}`;
        peisList.appendChild(li);
      });
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    const totalAlunosEl = document.getElementById('totalAlunos');
    const totalPEIsEl = document.getElementById('totalPEIs');
    const totalAtendimentosEl = document.getElementById('totalAtendimentos');
    
    if (totalAlunosEl) totalAlunosEl.textContent = '0';
    if (totalPEIsEl) totalPEIsEl.textContent = '0';
    if (totalAtendimentosEl) totalAtendimentosEl.textContent = '0';
  }
  }

  const btnAlunos = document.getElementById('btnAlunos');
  if (btnAlunos) {
    btnAlunos.addEventListener('click', () => {
      const gerenciarAlunos = document.getElementById('gerenciarAlunos');
      const visualizarPEIs = document.getElementById('visualizarPEIs');
      const gerarRelatorios = document.getElementById('gerarRelatorios');
      if (gerenciarAlunos) gerenciarAlunos.style.display = 'block';  
      if (visualizarPEIs) visualizarPEIs.style.display = 'none';    
      if (gerarRelatorios) gerarRelatorios.style.display = 'none';   
    });
  }

  const btnPEIs = document.getElementById('btnPEIs');
  if (btnPEIs) {
    btnPEIs.addEventListener('click', () => {
      const gerenciarAlunos = document.getElementById('gerenciarAlunos');
      const visualizarPEIs = document.getElementById('visualizarPEIs');
      const gerarRelatorios = document.getElementById('gerarRelatorios');
      if (gerenciarAlunos) gerenciarAlunos.style.display = 'none';   
      if (visualizarPEIs) visualizarPEIs.style.display = 'block';   
      if (gerarRelatorios) gerarRelatorios.style.display = 'none';   
    });
  }

  const btnRelatorios = document.getElementById('btnRelatorios');
  if (btnRelatorios) {
    btnRelatorios.addEventListener('click', () => {
      const gerenciarAlunos = document.getElementById('gerenciarAlunos');
      const visualizarPEIs = document.getElementById('visualizarPEIs');
      const gerarRelatorios = document.getElementById('gerarRelatorios');
      if (gerenciarAlunos) gerenciarAlunos.style.display = 'none';   
      if (visualizarPEIs) visualizarPEIs.style.display = 'none';    
      if (gerarRelatorios) gerarRelatorios.style.display = 'block';  
    });
  }

  const addAluno = document.getElementById('addAluno');
  if (addAluno) {
    addAluno.addEventListener('click', () => {
      alert('Funcionalidade para adicionar aluno não implementada. Redirecione para um formulário.');
    });
  }

  const relatorioForm = document.getElementById('relatorioForm');
  if (relatorioForm) {
    relatorioForm.addEventListener('submit', (e) => {
      e.preventDefault();  
      const tipoInput = document.getElementById('tipoRelatorio');
      if (tipoInput) {
        const tipo = tipoInput.value;
        alert(`Gerando relatório de ${tipo}... (Simulação: PDF gerado com sucesso!)`);
      }
    });
  }
});