document.addEventListener('DOMContentLoaded', () => {
  let user = null;
  try {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      user = JSON.parse(userStr);
      
      let prefixo = 'Professor';
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
  
  let peisAdaptativos = [];
  let peiAtual = null;
  let pareceresDoPei = [];
  const peisList = document.getElementById('peisList');
  const peiDetalhes = document.getElementById('peiDetalhes');
  const searchInput = document.getElementById('searchPEI');
  const fecharBtn = document.getElementById('fecharDetalhes');
  const cancelarBtn = document.getElementById('cancelarEdicao');
  const editarParecerForm = document.getElementById('editarParecerForm');
  
  const peiAlunoNome = document.getElementById('peiAlunoNome');
  const peiComponente = document.getElementById('peiComponente');
  const peiDocente = document.getElementById('peiDocente');
  const peiCurso = document.getElementById('peiCurso');
  const peiPeriodo = document.getElementById('peiPeriodo');
  const peiDescricao = document.getElementById('peiDescricao');
  const peiDataEnvio = document.getElementById('peiDataEnvio');
  const excluirParecerBtn = document.getElementById('excluirParecer');
  
  const pareceresListContainer = document.getElementById('pareceresListContainer');

  async function loadPeisAdaptativos() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=peis-adaptativos`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar PEIs Adaptativos');
      }
      
      const text = await response.text();
      let peisData;
      try {
        peisData = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          peisData = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      
      peisAdaptativos = Array.isArray(peisData) ? peisData : [];
      renderPeis(peisAdaptativos);
    } catch (error) {
      console.error('Erro ao carregar PEIs Adaptativos:', error);
      if (peisList) {
        peisList.innerHTML = '<li style="text-align: center; padding: 20px; color: red;">Erro ao carregar PEIs: ' + error.message + '</li>';
      }
    }
  }

  function renderPeis(peis = peisAdaptativos) {
    if (!peisList) return;
    
    peisList.innerHTML = '';
    if (peis.length === 0) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-info-circle" style="font-size: 3rem; color: #999; margin-bottom: 20px;"></i>
          <p style="font-size: 1.1rem; color: #666; margin-bottom: 10px;">Nenhum PEI Adaptativo encontrado.</p>
          <p style="font-size: 0.9rem; color: #999;">Não há PEIs Adaptativos cadastrados no sistema ainda.</p>
        </div>
      `;
      peisList.appendChild(li);
      return;
    }
    
    peis.forEach(pei => {
      const li = document.createElement('li');
      const alunoNome = pei.alunoNome || 'PEI #' + (pei.id || 'N/A');
      const componente = pei.componenteNome || 'Não informado';
      
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: green; font-size: 1.1rem;">${alunoNome}</strong>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
              Componente: ${componente}
            </div>
          </div>
          <i class="fas fa-chevron-right" style="color: #999;"></i>
        </div>
      `;
      li.onclick = () => mostrarDetalhesPei(pei);
      li.onmouseenter = () => li.style.backgroundColor = '#f0f8f0';
      li.onmouseleave = () => li.style.backgroundColor = '';
      
      peisList.appendChild(li);
    });
  }

  async function mostrarDetalhesPei(pei) {
    peiAtual = pei;
    
    // Preencher informações do PEI
    if (peiAlunoNome) peiAlunoNome.textContent = pei.alunoNome || 'Não informado';
    if (peiComponente) peiComponente.textContent = pei.componenteNome || 'Não informado';
    
    // Extrair docente da descrição
    let docente = 'Não informado';
    if (pei.descricao) {
      try {
        const descricaoJson = JSON.parse(pei.descricao);
        if (descricaoJson && descricaoJson.docente) {
          docente = descricaoJson.docente;
        }
      } catch (e) {
        // Não é JSON, ignorar
      }
    }
    if (peiDocente) peiDocente.textContent = docente;
    
    // Curso
    const cursoNome = pei.cursoNome || 'Não informado';
    const cursoTipo = pei.cursoTipo || 'Superior';
    if (peiCurso) peiCurso.textContent = `${cursoNome} (${cursoTipo})`;
    
    // Carregar pareceres deste PEI
    await loadPareceresDoPei(pei.id);
    
    // Mostrar seção de detalhes
    peiDetalhes.classList.remove('hidden');
    peiDetalhes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function loadPareceresDoPei(peiAdaptativoId) {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=pareceres&peiadaptativo_id=${peiAdaptativoId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pareceres');
      }
      
      const text = await response.text();
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
      
      pareceresDoPei = Array.isArray(pareceresData) ? pareceresData : [];
      renderPareceresDoPei();
    } catch (error) {
      console.error('Erro ao carregar pareceres:', error);
      pareceresDoPei = [];
      renderPareceresDoPei();
    }
  }

  function renderPareceresDoPei() {
    // Criar ou atualizar container de pareceres
    let container = document.getElementById('pareceresListContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pareceresListContainer';
      container.style.marginTop = '20px';
      container.style.marginBottom = '20px';
      
      // Inserir antes do formulário de criar parecer
      const formSection = document.getElementById('criarParecerSection');
      if (formSection) {
        formSection.parentNode.insertBefore(container, formSection);
      } else {
        peiDetalhes.insertBefore(container, editarParecerForm);
      }
    }
    
    container.innerHTML = '<h4>Pareceres Existentes (' + pareceresDoPei.length + '/3)</h4>';
    
    if (pareceresDoPei.length === 0) {
      const p = document.createElement('p');
      p.style.color = '#666';
      p.style.fontStyle = 'italic';
      p.textContent = 'Nenhum parecer criado ainda para este PEI Adaptativo.';
      container.appendChild(p);
    } else {
      pareceresDoPei.forEach((parecer, index) => {
        const div = document.createElement('div');
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '8px';
        div.style.padding = '15px';
        div.style.marginBottom = '10px';
        div.style.backgroundColor = '#f9f9f9';
        
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <strong>Parecer ${index + 1}</strong>
              <p style="margin: 5px 0; color: #666;"><strong>Período:</strong> ${parecer.periodo || 'Não informado'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Descrição:</strong> ${parecer.descricao ? (parecer.descricao.length > 100 ? parecer.descricao.substring(0, 100) + '...' : parecer.descricao) : 'Sem descrição'}</p>
              ${parecer.dataEnvio ? `<p style="margin: 5px 0; color: #999; font-size: 0.85rem;">Data de envio: ${new Date(parecer.dataEnvio).toLocaleString('pt-BR')}</p>` : ''}
            </div>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              <button class="btn-primary" onclick="gerarPDFParecerIndividual(${parecer.id})" style="background-color: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;" title="Gerar PDF">
                <i class="fas fa-file-pdf"></i> PDF
              </button>
              <button class="btn-danger" onclick="editarParecer(${parecer.id})" style="background-color: green; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;" title="Editar">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn-danger" onclick="excluirParecer(${parecer.id})" style="background-color: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    }
    
    // Adicionar botão para criar novo parecer se ainda não atingiu o limite
    if (pareceresDoPei.length < 3) {
      let criarBtn = document.getElementById('criarNovoParecerBtn');
      if (!criarBtn) {
        criarBtn = document.createElement('button');
        criarBtn.id = 'criarNovoParecerBtn';
        criarBtn.className = 'btn-primary';
        criarBtn.innerHTML = '<i class="fas fa-plus"></i> Criar Novo Parecer';
        criarBtn.style.marginTop = '15px';
        criarBtn.onclick = () => mostrarFormularioCriarParecer();
        container.appendChild(criarBtn);
      }
    } else {
      const criarBtn = document.getElementById('criarNovoParecerBtn');
      if (criarBtn) criarBtn.remove();
      const p = document.createElement('p');
      p.style.color = '#dc3545';
      p.style.fontWeight = 'bold';
      p.style.marginTop = '10px';
      p.textContent = 'Limite de 3 pareceres atingido para este PEI Adaptativo.';
      container.appendChild(p);
    }
  }

  function mostrarFormularioCriarParecer() {
    // Limpar formulário
    if (peiPeriodo) peiPeriodo.value = '';
    if (peiDescricao) peiDescricao.value = '';
    if (peiDataEnvio) {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const dia = String(agora.getDate()).padStart(2, '0');
      const horas = String(agora.getHours()).padStart(2, '0');
      const minutos = String(agora.getMinutes()).padStart(2, '0');
      peiDataEnvio.value = `${ano}-${mes}-${dia}T${horas}:${minutos}`;
    }
    
    // Mostrar formulário
    if (editarParecerForm) {
      editarParecerForm.style.display = 'block';
      editarParecerForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Funções globais para os botões
  window.editarParecer = async function(parecerId) {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=pareceres&id=${parecerId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar parecer');
      }
      
      const text = await response.text();
      let parecer;
      try {
        parecer = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          parecer = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      
      // Preencher formulário
      if (peiPeriodo) peiPeriodo.value = parecer.periodo || '';
      if (peiDescricao) peiDescricao.value = parecer.descricao || '';
      if (peiDataEnvio && parecer.dataEnvio) {
        const data = new Date(parecer.dataEnvio);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        peiDataEnvio.value = `${ano}-${mes}-${dia}T${horas}:${minutos}`;
      }
      
      // Armazenar ID do parecer sendo editado
      editarParecerForm.dataset.parecerId = parecerId;
      
      // Mostrar formulário
      if (editarParecerForm) {
        editarParecerForm.style.display = 'block';
        editarParecerForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      console.error('Erro ao carregar parecer:', error);
      alert('Erro ao carregar parecer: ' + error.message);
    }
  };

  window.gerarPDFParecerIndividual = async function(parecerId) {
    try {
      // Buscar dados completos do parecer
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=pareceres&id=${parecerId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar parecer');
      }
      
      const text = await response.text();
      let parecer;
      try {
        parecer = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          parecer = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      
      // Adicionar informações do PEI se disponível
      if (peiAtual) {
        parecer.alunoNome = parecer.alunoNome || peiAtual.alunoNome;
        parecer.componenteNome = parecer.componenteNome || peiAtual.componenteNome;
        
        // Extrair docente do PEI se não estiver no parecer
        if (!parecer.docente && peiAtual.descricao) {
          try {
            const descricaoJson = JSON.parse(peiAtual.descricao);
            if (descricaoJson && descricaoJson.docente) {
              parecer.docente = descricaoJson.docente;
            }
          } catch (e) {
            // Ignorar erro de parse
          }
        }
      }
      
      // Verificar se a função gerarPDFParecer existe
      if (typeof gerarPDFParecer === 'function') {
        gerarPDFParecer(parecer);
      } else {
        alert('Erro ao gerar PDF. Certifique-se de que o script gerarpdf.js foi carregado.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF do parecer:', error);
      alert('Erro ao gerar PDF: ' + error.message);
    }
  };

  window.excluirParecer = async function(parecerId) {
    if (!confirm('Tem certeza que deseja excluir este parecer?')) {
      return;
    }
    
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=pareceres&id=${parecerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-User-Funcao': user.funcao
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir parecer' }));
        throw new Error(errorData.error || 'Erro ao excluir parecer');
      }
      
      alert('Parecer excluído com sucesso!');
      if (peiAtual) {
        await loadPareceresDoPei(peiAtual.id);
      }
    } catch (error) {
      console.error('Erro ao excluir parecer:', error);
      alert('Erro ao excluir parecer: ' + error.message);
    }
  };

  // Salvar parecer (criar ou editar)
  if (editarParecerForm) {
    editarParecerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!peiAtual) {
        alert('Nenhum PEI Adaptativo selecionado.');
        return;
      }
      
      // Verificar limite de 3 pareceres ao criar novo
      const parecerId = editarParecerForm.dataset.parecerId;
      if (!parecerId && pareceresDoPei.length >= 3) {
        alert('Limite de 3 pareceres atingido para este PEI Adaptativo.');
        return;
      }
      
      const periodo = peiPeriodo ? peiPeriodo.value : '';
      const descricao = peiDescricao ? peiDescricao.value.trim() : '';
      const dataEnvio = peiDataEnvio ? peiDataEnvio.value : null;
      
      if (!periodo || !descricao) {
        alert('Por favor, preencha o período e a descrição.');
        return;
      }
      
      try {
        const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
        const url = parecerId 
          ? `${baseUrl}?recurso=pareceres&id=${parecerId}`
          : `${baseUrl}?recurso=pareceres`;
        
        const method = parecerId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            periodo: periodo,
            descricao: descricao,
            peiadaptativo_id: peiAtual.id,
            curso_id: peiAtual.cursoId || peiAtual.curso_id || null,
            data_envio: dataEnvio || null
          })
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
          throw new Error(resultado.error || 'Erro ao salvar parecer');
        }
        
        alert(parecerId ? 'Parecer atualizado com sucesso!' : 'Parecer criado com sucesso!');
        
        // Limpar formulário
        editarParecerForm.reset();
        delete editarParecerForm.dataset.parecerId;
        if (editarParecerForm) editarParecerForm.style.display = 'none';
        
        // Recarregar pareceres
        if (peiAtual) {
          await loadPareceresDoPei(peiAtual.id);
        }
      } catch (error) {
        console.error('Erro ao salvar parecer:', error);
        alert('Erro ao salvar parecer: ' + error.message);
      }
    });
  }


  // Filtro de busca
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filtered = peisAdaptativos.filter(pei => {
        const alunoNome = (pei.alunoNome || '').toLowerCase();
        const componente = (pei.componenteNome || '').toLowerCase();
        return alunoNome.includes(searchTerm) || componente.includes(searchTerm);
      });
      renderPeis(filtered);
    });
  }

  // Fechar detalhes
  if (fecharBtn) {
    fecharBtn.addEventListener('click', () => {
      peiDetalhes.classList.add('hidden');
      peiAtual = null;
      pareceresDoPei = [];
    });
  }

  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', () => {
      if (editarParecerForm) {
        editarParecerForm.reset();
        delete editarParecerForm.dataset.parecerId;
        editarParecerForm.style.display = 'none';
      }
    });
  }

  // Carregar PEIs ao iniciar
  loadPeisAdaptativos();
});
