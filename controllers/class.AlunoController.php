<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Aluno.php";
require_once "dao/class.AlunoDAO.php";
require_once "interfaceController.php";

class AlunoController implements Controller {
    private $alunoDAO;

    public function __construct() {
        $this->alunoDAO = new AlunoDAO();
    }

    public function buscarTodos() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            // Se for solicitado alunos com PEI Adaptativo
            if (isset($_GET['com_pei_adaptativo']) && $_GET['com_pei_adaptativo'] === '1') {
                $alunos = $this->alunoDAO->buscarAlunosComPeiAdaptativo();
                echo json_encode($alunos, JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $alunos = $this->alunoDAO->buscarTodos();
            echo json_encode($alunos, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar alunos: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function buscarPorId($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $aluno = $this->alunoDAO->buscarPorId($id);
            if (empty($aluno)) {
                http_response_code(404);
                echo json_encode(['error' => 'Aluno não encontrado'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            echo json_encode($aluno, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao buscar aluno por ID: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function inserir() {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validação de campos obrigatórios
            if (empty($data['nome'])) {
                http_response_code(400);
                echo json_encode(['error' => 'O nome é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            if (empty($data['matricula'])) {
                http_response_code(400);
                echo json_encode(['error' => 'A matrícula é obrigatória'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            if (empty($data['curso'])) {
                http_response_code(400);
                echo json_encode(['error' => 'O curso é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validação de CPF - apenas 11 dígitos
            $cpf = '';
            if (!empty($data['cpf'])) {
                $cpf = preg_replace('/\D/', '', $data['cpf']); // Remove tudo que não é dígito
                if (strlen($cpf) !== 11) {
                    http_response_code(400);
                    echo json_encode(['error' => 'CPF deve conter exatamente 11 dígitos'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            // Validação de unicidade - CPF
            if (!empty($cpf) && $this->alunoDAO->verificarCpfExistente($cpf)) {
                http_response_code(400);
                echo json_encode(['error' => 'Este CPF já está cadastrado no sistema'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validação de unicidade - Matrícula
            if ($this->alunoDAO->verificarMatriculaExistente($data['matricula'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Esta matrícula já está cadastrada no sistema'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $aluno = new Aluno();
            $aluno->setNome($data['nome'] ?? '');
            $aluno->setDataNasc($data['dataNasc'] ?? null);
            $aluno->setCpf($cpf);
            $aluno->setEndereco($data['endereco'] ?? '');
            $aluno->setTelefone($data['telefone'] ?? '');
            $aluno->setEmail($data['email'] ?? '');
            $aluno->setMatricula($data['matricula'] ?? '');
            
            // Curso é obrigatório - buscar ou criar
            $cursoId = null;
            require_once "dao/class.CursoDAO.php";
            $cursoDAO = new CursoDAO();
            $cursos = $cursoDAO->buscarTodos();
            foreach ($cursos as $curso) {
                if ($curso->getNome() === $data['curso']) {
                    $cursoId = $curso->getId();
                    break;
                }
            }
            if (!$cursoId) {
                require_once "models/class.Curso.php";
                $novoCurso = new Curso();
                $novoCurso->setNome($data['curso']);
                $cursoCriado = $cursoDAO->inserir($novoCurso);
                $cursoId = $cursoCriado->getId();
            }
            $aluno->setCursoId($cursoId);
            $aluno->setMatriculaAtiva($data['matriculaAtiva'] ?? 'ativa');
            $aluno->setMonitoria($data['monitoria'] ?? 'Não');
            $aluno->setAtendPsico($data['atendPsico'] ?? 'Não');
            $aluno->setMaior18($data['maior18'] ?? false);

            try {
                $novoAluno = $this->alunoDAO->inserir($aluno);
            } catch (PDOException $e) {
                // Tratar erros de constraint UNIQUE do banco de dados
                if ($e->getCode() == 23000) { // Código de erro para violação de constraint UNIQUE
                    $errorMsg = $e->getMessage();
                    if (strpos($errorMsg, 'matricula') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Esta matrícula já está cadastrada no sistema'], JSON_UNESCAPED_UNICODE);
                        exit;
                    } elseif (strpos($errorMsg, 'cpf') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Este CPF já está cadastrado no sistema'], JSON_UNESCAPED_UNICODE);
                        exit;
                    }
                }
                throw $e; // Re-lançar se não for erro de constraint
            }
            
            if (!empty($data['necessidades']) && is_array($data['necessidades'])) {
                $this->alunoDAO->salvarNecessidades($novoAluno->getId(), $data['necessidades']);
            }
            
            if (!empty($data['respNome']) && !$data['maior18']) {
                require_once "dao/class.ResponsavelDAO.php";
                require_once "models/class.Responsavel.php";
                require_once "dao/class.PeiGeralDAO.php";
                require_once "models/class.PeiGeral.php";
                
                $responsavelDAO = new ResponsavelDAO();
                $responsavel = new Responsavel();
                $responsavel->setNome($data['respNome']);
                $responsavel->setTelefone($data['respTelefone'] ?? '');
                $responsavel->setEmail($data['respEmail'] ?? '');
                $responsavelCriado = $responsavelDAO->inserir($responsavel);
                
                if ($responsavelCriado && $responsavelCriado->getId()) {
                    $peiGeralDAO = new PeiGeralDAO();
                    $peiGeral = new PeiGeral();
                    $peiGeral->setAlunoId($novoAluno->getId());
                    $peiGeral->setResponsavelId($responsavelCriado->getId());
                    $peiGeralDAO->inserir($peiGeral);
                }
            }
            http_response_code(201);
            echo json_encode($novoAluno, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            // Tratar erros de constraint UNIQUE do banco de dados
            if ($e->getCode() == 23000) {
                $errorMsg = $e->getMessage();
                if (strpos($errorMsg, 'matricula') !== false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Esta matrícula já está cadastrada no sistema'], JSON_UNESCAPED_UNICODE);
                    exit;
                } elseif (strpos($errorMsg, 'cpf') !== false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Este CPF já está cadastrado no sistema'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }
            http_response_code(500);
            error_log("Erro PDO ao inserir aluno: " . $e->getMessage());
            echo json_encode(['error' => 'Erro ao inserir aluno no banco de dados'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao inserir aluno: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function editar($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Dados inválidos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validação de CPF na edição - apenas 11 dígitos
            $cpf = '';
            if (!empty($data['cpf'])) {
                $cpf = preg_replace('/\D/', '', $data['cpf']); // Remove tudo que não é dígito
                if (strlen($cpf) !== 11) {
                    http_response_code(400);
                    echo json_encode(['error' => 'CPF deve conter exatamente 11 dígitos'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            // Validação de unicidade - CPF (excluindo o próprio aluno)
            if (!empty($cpf) && $this->alunoDAO->verificarCpfExistente($cpf, $id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Este CPF já está cadastrado para outro aluno'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Validação de unicidade - Matrícula (excluindo o próprio aluno)
            if (!empty($data['matricula']) && $this->alunoDAO->verificarMatriculaExistente($data['matricula'], $id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Esta matrícula já está cadastrada para outro aluno'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $aluno = new Aluno();
            $aluno->setNome($data['nome'] ?? '');
            $aluno->setDataNasc($data['dataNasc'] ?? null);
            $aluno->setCpf($cpf);
            $aluno->setEndereco($data['endereco'] ?? '');
            $aluno->setTelefone($data['telefone'] ?? '');
            $aluno->setEmail($data['email'] ?? '');
            $aluno->setMatricula($data['matricula'] ?? '');
            
            $cursoId = null;
            if (!empty($data['curso'])) {
                require_once "dao/class.CursoDAO.php";
                $cursoDAO = new CursoDAO();
                $cursos = $cursoDAO->buscarTodos();
                foreach ($cursos as $curso) {
                    if ($curso->getNome() === $data['curso']) {
                        $cursoId = $curso->getId();
                        break;
                    }
                }
                if (!$cursoId) {
                    require_once "models/class.Curso.php";
                    $novoCurso = new Curso();
                    $novoCurso->setNome($data['curso']);
                    $cursoCriado = $cursoDAO->inserir($novoCurso);
                    $cursoId = $cursoCriado->getId();
                }
            }
            $aluno->setCursoId($cursoId);
            $aluno->setMatriculaAtiva($data['matriculaAtiva'] ?? 'ativa');
            $aluno->setMonitoria($data['monitoria'] ?? 'Não');
            $aluno->setAtendPsico($data['atendPsico'] ?? 'Não');
            $aluno->setMaior18($data['maior18'] ?? false);

            try {
                $alunoAtualizado = $this->alunoDAO->editar($id, $aluno);
            } catch (PDOException $e) {
                // Tratar erros de constraint UNIQUE do banco de dados
                if ($e->getCode() == 23000) {
                    $errorMsg = $e->getMessage();
                    if (strpos($errorMsg, 'matricula') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Esta matrícula já está cadastrada para outro aluno'], JSON_UNESCAPED_UNICODE);
                        exit;
                    } elseif (strpos($errorMsg, 'cpf') !== false) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Este CPF já está cadastrado para outro aluno'], JSON_UNESCAPED_UNICODE);
                        exit;
                    }
                }
                throw $e; // Re-lançar se não for erro de constraint
            }
            
            if (isset($data['necessidades']) && is_array($data['necessidades'])) {
                $this->alunoDAO->salvarNecessidades($id, $data['necessidades']);
            }
            
            if (!empty($data['respNome']) && !$data['maior18']) {
                require_once "dao/class.ResponsavelDAO.php";
                require_once "models/class.Responsavel.php";
                require_once "dao/class.PeiGeralDAO.php";
                require_once "models/class.PeiGeral.php";
                
                $responsavelDAO = new ResponsavelDAO();
                
                $responsavelExistente = null;
                $responsaveis = $responsavelDAO->buscarTodos();
                foreach ($responsaveis as $resp) {
                    if ($resp->getNome() === $data['respNome'] && 
                        $resp->getTelefone() === ($data['respTelefone'] ?? '') &&
                        $resp->getEmail() === ($data['respEmail'] ?? '')) {
                        $responsavelExistente = $resp;
                        break;
                    }
                }
                
                if ($responsavelExistente) {
                    $responsavelId = $responsavelExistente->getId();
                } else {
                    $responsavel = new Responsavel();
                    $responsavel->setNome($data['respNome']);
                    $responsavel->setTelefone($data['respTelefone'] ?? '');
                    $responsavel->setEmail($data['respEmail'] ?? '');
                    $responsavelCriado = $responsavelDAO->inserir($responsavel);
                    $responsavelId = $responsavelCriado ? $responsavelCriado->getId() : null;
                }
                
                if ($responsavelId) {
                    require_once "_lib/class.Banco.php";
                    $pdo = Banco::getConexao();
                    $sqlPei = "SELECT id FROM peis_gerais WHERE aluno_id = :aluno_id AND responsavel_id = :responsavel_id LIMIT 1";
                    $stmtPei = $pdo->prepare($sqlPei);
                    $stmtPei->execute([':aluno_id' => $id, ':responsavel_id' => $responsavelId]);
                    $peiExistente = $stmtPei->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$peiExistente) {
                        $peiGeralDAO = new PeiGeralDAO();
                        $peiGeral = new PeiGeral();
                        $peiGeral->setAlunoId($id);
                        $peiGeral->setResponsavelId($responsavelId);
                        $peiGeralDAO->inserir($peiGeral);
                    }
                }
            }
            
            echo json_encode($alunoAtualizado, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            // Tratar erros de constraint UNIQUE do banco de dados
            if ($e->getCode() == 23000) {
                $errorMsg = $e->getMessage();
                if (strpos($errorMsg, 'matricula') !== false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Esta matrícula já está cadastrada para outro aluno'], JSON_UNESCAPED_UNICODE);
                    exit;
                } elseif (strpos($errorMsg, 'cpf') !== false) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Este CPF já está cadastrado para outro aluno'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }
            http_response_code(500);
            error_log("Erro PDO ao editar aluno: " . $e->getMessage());
            echo json_encode(['error' => 'Erro ao editar aluno no banco de dados'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao editar aluno: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function apagar($id) {
        if (ob_get_level()) {
            ob_clean();
        }
        header('Content-Type: application/json; charset=utf-8');
        try {
            $aluno = $this->alunoDAO->apagar($id);
            echo json_encode(['message' => 'Aluno apagado com sucesso', 'aluno' => $aluno], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Erro ao apagar aluno: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
?>