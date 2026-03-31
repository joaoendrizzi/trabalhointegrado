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
  const peiAlunoNome = document.getElementById('peiAlunoNome');
  const peiPeriodo = document.getElementById('peiPeriodo');
  const peiDescricao = document.getElementById('peiDescricao');
  const peiDocente = document.getElementById('peiDocente');
  const peiComponente = document.getElementById('peiComponente');
  const searchInput = document.getElementById('searchPEI');
  const fecharBtn = document.getElementById('fecharDetalhes');
  let peiAtual = null;

  function renderPeis(filteredPeis = peis) {
    if (!peisList) return;
    
    peisList.innerHTML = '';
    if (filteredPeis.length === 0) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-info-circle" style="font-size: 3rem; color: #999; margin-bottom: 20px;"></i>
          <p style="font-size: 1.1rem; color: #666; margin-bottom: 10px;">Nenhum Parecer encontrado.</p>
          <p style="font-size: 0.9rem; color: #999;">Não há pareceres cadastrados no sistema ainda.</p>
        </div>
      `;
      peisList.appendChild(li);
      return;
    }
    
    filteredPeis.forEach(pei => {
      const li = document.createElement('li');
      const alunoNome = pei.alunoNome || 'Aluno não informado';
      const periodo = pei.periodo || pei.peiPeriodo || 'Não informado';
      const componente = pei.componenteNome || 'Não informado';
      
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: green; font-size: 1.1rem;">${alunoNome}</strong>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
              Período: ${periodo}${componente && componente !== 'Não informado' ? ' | Componente: ' + componente : ''}
            </div>
          </div>
          <i class="fas fa-chevron-right" style="color: #999;"></i>
        </div>
      `;
      li.onclick = () => mostrarDetalhesPEI(pei);
      li.onmouseenter = () => li.style.backgroundColor = '#f0f8f0';
      li.onmouseleave = () => li.style.backgroundColor = '';
      
      peisList.appendChild(li);
    });
  }

  async function mostrarDetalhesPEI(pei) {
    if (!pei || !pei.id) {
      alert('Parecer não encontrado ou foi excluído.');
      await loadPeis();
      return;
    }
    
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=pareceres&id=${pei.id}`);
      
      if (!response.ok || response.status === 404) {
        alert('Este parecer não existe mais ou foi excluído.');
        await loadPeis();
        return;
      }
      
      const parecerAtualizado = await response.json();
      if (!parecerAtualizado || !parecerAtualizado.id) {
        alert('Este parecer não existe mais ou foi excluído.');
        await loadPeis();
        return;
      }
      
      pei = parecerAtualizado;
    } catch (error) {
      console.error('Erro ao verificar parecer:', error);
    }
    
    peiAtual = pei;
    
    if (peiAlunoNome) peiAlunoNome.textContent = pei.alunoNome || 'Não informado';
    
    let periodoExibicao = pei.periodo || pei.peiPeriodo || 'Não informado';
    if (peiPeriodo) peiPeriodo.textContent = periodoExibicao;
    
    let descricaoTexto = '';
    let docenteExtraido = pei.docente || null;
    
    if (pei.descricao || pei.peiDescricao) {
      const descricaoRaw = pei.descricao || pei.peiDescricao;
      try {
        const descricaoJson = JSON.parse(descricaoRaw);
        if (typeof descricaoJson === 'object' && descricaoJson !== null) {
          descricaoTexto = descricaoJson.descricao || '';
          
          if (!docenteExtraido && descricaoJson.docente) {
            docenteExtraido = descricaoJson.docente;
          }
        } else {
          descricaoTexto = descricaoRaw;
        }
      } catch (e) {
        // Se não for JSON, usar o texto direto
        descricaoTexto = descricaoRaw;
      }
    }
    
    if (peiDescricao) peiDescricao.textContent = descricaoTexto || 'Sem descrição';
    if (peiDocente) peiDocente.textContent = docenteExtraido || 'Não informado';
    if (peiComponente) peiComponente.textContent = pei.componenteNome || 'Não informado';
    
    peiDetalhes.classList.remove('hidden');
    peiDetalhes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    const baixarPDFBtn = document.getElementById('baixarPDF');
    if (baixarPDFBtn) {
      baixarPDFBtn.onclick = () => {
        if (typeof gerarPDFParecer === 'function' && peiAtual) {
          gerarPDFParecer(peiAtual);
        } else {
          alert('Erro ao gerar PDF. Certifique-se de que o script gerarpdf.js foi carregado.');
        }
      };
    }
  }


  function filtrarPeis() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = peis.filter(pei => {
      const alunoNome = (pei.alunoNome || '').toLowerCase();
      const periodo = (pei.periodo || pei.peiPeriodo || '').toLowerCase();
      const descricao = (pei.descricao || '').toLowerCase();
      const docente = (pei.docente || '').toLowerCase();
      const componente = (pei.componenteNome || '').toLowerCase();
      return alunoNome.includes(searchTerm) || periodo.includes(searchTerm) || 
             descricao.includes(searchTerm) || docente.includes(searchTerm) ||
             componente.includes(searchTerm);
    });
    renderPeis(filtered);
  }

  async function loadPeis() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      
      // Primeiro, tentar buscar pareceres reais da tabela pareceres
      let response = await fetch(`${baseUrl}?recurso=pareceres`);
      let text = await response.text();
      
      let pareceresData;
      try {
        pareceresData = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          pareceresData = JSON.parse(text.substring(jsonStart).trim());
        } else {
          pareceresData = [];
        }
      }
      
      if (!Array.isArray(pareceresData)) {
        console.warn('Dados recebidos não são um array:', pareceresData);
        pareceresData = [];
      }
      
      peis = pareceresData;
      
      peis = peis.filter(pei => {
        if (!pei || !pei.id || pei.id === null || pei.id === undefined) {
          console.log('Filtrando parecer sem ID válido:', pei);
          return false;
        }
        
        const temDescricao = pei.descricao && pei.descricao.trim() !== '';
        const temPeriodo = (pei.periodo && pei.periodo.trim() !== '') || 
                          (pei.peiPeriodo && pei.peiPeriodo.trim() !== '');
        
        if (!temDescricao && !temPeriodo) {
          console.log('Filtrando parecer sem descrição ou período:', pei);
          return false;
        }
        
        return true;
      });
      
      console.log('Pareceres válidos após filtro:', peis.length);
      
      if (peis.length === 0) {
      }
      
      renderPeis();
    } catch (error) {
      console.error('Erro ao carregar Pareceres:', error);
      if (peisList) {
        peisList.innerHTML = '<li style="text-align: center; padding: 20px; color: red;">Erro ao carregar Pareceres: ' + error.message + '</li>';
      }
    }
  }

  fecharBtn.addEventListener('click', () => {
    peiDetalhes.classList.add('hidden');
    peiAtual = null;
  });

  searchInput.addEventListener('input', filtrarPeis);
  
  loadPeis();

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
