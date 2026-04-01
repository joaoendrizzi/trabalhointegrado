document.addEventListener('DOMContentLoaded', () => {
  let peis = [];

  const peisList = document.getElementById('peisList');
  const detalhesSection = document.getElementById('detalhesSection');
  const fecharBtn = document.getElementById('fecharDetalhes');
  const searchInput = document.getElementById('searchPEI');
  const peiNomeSpan = document.getElementById('peiNome');
  const peiComponenteSpan = document.getElementById('peiComponente');
  const peiDocenteSpan = document.getElementById('peiDocente');
  const peiEmentaSpan = document.getElementById('peiEmenta');
  const peiObjetivoGeralSpan = document.getElementById('peiObjetivoGeral');
  const peiObjetivosEspecificosSpan = document.getElementById('peiObjetivosEspecificos');
  const peiConteudosSpan = document.getElementById('peiConteudos');
  const peiMetodologiaSpan = document.getElementById('peiMetodologia');
  const peiAvaliacaoSpan = document.getElementById('peiAvaliacao');
  const comentariosList = document.getElementById('comentariosList');
  const novoComentario = document.getElementById('novoComentario');
  const adicionarComentarioBtn = document.getElementById('adicionarComentario');
  const editarPEIBtn = document.getElementById('editarPEIBtn');
  
  let peiAtual = null; 

  const addPEIBtn = document.getElementById('addPEIBtn');
  const addPEIModal = document.getElementById('addPEIModal');
  const addPEIForm = document.getElementById('addPEIForm');
  const closeAddModal = document.querySelector('.close-add-modal');
  const modalTitle = document.getElementById('modalTitle');
  const saveButton = document.getElementById('saveButton');
  
  let peisCounter = 0;
  let peiEditando = null; 

  function carregarUsuario() {
    try {
      const userStr = localStorage.getItem('usuario');
      if (!userStr) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
          userNameEl.textContent = 'Professor: Não logado';
        }
        return null;
      }
      
      const usuario = JSON.parse(userStr);
      
      const userNameEl = document.getElementById('userName');
      if (userNameEl && usuario) {
        userNameEl.textContent = `Professor: ${usuario.nome || 'Usuário'}`;
      }
      
      const docenteField = document.getElementById('docente');
      if (docenteField && usuario) {
        docenteField.value = usuario.nome || '';
      }
      
      return usuario;
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      const userNameEl = document.getElementById('userName');
      if (userNameEl) {
        userNameEl.textContent = 'Professor: Erro ao carregar';
      }
      return null;
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
          option.value = aluno.id || ''; 
          option.setAttribute('data-aluno-id', aluno.id || '');
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

  async function loadCursos() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=cursos`);
      if (!response.ok) {
        const cursoSelect = document.getElementById('curso');
        if (cursoSelect) {
          cursoSelect.innerHTML = '<option value="">Erro ao carregar cursos</option>';
        }
        console.error('Erro ao carregar cursos');
        return;
      }
      const cursos = await response.json();
      const cursoSelect = document.getElementById('curso');
      
      if (cursoSelect && Array.isArray(cursos)) {
        cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
        cursos.forEach(curso => {
          const option = document.createElement('option');
          option.value = curso.id || '';
          option.textContent = `${curso.nome} (${curso.tipo || 'Superior'})`;
          cursoSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      const cursoSelect = document.getElementById('curso');
      if (cursoSelect) {
        cursoSelect.innerHTML = '<option value="">Erro ao carregar cursos</option>';
      }
    }
  }

  async function loadComponentes() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=componentes`);
      if (!response.ok) {
        const componenteSelect = document.getElementById('componente');
        if (componenteSelect) {
          componenteSelect.innerHTML = '<option value="">Erro ao carregar componentes</option>';
        }
        console.error('Erro ao carregar componentes');
        return;
      }
      const componentes = await response.json();
      const componenteSelect = document.getElementById('componente');
      const ementaTextarea = document.getElementById('ementaComponente');
      
      if (componenteSelect && Array.isArray(componentes)) {
        componenteSelect.innerHTML = '<option value="">Selecione um componente</option>';
        componentes.forEach(componente => {
          const option = document.createElement('option');
          option.value = componente.id || '';
          option.setAttribute('data-componente-id', componente.id || '');
          option.setAttribute('data-ementa', componente.ementa || '');
          option.textContent = componente.nome || '';
          componenteSelect.appendChild(option);
        });

        componenteSelect.addEventListener('change', function() {
          const selectedOption = this.options[this.selectedIndex];
          if (selectedOption && selectedOption.value) {
            const ementa = selectedOption.getAttribute('data-ementa') || '';
            if (ementaTextarea) {
              ementaTextarea.value = ementa;
            }
          } else {
            if (ementaTextarea) {
              ementaTextarea.value = '';
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
      const componenteSelect = document.getElementById('componente');
      if (componenteSelect) {
        componenteSelect.innerHTML = '<option value="">Erro ao carregar componentes</option>';
      }
    }
  }

  async function carregarPEIs() {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    
    try {
      const response = await fetch(`${baseUrl}?recurso=peis-adaptativos`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao carregar PEIs' }));
        throw new Error(errorData.error || 'Erro ao carregar PEIs');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Dados inválidos recebidos:', data);
        throw new Error('Resposta do servidor inválida');
      }
      
      peis = data.map(pei => {
          
          let descricaoParsed = {};
          if (pei.descricao) {
            try {
              descricaoParsed = JSON.parse(pei.descricao);
            } catch (e) {
              descricaoParsed = {};
            }
          }
          
          let periodoValue = null;
          if (pei.periodo !== null && pei.periodo !== undefined && pei.periodo !== '') {
            periodoValue = typeof pei.periodo === 'string' ? pei.periodo.trim() : String(pei.periodo).trim();
            if (periodoValue === '') {
              periodoValue = null;
            }
          }
          
          return {
            id: pei.id,
            aluno_id: pei.aluno_id || null,
            alunoNome: pei.alunoNome || `Aluno ID: ${pei.aluno_id || 'N/A'}`,
            componente_id: pei.componente_id || null,
            componente: pei.componenteNome || pei.componente || 'Não informado',
            componenteNome: pei.componenteNome || pei.componente || null,
            docente: descricaoParsed.docente || pei.docente || 'Não informado',
            ementaComponente: descricaoParsed.ementa || pei.ementa || descricaoParsed.ementa_componente || 'Não informado',
            objetivoGeral: descricaoParsed.objetivo_geral || pei.objetivo_geral || 'Não informado',
            objetivosEspecificos: descricaoParsed.objetivos_especificos || pei.objetivos_especificos || 'Não informado',
            conteudos: descricaoParsed.conteudos || pei.conteudos || 'Não informado',
            metodologia: descricaoParsed.metodologia || pei.metodologia || 'Não informado',
            avaliacao: descricaoParsed.avaliacao || pei.avaliacao || 'Não informado',
            periodo: pei.periodo || null, 
            periodoValue: periodoValue, 
            criado_em: pei.criado_em || null,
            descricao: descricaoParsed.descricao || pei.descricao || '', 
            descricaoRaw: pei.descricao || '', 
            dataEnvio: descricaoParsed.data_envio || descricaoParsed.dataEnvio || pei.data_envio || pei.criado_em || '',
            comentarios: [] 
          };
      });
      peisCounter = peis.length > 0 ? Math.max(...peis.map(p => p.id)) : 0;
      renderPeis(peis);
    } catch (error) {
      console.error('Erro ao carregar PEIs:', error);
      if (peisList) {
        peisList.innerHTML = '<li class="error">Erro ao carregar PEIs: ' + error.message + '</li>';
      }
      alert('Erro ao carregar PEIs: ' + error.message);
    }
  }

  function getFuncionarioNome() {
    const userInfoSpan = document.querySelector('.user-info span');
    return userInfoSpan ? userInfoSpan.textContent.split(': ')[1] : 'Professor Desconhecido';
  }

  function renderPeis(peisToRender) {
    peisList.innerHTML = '';
    peisToRender.forEach(pei => {
      const li = document.createElement('li');
      li.className = 'pei-item'; 
      li.innerHTML = `
        <span><strong>${pei.alunoNome}</strong> - ${pei.componente}</span>
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
  
  function renderComentarios(comentarios) {
    if (!comentariosList) return;
    
    comentariosList.innerHTML = '';
    
    if (!comentarios || comentarios.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nenhum comentário ainda.';
      li.style.textAlign = 'center';
      li.style.padding = '10px';
      li.style.color = '#666';
      comentariosList.appendChild(li);
      return;
    }
    
    const userStr = localStorage.getItem('usuario');
    let userIdAtual = null;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userIdAtual = userObj.id;
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    }
    
    comentarios.forEach((comentario) => {
      const li = document.createElement('li');
      li.style.marginBottom = '15px';
      li.style.padding = '10px';
      li.style.backgroundColor = '#f9f9f9';
      li.style.borderRadius = '6px';
      
      let dataFormatada = 'Data não disponível';
      if (comentario.criado_em) {
        try {
          const data = new Date(comentario.criado_em);
          if (!isNaN(data.getTime())) {
            dataFormatada = data.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } else {
            dataFormatada = comentario.criado_em;
          }
        } catch (e) {
          dataFormatada = comentario.criado_em;
        }
      }
      
      const textoDiv = document.createElement('div');
      textoDiv.className = 'comentario-texto';
      textoDiv.innerHTML = `
        <div style="margin-bottom: 5px;">
          <strong>${comentario.autor || comentario.usuario_nome || 'Desconhecido'}</strong>
          <span style="font-size: 0.85rem; color: #666; margin-left: 10px;">${dataFormatada}</span>
        </div>
        <div style="margin-top: 5px;">${comentario.comentario || ''}</div>
      `;
      li.appendChild(textoDiv);
      
      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn-excluir';
      btnExcluir.textContent = 'Excluir';
      btnExcluir.style.marginTop = '5px';
      btnExcluir.onclick = () => excluirComentario(comentario.id);
      li.appendChild(btnExcluir);
      
      comentariosList.appendChild(li);
    });
  }

  async function mostrarDetalhes(pei) {
    peiAtual = pei;
    peiNomeSpan.textContent = pei.alunoNome;
    peiComponenteSpan.textContent = pei.componente;
    peiDocenteSpan.textContent = pei.docente;
    peiEmentaSpan.textContent = pei.ementaComponente;
    peiObjetivoGeralSpan.textContent = pei.objetivoGeral;
    peiObjetivosEspecificosSpan.textContent = pei.objetivosEspecificos;
    peiConteudosSpan.textContent = pei.conteudos;
    peiMetodologiaSpan.textContent = pei.metodologia;
    peiAvaliacaoSpan.textContent = pei.avaliacao;

    await carregarComentarios(pei.id);
    detalhesSection.classList.remove('hidden');
    detalhesSection.scrollIntoView({ behavior: 'smooth' });
    
    const baixarPDFBtn = document.getElementById('baixarPDF');
    if (baixarPDFBtn) {
      baixarPDFBtn.onclick = () => {
        if (typeof gerarPDFPEIAdaptativo === 'function' && peiAtual) {
          gerarPDFPEIAdaptativo(peiAtual);
        } else {
          alert('Erro ao gerar PDF. Certifique-se de que o script gerarpdf.js foi carregado.');
        }
      };
    }
  }
  
  async function editarOuVerPEI(id) {
    const pei = peis.find(p => p.id === id);
    
    if (!pei) {
      console.error('PEI não encontrado:', id);
      return;
    }
    
    await mostrarDetalhes(pei);
  }

  async function excluirComentario(comentarioId) {
    if (!comentarioId) {
      console.error('ID do comentário não fornecido');
      return;
    }
    
    if (!confirm('Deseja realmente excluir este comentário?')) {
      return;
    }
    
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=comentarios-peiadaptativo&id=${comentarioId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir comentário' }));
        throw new Error(errorData.error || 'Erro ao excluir comentário');
      }
      
      if (peiAtual) {
        await carregarComentarios(peiAtual.id);
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário: ' + error.message);
    }
  }

  async function adicionarComentario() {
    const comentarioTexto = novoComentario ? novoComentario.value.trim() : '';
    if (!comentarioTexto || !peiAtual) {
      alert('Por favor, digite um comentário.');
      return;
    }
    
    try {
      const userStr = localStorage.getItem('usuario');
      if (!userStr) {
        alert('Erro: usuário não logado.');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!user.id) {
        alert('Erro: ID do usuário não encontrado.');
        return;
      }
      
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=comentarios-peiadaptativo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pei_adaptativo_id: peiAtual.id,
          comentario: comentarioTexto,
          usuario_id: user.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao adicionar comentário' }));
        throw new Error(errorData.error || 'Erro ao adicionar comentário');
      }
      
      if (novoComentario) {
        novoComentario.value = '';
      }
      
      await carregarComentarios(peiAtual.id);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário: ' + error.message);
    }
  }
  
  async function carregarComentarios(peiId) {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=comentarios-peiadaptativo&pei_adaptativo_id=${peiId}`);
      const text = await response.text();
      let comentariosData;
      try {
        comentariosData = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          comentariosData = JSON.parse(text.substring(jsonStart).trim());
        } else {
          console.error('Erro ao carregar comentários:', e);
          renderComentarios([]);
          return;
        }
      }
      if (!response.ok) {
        throw new Error(comentariosData.error || 'Erro ao carregar comentários');
      }
      const comentarios = Array.isArray(comentariosData) ? comentariosData : [];
      
      const comentariosFormatados = comentarios.map(c => ({
        id: c.id,
        autor: c.usuario_nome || 'Desconhecido',
        comentario: c.comentario || '',
        criado_em: c.criado_em || null,
        usuario_id: c.usuario_id
      }));
      
      if (peiAtual) {
        peiAtual.comentarios = comentariosFormatados;
      }
      renderComentarios(comentariosFormatados);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      renderComentarios([]);
    }
  }

  function fecharDetalhes() {
    detalhesSection.classList.add('hidden');
    peiAtual = null;
  }
  
  function filtrarPeis() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = peis.filter(pei => pei.alunoNome.toLowerCase().includes(searchTerm) || pei.componente.toLowerCase().includes(searchTerm));
    renderPeis(filtered);
  }

  function openModal(mode, peiId = null) {
    addPEIForm.reset();
    peiEditando = peiId;

    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        const docenteField = document.getElementById('docente');
        if (docenteField && usuario && usuario.nome) {
          docenteField.value = usuario.nome;
        }
      } catch (e) {
        console.error('Erro ao parsear usuário no openModal:', e);
      }
    }

    if (mode === 'add') {
      modalTitle.textContent = 'Cadastrar Novo PEI Adaptativo';
      saveButton.textContent = 'Salvar PEI';
      const alunoSelect = document.getElementById('alunoNome');
      if (alunoSelect) {
        alunoSelect.value = '';
      }
      const componenteSelect = document.getElementById('componente');
      if (componenteSelect) {
        componenteSelect.value = '';
      }
      const ementaTextarea = document.getElementById('ementaComponente');
      if (ementaTextarea) {
        ementaTextarea.value = '';
      }
      const dataEnvioInput = document.getElementById('dataenvio');
      if (dataEnvioInput) {
        dataEnvioInput.value = '';
      }
    } else if (mode === 'edit' && peiId !== null) {
      modalTitle.textContent = 'Editar PEI Adaptativo';
      saveButton.textContent = 'Salvar Edição';
      
      const pei = peis.find(p => p.id === peiId);
      if (pei) {
        const alunoSelect = document.getElementById('alunoNome');
        if (alunoSelect && pei.alunoNome) {
          const options = Array.from(alunoSelect.options);
          const option = options.find(opt => opt.textContent === pei.alunoNome);
          if (option) {
            alunoSelect.value = option.value;
          }
        }
        
        const componenteSelect = document.getElementById('componente');
        if (componenteSelect) {
          if (pei.componente_id) {
            componenteSelect.value = pei.componente_id;
            componenteSelect.dispatchEvent(new Event('change'));
          } else if (pei.componenteNome) {
            const options = Array.from(componenteSelect.options);
            const option = options.find(opt => opt.textContent === pei.componenteNome);
            if (option) {
              componenteSelect.value = option.value;
              componenteSelect.dispatchEvent(new Event('change'));
            }
          }
        }
        
        document.getElementById('ementaComponente').value = pei.ementaComponente || '';
        document.getElementById('objetivoGeral').value = pei.objetivoGeral || '';
        document.getElementById('objetivosEspecificos').value = pei.objetivosEspecificos || '';
        document.getElementById('conteudos').value = pei.conteudos || '';
        document.getElementById('metodologia').value = pei.metodologia || '';
        document.getElementById('avaliacao').value = pei.avaliacao || '';
        
        const cursoSelect = document.getElementById('curso');
        if (cursoSelect) {
          if (pei.curso_id) {
            cursoSelect.value = pei.curso_id;
          } else if (pei.alunoCursoId) {
            cursoSelect.value = pei.alunoCursoId;
          }
        }
        
        
      }
    }
    addPEIModal.style.display = 'flex';
  }
  
  function adicionarPEI() {
    fecharDetalhes();
    openModal('add');
  }

  function fecharAddModal() {
    addPEIModal.style.display = 'none';
    addPEIForm.reset();
    peiEditando = null;
    document.getElementById('dataenvio').value = '';
  }
  
  async function salvarPEI(e) {
    e.preventDefault();

    const alunoSelect = document.getElementById('alunoNome');
    const alunoId = alunoSelect ? alunoSelect.value.trim() : '';
    const componenteSelect = document.getElementById('componente');
    const componenteId = componenteSelect ? componenteSelect.value.trim() : '';
    const componenteNome = componenteSelect && componenteSelect.selectedIndex >= 0 
      ? componenteSelect.options[componenteSelect.selectedIndex]?.textContent || '' 
      : '';
    const cursoSelect = document.getElementById('curso');
    const cursoId = cursoSelect ? cursoSelect.value.trim() : '';
    const docente = document.getElementById('docente') ? document.getElementById('docente').value.trim() : '';
    
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const dataEnvioFormatada = `${ano}-${mes}-${dia}`;
    
    const descricaoObj = {
      docente: docente,
      componente: componenteNome,
      ementa_componente: document.getElementById('ementaComponente').value.trim(),
      objetivo_geral: document.getElementById('objetivoGeral').value.trim(),
      objetivos_especificos: document.getElementById('objetivosEspecificos').value.trim(),
      conteudos: document.getElementById('conteudos').value.trim(),
      metodologia: document.getElementById('metodologia').value.trim(),
      avaliacao: document.getElementById('avaliacao').value.trim(),
      data_envio: dataEnvioFormatada 
    };

    if (!alunoId) {
      alert('Por favor, selecione um aluno.');
      return;
    }
    
    if (!componenteId || !docente || !cursoId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dadosBackend = {
      aluno_id: parseInt(alunoId),
      componente_id: componenteId && componenteId !== '' ? parseInt(componenteId) : null,
      curso_id: cursoId && cursoId !== '' ? parseInt(cursoId) : null,
      descricao: JSON.stringify(descricaoObj)
    };

    if (!dadosBackend.componente_id) {
      alert('Por favor, selecione um componente curricular.');
      return;
    }

    if (!dadosBackend.curso_id) {
      alert('Por favor, selecione um curso.');
      return;
    }

    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      let url = `${baseUrl}?recurso=peis-adaptativos`;
      let method = 'POST';

      if (peiEditando !== null) {
        url = `${baseUrl}?recurso=peis-adaptativos&id=${peiEditando}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosBackend)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao salvar PEI' }));
        throw new Error(errorData.error || 'Erro ao salvar PEI');
      }

      const alunoSelectOption = alunoSelect.options[alunoSelect.selectedIndex];
      const alunoNome = alunoSelectOption ? alunoSelectOption.textContent : 'Aluno';
      
      alert(`PEI ${peiEditando !== null ? 'atualizado' : 'adicionado'} com sucesso!`);
      
      carregarPEIs();
      fecharAddModal();
    } catch (error) {
      console.error('Erro ao salvar PEI:', error);
      alert('Erro ao salvar PEI: ' + error.message);
    }
  }
  
  async function deletarPEI(id) {
    if (confirm('Tem certeza que deseja excluir permanentemente este PEI?')) {
      try {
        const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
        const response = await fetch(`${baseUrl}?recurso=peis-adaptativos&id=${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir PEI' }));
          throw new Error(errorData.error || 'Erro ao excluir PEI');
        }

        if (peiAtual && peiAtual.id === id) {
          fecharDetalhes();
        }
        
        await carregarPEIs();
        alert('PEI excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir PEI:', error);
        alert('Erro ao excluir PEI: ' + error.message);
      }
    }
  }

  fecharBtn.addEventListener('click', fecharDetalhes);
  searchInput.addEventListener('input', filtrarPeis);
  adicionarComentarioBtn.addEventListener('click', adicionarComentario);
  
  if (editarPEIBtn) {
    editarPEIBtn.addEventListener('click', () => {
      if (peiAtual && peiAtual.id) {
        openModal('edit', peiAtual.id);
      } else {
        alert('Erro: PEI não encontrado para edição.');
      }
    });
  }

  addPEIBtn.addEventListener('click', adicionarPEI);
  closeAddModal.addEventListener('click', fecharAddModal);
  addPEIForm.addEventListener('submit', salvarPEI);
  window.addEventListener('click', (e) => {
    if (e.target === addPEIModal) {
      fecharAddModal();
    }
  });

  const usuario = carregarUsuario();
  loadAlunos(); 
  loadComponentes();
  loadCursos();
  carregarPEIs();

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