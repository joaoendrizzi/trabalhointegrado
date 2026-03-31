CREATE DATABASE IF NOT EXISTS sistema_napne;
USE sistema_napne;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siape VARCHAR(50),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    funcao VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo ENUM('Superior', 'Médio') NOT NULL DEFAULT 'Superior'
);

CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_nasc DATE,
    cpf VARCHAR(14) UNIQUE,
    endereco VARCHAR(500),
    telefone VARCHAR(20),
    email VARCHAR(255),
    matricula VARCHAR(50) NOT NULL UNIQUE,
    curso_id INT,
    matricula_ativa ENUM('ativa', 'inativa') DEFAULT 'ativa',
    monitoria ENUM('Sim', 'Não') DEFAULT 'Não',
    atend_psico ENUM('Sim', 'Não') DEFAULT 'Não',
    maior_18 BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
);

CREATE TABLE necessidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL
);

CREATE TABLE alunos_necessidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    necessidade_id INT NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (necessidade_id) REFERENCES necessidades(id) ON DELETE CASCADE,
    UNIQUE KEY unique_aluno_necessidade (aluno_id, necessidade_id)
);

CREATE TABLE responsaveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20)
);

CREATE TABLE componentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ementa TEXT
);

CREATE TABLE peis_gerais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    responsavel_id INT,
    necessidade_id INT,
    componente_id INT,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE SET NULL,
    FOREIGN KEY (necessidade_id) REFERENCES necessidades(id) ON DELETE SET NULL,
    FOREIGN KEY (componente_id) REFERENCES componentes(id) ON DELETE SET NULL
);

CREATE TABLE peis_adaptativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    responsavel_id INT,
    necessidade_id INT,
    componente_id INT,
    descricao TEXT,
    curso_id INT,
    periodo VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE SET NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE SET NULL,
    FOREIGN KEY (necessidade_id) REFERENCES necessidades(id) ON DELETE SET NULL,
    FOREIGN KEY (componente_id) REFERENCES componentes(id) ON DELETE SET NULL
);

CREATE TABLE comentarios_peis_gerais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pei_geral_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    FOREIGN KEY (pei_geral_id) REFERENCES peis_gerais(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE comentarios_peis_adaptativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pei_adaptativo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pei_adaptativo_id) REFERENCES peis_adaptativos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE pareceres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodo VARCHAR(50),
    descricao TEXT,
    peiadaptativo_id INT,
    curso_id INT,
    data_envio DATETIME,
    FOREIGN KEY (peiadaptativo_id) REFERENCES peis_adaptativos(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
);

CREATE TABLE comentariosparecer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parecer_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    data_envio DATETIME,
    FOREIGN KEY (parecer_id) REFERENCES pareceres(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
