document.addEventListener('DOMContentLoaded', async () => {
  const userStr = localStorage.getItem('usuario');
  if (!userStr) {
    window.location.href = 'index.html';
    return;
  }
  
  let user;
  try {
    user = JSON.parse(userStr);
  } catch (e) {
    console.error('Erro ao parsear usuário:', e);
    window.location.href = 'index.html';
    return;
  }
  
  const funcao = (user.funcao || '').trim();
  if (funcao !== 'NAPNE' && funcao.toLowerCase() !== 'napne') {
    alert('Acesso negado. Apenas funcionários NAPNE podem acessar esta página.');
    window.location.href = 'index.html';
    return;
  }
  
  let prefixo = 'Funcionário';
  if (user.funcao) {
    const funcaoLower = user.funcao.trim().toLowerCase();
    if (funcaoLower === 'docente' || funcaoLower === 'professor') {
      prefixo = 'Professor';
    } else if (funcaoLower === 'coordenador') {
      prefixo = 'Coordenador';
    } else if (funcaoLower === 'napne' || funcaoLower === 'funcionario' || funcaoLower === 'funcionário') {
      prefixo = 'Funcionário';
    }
  }
  
  const userInfoSpan = document.getElementById('userInfo') || document.querySelector('.user-info span');
  if (userInfoSpan && user) {
    userInfoSpan.textContent = `${prefixo}: ${user.nome || 'Usuário'}`;
  }

  let alunos = [];
  let alunoEditando = null; 

  const alunosList = document.getElementById('alunosList');
  const addAlunoBtn = document.getElementById('addAlunoBtn');
  const addAlunoModal = document.getElementById('addAlunoModal');
  const addAlunoForm = document.getElementById('addAlunoForm');
  const cancelarBtn = document.getElementById('cancelarBtn');
  const closeModal = document.querySelector('.close');

  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      if (value.length <= 3) {
        e.target.value = value;
      } else if (value.length <= 6) {
        e.target.value = value.replace(/(\d{3})(\d+)/, '$1.$2');
      } else if (value.length <= 9) {
        e.target.value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else {
        e.target.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
      }
    });
    
    cpfInput.addEventListener('paste', function(e) {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      let digitsOnly = paste.replace(/\D/g, '').substring(0, 11);
      if (digitsOnly.length <= 3) {
        e.target.value = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        e.target.value = digitsOnly.replace(/(\d{3})(\d+)/, '$1.$2');
      } else if (digitsOnly.length <= 9) {
        e.target.value = digitsOnly.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else {
        e.target.value = digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
      }
    });
  }
  const maior18Checkbox = document.getElementById('maior18');
  const responsavelFields = document.getElementById('responsavelFields');
  const modalTitle = addAlunoModal ? addAlunoModal.querySelector('h2') : null;

  if (!alunosList || !addAlunoBtn || !addAlunoModal || !addAlunoForm) {
    console.error('Elementos essenciais não encontrados na página!');
    return;
  }

  function toggleResponsavelFields() {
    if (!maior18Checkbox || !responsavelFields) return;
    if (maior18Checkbox.checked) {
      responsavelFields.classList.add('hidden');
    } else {
      responsavelFields.classList.remove('hidden');
    }
  }

  if (maior18Checkbox && responsavelFields) {
    toggleResponsavelFields();
    maior18Checkbox.addEventListener('change', toggleResponsavelFields);
  }

  async function loadCursos() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado';
      const apiUrl = `${baseUrl}/index.php?recurso=cursos`;
      const response = await fetch(apiUrl);
      const text = await response.text();
      let cursosData;
      try {
        cursosData = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          cursosData = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      if (!response.ok) {
        throw new Error(cursosData.error || 'Erro ao carregar cursos');
      }
      const cursos = Array.isArray(cursosData) ? cursosData : [];
      const cursoSelect = document.getElementById('curso');
      cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
      
      cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.nome;
        const tipoTexto = curso.tipo ? ` (${curso.tipo})` : '';
        option.textContent = `${curso.nome}${tipoTexto}`;
        cursoSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      const cursoSelect = document.getElementById('curso');
      cursoSelect.innerHTML = '<option value="">Erro ao carregar cursos</option>';
    }
  }

  async function loadNecessidades() {
    try {
      const baseUrl = window.location.origin + '/trabalhointegrado';
      const apiUrl = `${baseUrl}/index.php?recurso=necessidades`;
      const response = await fetch(apiUrl);
      const text = await response.text();
      let necessidadesData;
      try {
        necessidadesData = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          necessidadesData = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      if (!response.ok) {
        throw new Error(necessidadesData.error || 'Erro ao carregar necessidades');
      }
      const necessidades = Array.isArray(necessidadesData) ? necessidadesData : [];
      const container = document.getElementById('necessidadesContainer');
      container.innerHTML = '';
      
      if (necessidades.length === 0) {
        container.innerHTML = '<p>Nenhuma necessidade cadastrada ainda.</p>';
        return;
      }
      
      necessidades.forEach(necessidade => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = necessidade.descricao;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + necessidade.descricao));
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
      });
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
      const container = document.getElementById('necessidadesContainer');
      container.innerHTML = '<p>Erro ao carregar necessidades. Tente novamente.</p>';
    }
  }

  async function loadAlunos() {
    try {
      const apiUrl = window.location.origin + '/trabalhointegrado/index.php?recurso=alunos';
      const response = await fetch(apiUrl);
      const text = await response.text();
      let alunosData;
      try {
        alunosData = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          alunosData = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      if (!response.ok) {
        throw new Error(alunosData.error || 'Erro ao carregar alunos');
      }
      alunos = Array.isArray(alunosData) ? alunosData : [];
      renderAlunos();
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar alunos: ' + error.message);
      alunosList.innerHTML = '<li style="text-align: center; padding: 20px; color: red;">Erro ao carregar alunos. Tente novamente.</li>';
    }
  }

  function renderResponsavelInfo(responsavel) {
    if (!responsavel || typeof responsavel !== 'object') {
      return '<p><strong>Responsável:</strong> N/A</p>';
    }
    const nome = responsavel.nome || 'N/A';
    const telefone = responsavel.telefone || 'N/A';
    const email = responsavel.email || 'N/A';
    return `<p><strong>Responsável:</strong> ${nome} - ${telefone} - ${email}</p>`;
  }

  function renderAlunos() {
    alunosList.innerHTML = '';

    alunos.forEach((aluno, index) => {
      const li = document.createElement('li');

      const infoDiv = document.createElement('div');
      infoDiv.classList.add('aluno-info');

      const span = document.createElement('span');
      span.textContent = aluno.nome;
      infoDiv.appendChild(span);

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('actions');

      const detalhesBtn = document.createElement('button');
      detalhesBtn.classList.add('btn-detalhes');
      detalhesBtn.innerHTML = '<i class="fas fa-info-circle"></i> Detalhes';
      detalhesBtn.onclick = () => mostrarDetalhes(index);

      const editBtn = document.createElement('button');
      editBtn.classList.add('btn-editar');
      editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Editar';
      editBtn.onclick = () => editarAluno(aluno.id);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('btn-deletar');
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Deletar';
      deleteBtn.onclick = () => deletarAluno(aluno.id);

      actionsDiv.appendChild(detalhesBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      infoDiv.appendChild(actionsDiv);
      li.appendChild(infoDiv);

      const detalhesDiv = document.createElement('div');
      detalhesDiv.classList.add('aluno-detalhes', 'hidden');
      detalhesDiv.innerHTML = `
        <p><strong>Nome:</strong> ${aluno.nome}</p>
        <p><strong>Data de Nascimento:</strong> ${aluno.dataNasc ? new Date(aluno.dataNasc).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <p><strong>CPF:</strong> ${aluno.cpf || 'N/A'}</p>
        <p><strong>Endereço:</strong> ${aluno.endereco || 'N/A'}</p>
        <p><strong>Telefone:</strong> ${aluno.telefone || 'N/A'}</p>
        <p><strong>E-mail:</strong> ${aluno.email || 'N/A'}</p>
        <p><strong>Curso:</strong> ${aluno.curso || 'N/A'}</p>
        <p><strong>Matrícula:</strong> ${aluno.matricula || 'N/A'}</p>
        <p><strong>Status da Matrícula:</strong> ${aluno.matriculaAtiva || 'N/A'}</p>
        <p><strong>Monitoria:</strong> ${aluno.monitoria || 'N/A'}</p>
        <p><strong>Atendimento Psicopedagógico:</strong> ${aluno.atendPsico || 'N/A'}</p>
        <p><strong>Necessidades:</strong> ${aluno.necessidades ? aluno.necessidades.join(', ') : 'Nenhuma'}</p>
        <p><strong>Maior de 18:</strong> ${aluno.maior18 ? 'Sim' : 'Não'}</p>
        ${!aluno.maior18 ? renderResponsavelInfo(aluno.responsavel) : ''}
      `;
      li.appendChild(detalhesDiv);

      alunosList.appendChild(li);
    });
  }

  function mostrarDetalhes(index) {
    const li = alunosList.children[index];
    const detalhesDiv = li.querySelector('.aluno-detalhes');
    detalhesDiv.classList.toggle('hidden');
  }

  function adicionarAluno() {
    alunoEditando = null;
    addAlunoForm.reset();
    if (modalTitle) modalTitle.textContent = 'Adicionar Aluno';
    toggleResponsavelFields();
    addAlunoModal.style.display = 'block';
  }

  async function salvarAluno(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const dataNasc = document.getElementById('dataNasc').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '').trim();
    const endereco = document.getElementById('endereco').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    const curso = document.getElementById('curso').value;
    const matricula = document.getElementById('matricula').value.trim();
    const matriculaAtiva = document.getElementById('matriculaAtiva').value;
    const monitoria = document.getElementById('monitoria').value;
    const atendPsico = document.getElementById('atendPsico').value;
    const necessidadesCheckboxes = document.querySelectorAll('#necessidadesContainer input[type="checkbox"]:checked');
    const necessidades = Array.from(necessidadesCheckboxes).map(checkbox => checkbox.value);
    const maior18 = document.getElementById('maior18').checked;

    const respNome = document.getElementById('respNome').value.trim();
    const respTelefone = document.getElementById('respTelefone').value.trim();
    const respEmail = document.getElementById('respEmail').value.trim();

    if (!nome || !dataNasc || !cpf || !endereco || !telefone || !email || !matricula) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    
    if (!curso || curso.trim() === '') {
      alert('O curso é obrigatório. Por favor, selecione um curso.');
      return;
    }

    const alunoData = {
      nome,
      dataNasc,
      cpf,
      endereco,
      telefone,
      email,
      curso,
      matricula,
      matriculaAtiva,
      monitoria,
      atendPsico,
      necessidades,
      maior18,
      respNome: maior18 ? '' : respNome,
      respTelefone: maior18 ? '' : respTelefone,
      respEmail: maior18 ? '' : respEmail
    };

    try {
      let response;
      if (alunoEditando) {
        const apiUrl = window.location.origin + `/trabalhointegrado/index.php?recurso=alunos&id=${alunoEditando}`;
        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alunoData)
        });
      } else {
        const apiUrl = window.location.origin + '/trabalhointegrado/index.php?recurso=alunos';
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alunoData)
        });
      }
      
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
        throw new Error(resultado.error || 'Erro ao salvar aluno');
      }
      alert(alunoEditando ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
      await loadAlunos();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      alert('Erro ao salvar aluno: ' + error.message);
    }
  }

  async function editarAluno(id) {
    const aluno = alunos.find(a => a.id === id);
    if (!aluno) {
      alert('Aluno não encontrado!');
      return;
    }

    try {
      const apiUrl = window.location.origin + `/trabalhointegrado/index.php?recurso=alunos&id=${id}`;
      const response = await fetch(apiUrl);
      const text = await response.text();
      let alunoCompleto;
      try {
        alunoCompleto = JSON.parse(text.trim());
      } catch (e) {
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        if (jsonStart > 0) {
          alunoCompleto = JSON.parse(text.substring(jsonStart).trim());
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      }
      if (!response.ok) {
        throw new Error(alunoCompleto.error || 'Erro ao carregar dados do aluno');
      }

      alunoEditando = id;
      if (modalTitle) modalTitle.textContent = 'Editar Aluno';

      document.getElementById('nome').value = alunoCompleto.nome || '';
      document.getElementById('dataNasc').value = alunoCompleto.dataNasc ? alunoCompleto.dataNasc.split('T')[0] : '';
      const cpfDigits = (alunoCompleto.cpf || '').replace(/\D/g, '');
      let cpfFormatted = cpfDigits;
      if (cpfDigits.length <= 3) {
        cpfFormatted = cpfDigits;
      } else if (cpfDigits.length <= 6) {
        cpfFormatted = cpfDigits.replace(/(\d{3})(\d+)/, '$1.$2');
      } else if (cpfDigits.length <= 9) {
        cpfFormatted = cpfDigits.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else {
        cpfFormatted = cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
      }
      document.getElementById('cpf').value = cpfFormatted;
      document.getElementById('endereco').value = alunoCompleto.endereco || '';
      document.getElementById('telefone').value = alunoCompleto.telefone || '';
      document.getElementById('email').value = alunoCompleto.email || '';
      document.getElementById('curso').value = alunoCompleto.curso || alunoCompleto.cursoNome || '';
      document.getElementById('matricula').value = alunoCompleto.matricula || '';
      document.getElementById('matriculaAtiva').value = alunoCompleto.matriculaAtiva || 'ativa';
      document.getElementById('monitoria').value = alunoCompleto.monitoria || 'Não';
      document.getElementById('atendPsico').value = alunoCompleto.atendPsico || 'Não';
      document.getElementById('maior18').checked = alunoCompleto.maior18 || false;

      if (alunoCompleto.responsavel && typeof alunoCompleto.responsavel === 'object') {
        const responsavel = alunoCompleto.responsavel;
        document.getElementById('respNome').value = responsavel.nome || '';
        document.getElementById('respTelefone').value = responsavel.telefone || '';
        document.getElementById('respEmail').value = responsavel.email || '';
      } else {
        document.getElementById('respNome').value = '';
        document.getElementById('respTelefone').value = '';
        document.getElementById('respEmail').value = '';
      }

      if (alunoCompleto.necessidades && Array.isArray(alunoCompleto.necessidades)) {
        await loadNecessidades();
        setTimeout(() => {
          const checkboxes = document.querySelectorAll('#necessidadesContainer input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            const checkboxValue = checkbox.value.trim();
            const isChecked = alunoCompleto.necessidades.some(nec => {
              const necValue = typeof nec === 'string' ? nec.trim() : String(nec).trim();
              return necValue === checkboxValue || necValue.includes(checkboxValue) || checkboxValue.includes(necValue);
            });
            checkbox.checked = isChecked;
          });
        }, 300);
      } else {
        await loadNecessidades();
      }

      toggleResponsavelFields();
      addAlunoModal.style.display = 'block';
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      alert('Erro ao carregar dados do aluno: ' + error.message);
    }
  }

  async function deletarAluno(id) {
    if (confirm('Tem certeza que deseja deletar este aluno?')) {
      try {
        const apiUrl = window.location.origin + `/trabalhointegrado/index.php?recurso=alunos&id=${id}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro ao deletar aluno' }));
          throw new Error(errorData.error || 'Erro ao deletar aluno');
        }
        
        await loadAlunos();
        alert('Aluno deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        alert('Erro ao deletar aluno: ' + error.message);
      }
    }
  }

  function fecharModal() {
    addAlunoModal.style.display = 'none';
    addAlunoForm.reset();
    alunoEditando = null;
    if (modalTitle) modalTitle.textContent = 'Adicionar Aluno';
    toggleResponsavelFields();
  }

  addAlunoBtn.addEventListener('click', adicionarAluno);
  addAlunoForm.addEventListener('submit', salvarAluno);
  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', fecharModal);
  }
  if (closeModal) {
    closeModal.addEventListener('click', fecharModal);
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

  window.onclick = function(event) {
    if (event.target == addAlunoModal) {
      fecharModal();
    }
  };

  loadCursos();
  loadNecessidades();
  loadAlunos();
});
