function gerarPDFPEIGeral(pei) {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 7;
    const titleFontSize = 16;
    const subtitleFontSize = 12;
    const normalFontSize = 10;
    
    doc.setFontSize(titleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('PLANO EDUCACIONAL INDIVIDUALIZADO GERAL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    yPosition += 5;
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMAÇÕES DO ALUNO', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    doc.text(`Nome do Aluno: ${pei.alunoNome || 'Não informado'}`, margin, yPosition);
    yPosition += lineHeight;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition += 5;
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('DIFICULDADES', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const dificuldades = doc.splitTextToSize(pei.dificuldades || 'Não informado', pageWidth - 2 * margin);
    doc.text(dificuldades, margin, yPosition);
    yPosition += dificuldades.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('HABILIDADES', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const habilidades = doc.splitTextToSize(pei.habilidades || 'Não informado', pageWidth - 2 * margin);
    doc.text(habilidades, margin, yPosition);
    yPosition += habilidades.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('HISTÓRICO', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const historico = doc.splitTextToSize(pei.historico || 'Não informado', pageWidth - 2 * margin);
    doc.text(historico, margin, yPosition);
    yPosition += historico.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('HISTÓRICO NO IFRS', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const historicoIFRS = doc.splitTextToSize(pei.historicoNoIFRS || 'Não informado', pageWidth - 2 * margin);
    doc.text(historicoIFRS, margin, yPosition);
    yPosition += historicoIFRS.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('ESTRATÉGIAS DE ENSINO', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const estrategias = doc.splitTextToSize(pei.estrategiasDeEnsino || 'Não informado', pageWidth - 2 * margin);
    doc.text(estrategias, margin, yPosition);
    
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Sistema NAPNE - Página ${i} de ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
    }
    
    const fileName = `PEI_Geral_${pei.alunoNome || 'Aluno'}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };
  document.head.appendChild(script);
}

function gerarPDFPEIAdaptativo(pei) {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 7;
    const titleFontSize = 16;
    const subtitleFontSize = 12;
    const normalFontSize = 10;
    
    doc.setFontSize(titleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('PLANO EDUCACIONAL INDIVIDUALIZADO ADAPTATIVO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    yPosition += 5;
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMAÇÕES BÁSICAS', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    doc.text(`Nome do Aluno: ${pei.alunoNome || 'Não informado'}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Componente Curricular: ${pei.componenteNome || pei.componente || 'Não informado'}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Docente: ${pei.docente || 'Não informado'}`, margin, yPosition);
    yPosition += lineHeight;
    
    let descricaoTexto = '';
    if (pei.descricao) {
      try {
        const descricaoJson = JSON.parse(pei.descricao);
        if (typeof descricaoJson === 'object' && descricaoJson !== null) {
          descricaoTexto = descricaoJson.descricao || JSON.stringify(descricaoJson, null, 2);
        } else {
          descricaoTexto = pei.descricao;
        }
      } catch (e) {
        descricaoTexto = pei.descricao;
      }
    }
    
    if (pei.periodo) {
      doc.text(`Período: ${pei.periodo}`, margin, yPosition);
      yPosition += lineHeight;
    }
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition += 5;
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('EMENTA DO COMPONENTE', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const ementa = doc.splitTextToSize(pei.ementaComponente || pei.ementa || 'Não informado', pageWidth - 2 * margin);
    doc.text(ementa, margin, yPosition);
    yPosition += ementa.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('OBJETIVO GERAL', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const objetivoGeral = doc.splitTextToSize(pei.objetivoGeral || 'Não informado', pageWidth - 2 * margin);
    doc.text(objetivoGeral, margin, yPosition);
    yPosition += objetivoGeral.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('OBJETIVOS ESPECÍFICOS', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const objetivosEspecificos = doc.splitTextToSize(pei.objetivosEspecificos || 'Não informado', pageWidth - 2 * margin);
    doc.text(objetivosEspecificos, margin, yPosition);
    yPosition += objetivosEspecificos.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('CONTEÚDOS', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const conteudos = doc.splitTextToSize(pei.conteudos || 'Não informado', pageWidth - 2 * margin);
    doc.text(conteudos, margin, yPosition);
    yPosition += conteudos.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('METODOLOGIA', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const metodologia = doc.splitTextToSize(pei.metodologia || 'Não informado', pageWidth - 2 * margin);
    doc.text(metodologia, margin, yPosition);
    yPosition += metodologia.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('AVALIAÇÃO', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const avaliacao = doc.splitTextToSize(pei.avaliacao || 'Não informado', pageWidth - 2 * margin);
    doc.text(avaliacao, margin, yPosition);
    yPosition += avaliacao.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
    
    if (descricaoTexto) {
      doc.setFontSize(subtitleFontSize);
      doc.setFont(undefined, 'bold');
      doc.text('DESCRIÇÃO', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(normalFontSize);
      doc.setFont(undefined, 'normal');
      const descricao = doc.splitTextToSize(descricaoTexto, pageWidth - 2 * margin);
      doc.text(descricao, margin, yPosition);
      yPosition += descricao.length * lineHeight + 5;
    }
    
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Sistema NAPNE - Página ${i} de ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
    }
    
    const alunoNome = pei.alunoNome || 'Aluno';
    const componente = pei.componenteNome || pei.componente || '';
    const fileName = `PEI_Adaptativo_${alunoNome}_${componente}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };
  document.head.appendChild(script);
}

function gerarPDFParecer(parecer) {
  if (window.jspdf) {
    gerarPDFParecerInterno(parecer);
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      gerarPDFParecerInterno(parecer);
    };
    script.onerror = function() {
      alert('Erro ao carregar biblioteca de PDF. Verifique sua conexão com a internet.');
    };
    document.head.appendChild(script);
  }
}

function gerarPDFParecerInterno(parecer) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;
  const lineHeight = 7;
  const titleFontSize = 16;
  const subtitleFontSize = 12;
  const normalFontSize = 10;
  
  doc.setFontSize(titleFontSize);
  doc.setFont(undefined, 'bold');
  doc.text('PARECER', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;
  
  yPosition += 5;
  doc.setFontSize(subtitleFontSize);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMAÇÕES DO PARECER', margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(normalFontSize);
  doc.setFont(undefined, 'normal');
  doc.text(`Nome do Aluno: ${parecer.alunoNome || 'Não informado'}`, margin, yPosition);
  yPosition += lineHeight;
  
  let descricaoTexto = parecer.descricao || '';
  let docenteExtraido = parecer.docente || null;
  let periodoExibir = parecer.periodo || null;
  
  if (descricaoTexto && descricaoTexto.trim().startsWith('{')) {
    try {
      const descricaoJson = JSON.parse(descricaoTexto);
      if (typeof descricaoJson === 'object' && descricaoJson !== null) {
        descricaoTexto = descricaoJson.descricao || JSON.stringify(descricaoJson, null, 2);
        if (!docenteExtraido && descricaoJson.docente) {
          docenteExtraido = descricaoJson.docente;
        }
        if (!periodoExibir && descricaoJson.periodo) {
          periodoExibir = descricaoJson.periodo;
        }
      }
    } catch (e) {
    }
  }
  
  doc.text(`Período: ${periodoExibir || 'Não informado'}`, margin, yPosition);
  yPosition += lineHeight;
  
  doc.text(`Docente: ${docenteExtraido || 'Não informado'}`, margin, yPosition);
  yPosition += lineHeight;
  
  doc.text(`Componente: ${parecer.componenteNome || parecer.componente || 'Não informado'}`, margin, yPosition);
  yPosition += lineHeight;
  
  if (parecer.dataEnvio) {
    const dataFormatada = new Date(parecer.dataEnvio).toLocaleString('pt-BR');
    doc.text(`Data de Envio: ${dataFormatada}`, margin, yPosition);
    yPosition += lineHeight;
  }
  
  yPosition += 5;
  
  if (yPosition > 270) {
    doc.addPage();
    yPosition = margin;
  }
  
  if (descricaoTexto) {
    doc.setFontSize(subtitleFontSize);
    doc.setFont(undefined, 'bold');
    doc.text('DESCRIÇÃO', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(normalFontSize);
    doc.setFont(undefined, 'normal');
    const descricao = doc.splitTextToSize(descricaoTexto, pageWidth - 2 * margin);
    doc.text(descricao, margin, yPosition);
    yPosition += descricao.length * lineHeight + 5;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }
  }
  
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Sistema NAPNE - Página ${i} de ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
  }
  
  const alunoNome = (parecer.alunoNome || 'Aluno').replace(/[^a-zA-Z0-9]/g, '_');
  const periodoNome = (periodoExibir || 'parecer').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Parecer_${alunoNome}_${periodoNome}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

