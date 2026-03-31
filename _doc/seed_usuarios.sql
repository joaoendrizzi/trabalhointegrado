USE sistema_napne;
INSERT IGNORE INTO usuarios (siape, nome, cpf, funcao, email, senha)
VALUES
    ('9876543', 'Funcionario Teste', '12345678901', 'NAPNE', 'napne@ifrs.edu.br', '$2y$10$kQabdJB88gmaJbv40SpElux5cP6LAQcVWaY3LplVwGOGUfDE49xC6'),
    ('1234567', 'Coordenador Teste', '98765432100', 'Coordenador', 'coordenador@ifrs.edu.br', '$2y$10$kQabdJB88gmaJbv40SpElux5cP6LAQcVWaY3LplVwGOGUfDE49xC6'),
    ('7654321', 'Docente Teste', '45678912345', 'Docente', 'docente@ifrs.edu.br', '$2y$10$kQabdJB88gmaJbv40SpElux5cP6LAQcVWaY3LplVwGOGUfDE49xC6');


