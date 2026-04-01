const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  errorMessage.style.display = 'none';
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();

  if (!username || !password) {
    errorMessage.textContent = 'Por favor, preencha todos os campos.';
    errorMessage.style.display = 'block';
    return;
  }

  const apiUrl = window.location.origin + '/trabalhointegrado/auth.php';
  
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ login: username, senha: password })
  })
  .then(async response => {
    const text = await response.text();
    let data;
    
    try {
      const jsonStart = text.indexOf('{');
      if (jsonStart > 0) {
        console.warn('Encontrado conteúdo antes do JSON, removendo:', text.substring(0, jsonStart));
        data = JSON.parse(text.substring(jsonStart));
      } else {
        data = JSON.parse(text);
      }
    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e);
      console.error('Texto recebido:', text);
      throw new Error('Resposta inválida do servidor: ' + text.substring(0, 100));
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer login');
    }
    
    return data;
  })
  .then(data => {
    if (data.error) {
      errorMessage.textContent = data.error;
      errorMessage.style.display = 'block';
    } else {
      localStorage.setItem('usuario', JSON.stringify(data));
      
      const funcao = (data.funcao || '').trim();
      
      if (funcao === 'NAPNE' || funcao.toLowerCase() === 'napne') {
        window.location.href = 'indexfun.html';
      } else if (funcao === 'Coordenador' || funcao.toLowerCase() === 'coordenador') {
        window.location.href = 'indexcor.html';
      } else if (funcao === 'Docente' || funcao.toLowerCase() === 'docente') {
        console.log('Redirecionando para indexprof.html');
        window.location.href = 'indexprof.html';
      } else {
        console.error('Função não reconhecida:', funcao);
        errorMessage.textContent = 'Função não reconhecida: ' + funcao;
        errorMessage.style.display = 'block';
      }
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    const errorMsg = error.message || 'Erro ao conectar com o servidor.';
    errorMessage.textContent = errorMsg;
    errorMessage.style.display = 'block';
  });
});
