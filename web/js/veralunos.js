document.addEventListener('DOMContentLoaded', async function() {
  let user = null;
  try {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      alert('Você precisa estar logado para visualizar os alunos.');
      window.location.href = 'index.html';
      return;
    }
    user = JSON.parse(userStr);
    
    const userNameEl = document.getElementById('userName');
    const userSiapeEl = document.getElementById('userSiape');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (user) {
      if (userNameEl) {
        userNameEl.textContent = `Prof. ${user.nome || 'Usuário'}`;
        console.log('veralunos - Nome exibido:', userNameEl.textContent);
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
        userNameEl.textContent = 'Prof. Não logado';
      }
    }
  } catch (e) {
    console.error('Erro ao parsear usuário:', e);
    alert('Erro ao carregar dados do usuário.');
    window.location.href = 'index.html';
    return;
  }

  await carregarAlunos();

  const modal = document.getElementById('modalAluno');
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.onclick = function() {
      if (modal) modal.style.display = 'none';
    };
  }
  if (window.onclick) {
    window.onclick = function(event) {
      if (event.target == modal && modal) {
        modal.style.display = 'none';
      }
    };
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

async function carregarAlunos() {
  try {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    const response = await fetch(`${baseUrl}?recurso=alunos`);
    
    const text = await response.text();
    let alunos;
    
    // Tentar fazer parse do JSON diretamente
    try {
      alunos = JSON.parse(text.trim());
    } catch (e) {
      // Se falhar, tentar encontrar o JSON válido
      const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
      if (jsonStart > 0) {
        try {
          alunos = JSON.parse(text.substring(jsonStart).trim());
        } catch (e2) {
          console.error('Erro ao fazer parse do JSON:', e2);
          console.error('Texto recebido (primeiros 500 chars):', text.substring(0, 500));
          throw new Error('Resposta inválida do servidor');
        }
      } else {
        console.error('Erro ao fazer parse do JSON:', e);
        console.error('Texto recebido (primeiros 500 chars):', text.substring(0, 500));
        throw new Error('Resposta inválida do servidor');
      }
    }
    
    if (!response.ok) {
      throw new Error(alunos.error || 'Erro ao carregar alunos');
    }
    
    const alunosList = document.getElementById('alunosList');
    
    if (!alunosList) {
      console.error('Elemento alunosList não encontrado');
      return;
    }
    
    alunosList.innerHTML = '';

    if (!Array.isArray(alunos) || alunos.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-alunos';
      li.innerHTML = '<p>Nenhum aluno cadastrado no sistema.</p>';
      alunosList.appendChild(li);
      return;
    }

    alunos.forEach(aluno => {
      const li = document.createElement('li');
      li.className = 'aluno-item';
      li.innerHTML = `
        <div class="aluno-info">
          <strong>${aluno.nome || 'N/A'}</strong>
          <span class="aluno-details">Matrícula: ${aluno.matricula || 'N/A'} - Curso: ${aluno.curso || 'N/A'}</span>
        </div>
        <button class="btn-detalhes" onclick="verDetalhes(${aluno.id})">Ver Detalhes</button>
      `;
      alunosList.appendChild(li);
    });
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    const alunosList = document.getElementById('alunosList');
    if (alunosList) {
      alunosList.innerHTML = '<li class="error"><p>Erro ao carregar alunos: ' + error.message + '</p></li>';
    }
  }
}

async function verDetalhes(alunoId) {
  try {
    const baseUrl = window.location.origin + '/trabalhointegrado/index.php';
    const response = await fetch(`${baseUrl}?recurso=alunos&id=${alunoId}`);
    
    const text = await response.text();
    let detalhes;
    
    // Tentar fazer parse do JSON diretamente
    try {
      detalhes = JSON.parse(text.trim());
    } catch (e) {
      // Se falhar, tentar encontrar o JSON válido
      const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
      if (jsonStart > 0) {
        try {
          detalhes = JSON.parse(text.substring(jsonStart).trim());
        } catch (e2) {
          console.error('Erro ao fazer parse do JSON:', e2);
          console.error('Texto recebido (primeiros 500 chars):', text.substring(0, 500));
          throw new Error('Resposta inválida do servidor');
        }
      } else {
        console.error('Erro ao fazer parse do JSON:', e);
        console.error('Texto recebido (primeiros 500 chars):', text.substring(0, 500));
        throw new Error('Resposta inválida do servidor');
      }
    }
    
    if (!response.ok) {
      throw new Error(detalhes.error || 'Erro ao carregar detalhes do aluno');
    }
    const detalhesDiv = document.getElementById('detalhesAluno');
    
    if (!detalhesDiv) {
      console.error('Elemento detalhesAluno não encontrado');
      return;
    }
    
    function renderResponsavelInfo(responsavel) {
      if (!responsavel || typeof responsavel !== 'object') {
        return '<p><strong>Responsável:</strong> N/A - N/A - N/A</p>';
      }
      const nome = responsavel.nome || 'N/A';
      const telefone = responsavel.telefone || 'N/A';
      const email = responsavel.email || 'N/A';
      return `<p><strong>Responsável:</strong> ${nome} - ${telefone} - ${email}</p>`;
    }

    let dataNascFormatada = 'N/A';
    if (detalhes.dataNasc) {
      try {
        const data = new Date(detalhes.dataNasc);
        if (!isNaN(data.getTime())) {
          dataNascFormatada = data.toLocaleDateString('pt-BR');
        }
      } catch (e) {
        dataNascFormatada = detalhes.dataNasc;
      }
    }

    detalhesDiv.innerHTML = `
      <p><strong>Nome:</strong> ${detalhes.nome || 'N/A'}</p>
      <p><strong>Data de Nascimento:</strong> ${dataNascFormatada}</p>
      <p><strong>CPF:</strong> ${detalhes.cpf || 'N/A'}</p>
      <p><strong>Endereço:</strong> ${detalhes.endereco || 'N/A'}</p>
      <p><strong>Telefone:</strong> ${detalhes.telefone || 'N/A'}</p>
      <p><strong>E-mail:</strong> ${detalhes.email || 'N/A'}</p>
      <p><strong>Curso:</strong> ${detalhes.curso || 'N/A'}</p>
      <p><strong>Matrícula:</strong> ${detalhes.matricula || 'N/A'}</p>
      <p><strong>Status da Matrícula:</strong> ${detalhes.matriculaAtiva || 'N/A'}</p>
      <p><strong>Monitoria:</strong> ${detalhes.monitoria || 'N/A'}</p>
      <p><strong>Atendimento Psicopedagógico:</strong> ${detalhes.atendPsico || 'N/A'}</p>
      <p><strong>Necessidades:</strong> ${detalhes.necessidades && detalhes.necessidades.length > 0 ? detalhes.necessidades.join(', ') : 'Nenhuma'}</p>
      <p><strong>Maior de 18:</strong> ${detalhes.maior18 ? 'Sim' : 'Não'}</p>
      ${!detalhes.maior18 ? renderResponsavelInfo(detalhes.responsavel) : ''}
    `;

    const modal = document.getElementById('modalAluno');
    if (modal) {
      modal.style.display = 'block';
    }
  } catch (error) {
    console.error('Erro ao carregar detalhes do aluno:', error);
    alert('Erro ao carregar detalhes do aluno: ' + error.message);
  }
}
