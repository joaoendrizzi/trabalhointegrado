document.addEventListener('DOMContentLoaded', () => {
  let user = null;
  try {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      user = JSON.parse(userStr);
      
      let prefixo = 'Funcionário';
      if (user.funcao) {
        const funcao = user.funcao.trim().toLowerCase();
        if (funcao === 'docente' || funcao === 'professor') {
          prefixo = 'Professor';
        } else if (funcao === 'coordenador') {
          prefixo = 'Coordenador';
        } else if (funcao === 'napne' || funcao === 'funcionario' || funcao === 'funcionário') {
          prefixo = 'Funcionário';
        }
      }
      
      const userInfoSpan = document.getElementById('userInfo') || document.querySelector('.user-info span');
      if (userInfoSpan && user) {
        userInfoSpan.textContent = `${prefixo}: ${user.nome || 'Usuário'}`;
      }
    }
  } catch (e) {
    console.error('Erro ao parsear usuário:', e);
  }
  
  let peis = [];

  const peisList = document.getElementById('peisList');
  const peiDetalhes = document.getElementById('peiDetalhes');
  const detalhesAlunoNome = document.getElementById('detalhesAlunoNome');
  const peiDificuldades = document.getElementById('peiDificuldades');
  const peiHabilidades = document.getElementById('peiHabilidades');
  const peiHistorico = document.getElementById('peiHistorico');
  const peiHistoricoNoIFRS = document.getElementById('peiHistoricoNoIFRS');
  const peiEstrategiasDeEnsino = document.getElementById('peiEstrategiasDeEnsino');
  const searchInput = document.getElementById('searchPEI');
  const fecharBtn = document.getElementById('fecharDetalhes');
  
  let peiAtual = null; 

  const addPEIBtn = document.getElementById('addPEIBtn');
  const addPEIModal = document.getElementById('addPEIModal');
  const addPEIForm = document.getElementById('addPEIForm');
  const closeAddModal = document.querySelector('.close-add-modal');
  const modalTitle = document.getElementById('modalTitle');
  const saveButton = document.getElementById('saveButton');
  
  if (!peisList || !addPEIBtn || !addPEIModal || !addPEIForm) {
    return;
  }
  
  addPEIModal.style.display = 'none';
  
  addPEIModal.style.display = 'none';
  
  let peiEditando = null; 

  function renderPeis(peisToRender) {
    
    peisList.innerHTML = '';
    
    if (!Array.isArray(peisToRender) || peisToRender.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nenhum PEI Geral cadastrado.';
      li.className = 'no-items';
      peisList.appendChild(li);
      return;
    }
    
    peisToRender.forEach(pei => {
      const li = document.createElement('li');
      li.className = 'pei-item'; 
      li.innerHTML = `
        <span><strong>${pei.alunoNome || `Aluno ID: ${pei.aluno_id || 'N/A'}`}</strong></span>
        <div class="actions">
          <button class="btn-detalhes" data-id="${pei.id}">Editar/Ver</button>
          <button class="btn-excluir-pei" data-id="${pei.id}">Excluir</button>
        </div>
      `;
      
      li.querySelector('.btn-detalhes').onclick = () => editarOuVerPEI(pei.id);
      
      li.querySelector('.btn-excluir-pei').onclick = () => deletarPEI(pei.id);
      
      peisList.appendChild(li);
    });
  }

  function mostrarDetalhes(pei) {
    if (!pei) return;
    
    peiAtual = pei;
    
    if (detalhesAlunoNome) detalhesAlunoNome.textContent = pei.alunoNome || `Aluno ID: ${pei.aluno_id || 'N/A'}`;
    if (peiDificuldades) peiDificuldades.textContent = pei.dificuldades || '';
    if (peiHabilidades) peiHabilidades.textContent = pei.habilidades || '';
    if (peiHistorico) peiHistorico.textContent = pei.historico || '';
    if (peiHistoricoNoIFRS) peiHistoricoNoIFRS.textContent = pei.historicoNoIFRS || '';
    if (peiEstrategiasDeEnsino) peiEstrategiasDeEnsino.textContent = pei.estrategiasDeEnsino || '';

    if (peiDetalhes) {
      peiDetalhes.classList.remove('hidden');
      peiDetalhes.scrollIntoView({ behavior: 'smooth' });
    }
    
    const baixarPDFBtn = document.getElementById('baixarPDF');
    if (baixarPDFBtn) {
      baixarPDFBtn.onclick = () => {
        if (typeof gerarPDFPEIGeral === 'function' && peiAtual) {
          gerarPDFPEIGeral(peiAtual);
        } else {
          alert('Erro ao gerar PDF. Certifique-se de que o script gerarpdf.js foi carregado.');
        }
      };
    }
  }
  
  function fecharDetalhes() {
      peiDetalhes.classList.add('hidden');
      peiAtual = null;
      const editarDetalhesBtn = document.getElementById('editarDetalhes');
      if (editarDetalhesBtn) {
        editarDetalhesBtn.classList.add('hidden');
      }
  }

  function editarOuVerPEI(id) {
    const pei = peis.find(p => p.id === id);
    
    mostrarDetalhes(pei); 
    
    const editarDetalhesBtn = document.getElementById('editarDetalhes');
    if (editarDetalhesBtn) {
      editarDetalhesBtn.classList.remove('hidden');
      editarDetalhesBtn.dataset.peiId = id;
    }
  }

  function openModal(mode, peiId = null) {
    
    if (!addPEIModal) {
      return;
    }
    
    if (!addPEIForm) {
      return;
    }
    
    addPEIForm.reset();
    peiEditando = peiId;

    if (mode === 'add') {
      if (modalTitle) {
        modalTitle.textContent = 'Cadastrar Novo PEI Geral';
      }
      if (saveButton) {
        saveButton.textContent = 'Salvar PEI';
      }
      const alunoSelect = document.getElementById('alunoNome');
      if (alunoSelect) {
        alunoSelect.value = '';
      }
    } else if (mode === 'edit' && peiId !== null) {
      if (modalTitle) {
        modalTitle.textContent = 'Editar PEI Geral';
      }
      if (saveButton) {
        saveButton.textContent = 'Salvar Edição';
      }
      
      const pei = peis.find(p => p.id === peiId);
      if (pei) {
        const alunoSelect = document.getElementById('alunoNome');
        if (alunoSelect) {
          alunoSelect.value = pei.alunoNome || '';
        }
        const dificuldadesEl = document.getElementById('dificuldades');
        const habilidadesEl = document.getElementById('habilidades');
        const historicoEl = document.getElementById('historico');
        const historicoNoIFRSEl = document.getElementById('historicoNoIFRS');
        const estrategiasEl = document.getElementById('estrategiasDeEnsino');
        
        if (dificuldadesEl) dificuldadesEl.value = pei.dificuldades || '';
        if (habilidadesEl) habilidadesEl.value = pei.habilidades || '';
        if (historicoEl) historicoEl.value = pei.historico || '';
        if (historicoNoIFRSEl) historicoNoIFRSEl.value = pei.historicoNoIFRS || '';
        if (estrategiasEl) estrategiasEl.value = pei.estrategiasDeEnsino || '';
      }
    }
    
    addPEIModal.style.display = 'flex';
    addPEIModal.classList.add('show');
  }
  
  function adicionarPEI() {
    fecharDetalhes();
    if (!addPEIModal) {
      return;
    }
    openModal('add');
  }

  function fecharAddModal() {
    if (addPEIModal) {
      addPEIModal.style.display = 'none';
      addPEIModal.classList.remove('show');
    }
    if (addPEIForm) {
      addPEIForm.reset();
    }
    peiEditando = null;
  }
  
  async function salvarPEI(e) {
    e.preventDefault();

    const alunoSelect = document.getElementById('alunoNome');
    const alunoNome = alunoSelect ? alunoSelect.value.trim() : '';
    
    const dados = {
      alunoNome: alunoNome,
      dificuldades: document.getElementById('dificuldades').value.trim(),
      habilidades: document.getElementById('habilidades').value.trim(),
      historico: document.getElementById('historico').value.trim(),
      historicoNoIFRS: document.getElementById('historicoNoIFRS').value.trim(),
      estrategiasDeEnsino: document.getElementById('estrategiasDeEnsino').value.trim()
    };

    if (!dados.alunoNome || Object.values(dados).some(v => v === '')) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      
      if (peiEditando !== null) {
        const response = await fetch(`${baseUrl}?recurso=peis-gerais&id=${peiEditando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const text = await response.text();
        let resultado;
        try {
          resultado = JSON.parse(text.trim());
        } catch (e) {
          const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
          if (jsonStart > 0) {
            resultado = JSON.parse(text.substring(jsonStart).trim());
          } else {
            throw new Error('Resposta inválida do servidor');
          }
        }
        if (!response.ok) {
          throw new Error(resultado.error || 'Erro ao atualizar PEI');
        }
        alert(`PEI Geral para ${dados.alunoNome} atualizado com sucesso!`);
      } else {
        const response = await fetch(`${baseUrl}?recurso=peis-gerais`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const text = await response.text();
        let resultado;
        try {
          resultado = JSON.parse(text.trim());
        } catch (e) {
          const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
          if (jsonStart > 0) {
            resultado = JSON.parse(text.substring(jsonStart).trim());
          } else {
            throw new Error('Resposta inválida do servidor');
          }
        }
        if (!response.ok) {
          const errorMessage = resultado.error || 'Erro ao adicionar PEI';
          alert('Erro ao adicionar PEI: ' + errorMessage);
          throw new Error(errorMessage);
        }
        alert(`PEI Geral para ${dados.alunoNome} adicionado com sucesso!`);
      }

      await loadPeis(); 
      fecharAddModal();
      if (peiEditando !== null) {
        const savedPei = peis.find(p => p.id === peiEditando);
        if (savedPei) {
          mostrarDetalhes(savedPei);
          const editarDetalhesBtn = document.getElementById('editarDetalhes');
          if (editarDetalhesBtn) {
            editarDetalhesBtn.classList.remove('hidden');
            editarDetalhesBtn.dataset.peiId = peiEditando;
          }
        }
      } else {
        const savedPei = peis.find(p => p.alunoNome === dados.alunoNome);
        if (savedPei) {
          mostrarDetalhes(savedPei);
          const editarDetalhesBtn = document.getElementById('editarDetalhes');
          if (editarDetalhesBtn) {
            editarDetalhesBtn.classList.remove('hidden');
            editarDetalhesBtn.dataset.peiId = savedPei.id;
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar PEI: ' + error.message);
    }
  }
  
  async function deletarPEI(id) {
    if (confirm('Tem certeza que deseja excluir permanentemente este PEI Geral?')) {
      try {
        const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
        const response = await fetch(`${baseUrl}?recurso=peis-gerais&id=${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir PEI' }));
          throw new Error(errorData.error || 'Erro ao excluir PEI');
        }

        if (peiAtual && peiAtual.id === id) {
            fecharDetalhes();
        }
        await loadPeis(); 
        alert('PEI Geral excluído com sucesso!');
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir PEI: ' + error.message);
      }
    }
  }

  function filtrarPeis() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = peis.filter(pei => pei.alunoNome.toLowerCase().includes(searchTerm));
    renderPeis(filtered);
  }
  
  if (fecharBtn) {
    fecharBtn.addEventListener('click', fecharDetalhes);
  }
  
  const editarDetalhesBtn = document.getElementById('editarDetalhes');
  if (editarDetalhesBtn) {
    editarDetalhesBtn.addEventListener('click', () => {
      const peiId = editarDetalhesBtn.dataset.peiId;
      if (peiId) {
        openModal('edit', parseInt(peiId));
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', filtrarPeis);
  }

  if (addPEIBtn) {
    addPEIBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      adicionarPEI();
    });
  } else {
  }
  
  if (closeAddModal) {
    closeAddModal.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharAddModal();
    });
  } else {
  }
  
  if (addPEIForm) {
    addPEIForm.addEventListener('submit', salvarPEI);
  }
  
  if (addPEIModal) {
    addPEIModal.addEventListener('click', (e) => {
      if (e.target === addPEIModal) {
        fecharAddModal();
      }
    });
  }

  async function loadPeis() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=peis-gerais`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao carregar PEIs' }));
        throw new Error(errorData.error || 'Erro ao carregar PEIs');
      }
      const dados = await response.json();
      peis = Array.isArray(dados) ? dados : [];
      renderPeis(peis);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar PEIs: ' + error.message);
    }
  }

  async function loadAlunos() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=alunos`);
      if (!response.ok) {
        const alunoSelect = document.getElementById('alunoNome');
        if (alunoSelect) {
          alunoSelect.innerHTML = '<option value="">Erro ao carregar alunos</option>';
        }
        console.error('Erro ao carregar alunos');
        return;
      }
      const alunos = await response.json();
      const alunoSelect = document.getElementById('alunoNome');
      
      if (alunoSelect && Array.isArray(alunos)) {
        alunoSelect.innerHTML = '<option value="">Selecione um aluno</option>';
        alunos.forEach(aluno => {
          const option = document.createElement('option');
          option.value = aluno.nome || '';
          option.textContent = aluno.nome || '';
          alunoSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      const alunoSelect = document.getElementById('alunoNome');
      if (alunoSelect) {
        alunoSelect.innerHTML = '<option value="">Erro ao carregar alunos</option>';
      }
    }
  }

  loadAlunos(); 
  loadPeis();

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