document.addEventListener('DOMContentLoaded', async () => {
  let peis = [];
  let peiAtual = null;
  
  const peisList = document.getElementById('peisList');
  const peiDetalhes = document.getElementById('peiDetalhes');
  const peiNome = document.getElementById('peiNome');
  const peiComponente = document.getElementById('peiComponente');
  const peiDocente = document.getElementById('peiDocente');
  const peiEmenta = document.getElementById('peiEmenta');
  const peiObjetivoGeral = document.getElementById('peiObjetivoGeral');
  const peiObjetivosEspecificos = document.getElementById('peiObjetivosEspecificos');
  const peiConteudos = document.getElementById('peiConteudos');
  const peiMetodologia = document.getElementById('peiMetodologia');
  const peiAvaliacao = document.getElementById('peiAvaliacao');
  const peiCriadoEm = document.getElementById('peiCriadoEm');
  const comentariosList = document.getElementById('comentariosList');
  const novoComentario = document.getElementById('novoComentario');
  const adicionarComentarioBtn = document.getElementById('adicionarComentario');
  const searchInput = document.getElementById('searchPEI');
  const fecharBtn = document.getElementById('fecharDetalhes');

  let user = null;
  try {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      alert('Você precisa estar logado para visualizar os PEIs.');
      window.location.href = 'index.html';
      return;
    }
    user = JSON.parse(userStr);
    
    let prefixo = 'Usuário';
    if (user && user.funcao) {
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
  } catch (e) {
    console.error('Erro ao parsear usuário:', e);
    alert('Erro ao carregar dados do usuário.');
    window.location.href = 'index.html';
    return;
  }

  function getFuncionarioNome() {
    if (user && user.nome) {
      return user.nome;
    }
    const userInfoSpan = document.querySelector('.user-info span');
    return userInfoSpan ? userInfoSpan.textContent.replace('Funcionário: ', '') : 'Funcionário Desconhecido';
  }

  async function loadPeis() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=peis-adaptativos`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao carregar PEIs' }));
        throw new Error(errorData.error || 'Erro ao carregar PEIs');
      }
      
      const peisData = await response.json();
      
      peis = peisData.map(pei => {
        let descricaoParsed = {};
        if (pei.descricao) {
          try {
            descricaoParsed = JSON.parse(pei.descricao);
          } catch (e) {
            console.warn('Erro ao parsear descrição do PEI:', pei.id, e);
            descricaoParsed = {};
          }
        }
        
        return {
          id: pei.id,
          alunoNome: pei.alunoNome || 'Não informado',
          componenteNome: pei.componenteNome || descricaoParsed.componente || 'Não informado',
          docente: descricaoParsed.docente || 'Não informado',
          ementaComponente: descricaoParsed.ementa_componente || descricaoParsed.ementa || 'Não informado',
          objetivoGeral: descricaoParsed.objetivo_geral || 'Não informado',
          objetivosEspecificos: descricaoParsed.objetivos_especificos || 'Não informado',
          conteudos: descricaoParsed.conteudos || 'Não informado',
          metodologia: descricaoParsed.metodologia || 'Não informado',
          avaliacao: descricaoParsed.avaliacao || 'Não informado',
          descricao: descricaoParsed.descricao || '',
          periodo: pei.periodo || 'Não informado',
          criado_em: pei.criado_em || null,
          comentarios: [] 
        };
      });
      
      renderPeis(peis);
    } catch (error) {
      console.error('Erro ao carregar PEIs:', error);
      if (peisList) {
        peisList.innerHTML = '<li style="text-align: center; padding: 20px; color: red;">Erro ao carregar PEIs: ' + error.message + '</li>';
      }
    }
  }

  function renderPeis(filteredPeis = peis) {
    if (!peisList) return;
    
    peisList.innerHTML = '';
    
    if (filteredPeis.length === 0) {
      const li = document.createElement('li');
      li.style.textAlign = 'center';
      li.style.padding = '20px';
      li.textContent = 'Nenhum PEI adaptativo encontrado.';
      peisList.appendChild(li);
      return;
    }
    
    filteredPeis.forEach(pei => {
      const li = document.createElement('li');
      li.style.cursor = 'pointer';
      li.style.padding = '15px';
      li.style.marginBottom = '10px';
      li.style.backgroundColor = '#f9f9f9';
      li.style.borderRadius = '8px';
      li.style.border = '1px solid #ddd';
      li.style.transition = 'background-color 0.3s';
      
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${pei.alunoNome}</strong> - ${pei.componenteNome}
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
              Docente: ${pei.docente}
            </div>
          </div>
        </div>
      `;
      
      li.onclick = () => mostrarDetalhes(pei);
      li.onmouseenter = () => li.style.backgroundColor = '#eef5ef';
      li.onmouseleave = () => li.style.backgroundColor = '#f9f9f9';
      
      peisList.appendChild(li);
    });
  }

  async function mostrarDetalhes(pei) {
    if (!peiDetalhes || !peiNome || !peiDocente) return;
    
    peiAtual = pei;
    peiNome.textContent = pei.alunoNome || 'Não informado';
    if (peiComponente) {
      peiComponente.textContent = pei.componenteNome || 'Não informado';
    }
    peiDocente.textContent = pei.docente || 'Não informado';
    peiEmenta.textContent = pei.ementaComponente || 'Não informado';
    peiObjetivoGeral.textContent = pei.objetivoGeral || 'Não informado';
    peiObjetivosEspecificos.textContent = pei.objetivosEspecificos || 'Não informado';
    peiConteudos.textContent = pei.conteudos || 'Não informado';
    peiMetodologia.textContent = pei.metodologia || 'Não informado';
    peiAvaliacao.textContent = pei.avaliacao || 'Não informado';
    
    if (peiCriadoEm && pei.criado_em) {
      try {
        const data = new Date(pei.criado_em);
        if (!isNaN(data.getTime())) {
          peiCriadoEm.textContent = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else {
          peiCriadoEm.textContent = pei.criado_em;
        }
      } catch (e) {
        peiCriadoEm.textContent = pei.criado_em || 'Não informado';
      }
    } else if (peiCriadoEm) {
      peiCriadoEm.textContent = 'Não informado';
    }
    
    await carregarComentarios(pei.id);
    peiDetalhes.classList.remove('hidden');
    
    peiDetalhes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
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
          throw new Error('Resposta inválida do servidor');
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
    
    const funcionarioAtual = getFuncionarioNome();
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
        <div>${comentario.comentario || comentario.texto || ''}</div>
      `;
      li.appendChild(textoDiv);
      
      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn-excluir';
      btnExcluir.textContent = 'Excluir';
      btnExcluir.style.marginLeft = '10px';
      btnExcluir.style.marginTop = '5px';
      btnExcluir.onclick = () => excluirComentario(comentario.id);
      li.appendChild(btnExcluir);
      
      comentariosList.appendChild(li);
    });
  }

  async function excluirComentario(comentarioId) {
    if (!confirm('Deseja realmente excluir este comentário?')) {
      return;
    }
    
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=comentarios-peiadaptativo&id=${comentarioId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao excluir comentário' }));
        throw new Error(errorData.error || 'Erro ao excluir comentário');
      }
      
      if (peiAtual && peiAtual.id) {
        await carregarComentarios(peiAtual.id);
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário: ' + error.message);
    }
  }

  async function adicionarComentario() {
    if (!novoComentario || !peiAtual) return;
    
    const comentarioTexto = novoComentario.value.trim();
    if (!comentarioTexto) {
      alert('Por favor, digite um comentário.');
      return;
    }
    
    if (!peiAtual || !peiAtual.id) {
      alert('Erro: PEI não identificado.');
      return;
    }
    
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      alert('Você precisa estar logado para adicionar comentários.');
      return;
    }
    
    let user = null;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Erro ao parsear usuário:', e);
      alert('Erro ao carregar dados do usuário.');
      return;
    }
    
    if (!user || !user.id) {
      alert('Erro: usuário não identificado.');
      return;
    }
    
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
      const response = await fetch(`${baseUrl}?recurso=comentarios-peiadaptativo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pei_adaptativo_id: peiAtual.id,
          comentario: comentarioTexto,
          usuario_id: user.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao salvar comentário' }));
        throw new Error(errorData.error || 'Erro ao salvar comentário');
      }
      
      novoComentario.value = '';
      
      await carregarComentarios(peiAtual.id);
      
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário: ' + error.message);
    }
  }

  function filtrarPeis() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = peis.filter(pei => 
      (pei.alunoNome && pei.alunoNome.toLowerCase().includes(searchTerm)) ||
      (pei.componenteNome && pei.componenteNome.toLowerCase().includes(searchTerm)) ||
      (pei.docente && pei.docente.toLowerCase().includes(searchTerm))
    );
    renderPeis(filtered);
  }

  if (fecharBtn) {
    fecharBtn.addEventListener('click', () => {
      if (peiDetalhes) {
        peiDetalhes.classList.add('hidden');
      }
      peiAtual = null;
    });
  }

  if (adicionarComentarioBtn) {
    adicionarComentarioBtn.addEventListener('click', adicionarComentario);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filtrarPeis);
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

  await loadPeis();
});
