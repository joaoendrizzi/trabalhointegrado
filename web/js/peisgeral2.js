document.addEventListener('DOMContentLoaded', async () => {
  let user = null;
  try {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      alert('Você precisa estar logado para visualizar os PEIs.');
      window.location.href = 'index.html';
      return;
    }
    user = JSON.parse(userStr);
    
    const userInfoSpan = document.querySelector('.user-info span');
    if (userInfoSpan && user) {
      userInfoSpan.textContent = `Professor: ${user.nome || 'Usuário'}`;
    }
  } catch (e) {
    console.error('Erro ao parsear usuário:', e);
    alert('Erro ao carregar dados do usuário.');
    window.location.href = 'index.html';
    return;
  }

  await loadPeis();

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

async function loadPeis() {
  const peisList = document.getElementById('peisList');
  if (!peisList) {
    console.error('Lista de PEIs não encontrada!');
    return;
  }

  try {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    const response = await fetch(`${baseUrl}?recurso=peis-gerais`);
    const text = await response.text();
    let peis;
    try {
      peis = JSON.parse(text.trim());
    } catch (e) {
      const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
      if (jsonStart > 0) {
        peis = JSON.parse(text.substring(jsonStart).trim());
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    }
    if (!response.ok) {
      throw new Error(peis.error || 'Erro ao carregar PEIs');
    }
    
    peisList.innerHTML = '';
    
    if (!Array.isArray(peis) || peis.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-peis';
      li.innerHTML = '<p>Nenhum PEI Geral cadastrado ainda.</p>';
      peisList.appendChild(li);
      return;
    }
    
    peis.forEach((pei, index) => {
      const li = document.createElement('li');
      li.className = 'pei-item';
      
      const alunoNome = pei.alunoNome || `Aluno ID: ${pei.aluno_id || 'N/A'}`;
      const dificuldades = pei.dificuldades || 'Não informado';
      const habilidades = pei.habilidades || 'Não informado';
      const historico = pei.historico || 'Não informado';
      const historicoNoIFRS = pei.historicoNoIFRS || 'Não informado';
      const estrategiasDeEnsino = pei.estrategiasDeEnsino || 'Não informado';
      
      li.innerHTML = `
        <div class="pei-header">
          <strong>PEI ${index + 1} - ${alunoNome}</strong>
          <button class="detalhes-btn" data-index="${index}">Detalhes</button>
        </div>
        <div class="pei-detalhes" id="detalhes-${index}" style="display: none;">
          <div class="detalhe-item">
            <p><strong>Dificuldades:</strong></p>
            <p>${dificuldades}</p>
          </div>
          <div class="detalhe-item">
            <p><strong>Habilidades:</strong></p>
            <p>${habilidades}</p>
          </div>
          <div class="detalhe-item">
            <p><strong>Histórico:</strong></p>
            <p>${historico}</p>
          </div>
          <div class="detalhe-item">
            <p><strong>Histórico no IF:</strong></p>
            <p>${historicoNoIFRS}</p>
          </div>
          <div class="detalhe-item">
            <p><strong>Estratégias de Ensino:</strong></p>
            <p>${estrategiasDeEnsino}</p>
          </div>
          <div class="detalhe-item" style="margin-top: 15px;">
            <button class="btn-pdf baixar-pdf-btn" data-index="${index}">
              <i class="fas fa-download"></i> Baixar PDF
            </button>
          </div>
        </div>
      `;

      const btn = li.querySelector('.detalhes-btn');
      const detalhes = li.querySelector('.pei-detalhes');

      btn.addEventListener('click', () => {
        const visivel = detalhes.style.display === 'block';
        detalhes.style.display = visivel ? 'none' : 'block';
        btn.textContent = visivel ? 'Detalhes' : 'Fechar';
      });
      
      const baixarPDFBtn = li.querySelector('.baixar-pdf-btn');
      if (baixarPDFBtn) {
        baixarPDFBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          if (typeof gerarPDFPEIGeral === 'function') {
            gerarPDFPEIGeral(pei);
          } else {
            alert('Erro ao gerar PDF. Certifique-se de que o script gerarpdf.js foi carregado.');
          }
        });
      }

      peisList.appendChild(li);
    });
  } catch (error) {
    console.error('Erro ao carregar PEIs:', error);
    peisList.innerHTML = '<li class="error"><p>Erro ao carregar PEIs: ' + error.message + '</p></li>';
  }
}
