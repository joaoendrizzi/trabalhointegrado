function goToHome() {
    try {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/html/')) {
                window.location.href = 'index.html';
            } else {
                window.location.href = '../html/index.html';
            }
            return;
        }

        const user = JSON.parse(userStr);
        
        let funcaoRaw = (user.funcao || '').trim();
        let funcaoLower = funcaoRaw.toLowerCase();
        
        funcaoLower = funcaoLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        let homePage;
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/') || currentPath.includes('\\html\\');
        
        if (funcaoRaw === 'NAPNE' || 
            funcaoRaw === 'Napne' || 
            funcaoLower === 'napne' ||
            funcaoRaw === 'Funcionário' ||
            funcaoRaw === 'FUNCIONÁRIO' ||
            funcaoRaw === 'Funcionario' ||
            funcaoRaw === 'FUNCIONARIO' ||
            funcaoLower === 'funcionario') {
            homePage = isInHtmlFolder ? 'indexfun.html' : '../html/indexfun.html';
        } 
        else if (funcaoRaw === 'Coordenador' || 
                 funcaoRaw === 'COORDENADOR' || 
                 funcaoLower === 'coordenador') {
            homePage = isInHtmlFolder ? 'indexcor.html' : '../html/indexcor.html';
        } 
        else if (funcaoRaw === 'Docente' || 
                 funcaoRaw === 'DOCENTE' || 
                 funcaoLower === 'docente' ||
                 funcaoRaw === 'Professor' ||
                 funcaoRaw === 'PROFESSOR' ||
                 funcaoLower === 'professor') {
            homePage = isInHtmlFolder ? 'indexprof.html' : '../html/indexprof.html';
        } 
        else {
            console.error('Valor lower (normalized):', funcaoLower);
            console.error('Usuario completo:', JSON.stringify(user, null, 2));
            alert('Erro: Função não reconhecida (' + funcaoRaw + '). Redirecionando para login.');
            homePage = isInHtmlFolder ? 'index.html' : '../html/index.html';
        }

        window.location.href = homePage;
    } catch (error) {
        console.error('Erro ao redirecionar para página inicial:', error);
        const currentPath = window.location.pathname;
        if (currentPath.includes('/html/')) {
            window.location.href = 'index.html';
        } else {
            window.location.href = '../html/index.html';
        }
    }
}
