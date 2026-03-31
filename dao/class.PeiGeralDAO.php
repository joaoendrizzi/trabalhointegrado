<?php

require_once "_lib/class.Banco.php";
require_once "models/class.PeiGeral.php";

class PeiGeralDAO {
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
        $sql = "SELECT 
                    pg.id, 
                    pg.aluno_id AS alunoId, 
                    pg.responsavel_id AS responsavelId,
                    pg.necessidade_id AS necessidadeId,
                    pg.componente_id AS componenteId,
                    pg.descricao,
                    pg.criado_em,
                    a.nome AS alunoNome
                FROM peis_gerais pg
                LEFT JOIN alunos a ON a.id = pg.aluno_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultado = [];

        foreach ($rows as $row) {
            $pei = new PeiGeral();
            $pei->setId($row['id']);
            $pei->setAlunoId($row['alunoId']);
            $pei->setResponsavelId($row['responsavelId']);
            $pei->setNecessidadeId($row['necessidadeId']);
            $pei->setComponenteId($row['componenteId']);
            $pei->setDescricao($row['descricao']);
            
            $pei->alunoNome = $row['alunoNome'] ?? null;
            $pei->criadoEm = $row['criado_em'] ?? null;
            
            $resultado[] = $pei;
        }

        return $resultado;
    }

    function buscarPorId($id) {
        $sql = "SELECT 
                    pg.id, 
                    pg.aluno_id AS alunoId, 
                    pg.responsavel_id AS responsavelId,
                    pg.necessidade_id AS necessidadeId,
                    pg.componente_id AS componenteId,
                    pg.descricao,
                    pg.criado_em,
                    a.nome AS alunoNome
                FROM peis_gerais pg
                LEFT JOIN alunos a ON a.id = pg.aluno_id
                WHERE pg.id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }

        $pei = new PeiGeral();
        $pei->setId($row['id']);
        $pei->setAlunoId($row['alunoId']);
        $pei->setResponsavelId($row['responsavelId']);
        $pei->setNecessidadeId($row['necessidadeId']);
        $pei->setComponenteId($row['componenteId']);
        $pei->setDescricao($row['descricao']);
        
        $pei->alunoNome = $row['alunoNome'] ?? null;
        $pei->criadoEm = $row['criado_em'] ?? null;

        return $pei;
    }

    function inserir(PeiGeral $peigeral){
        $sql = "INSERT INTO peis_gerais(aluno_id, responsavel_id, necessidade_id, componente_id, descricao)
                VALUES (:aluno_id, :responsavel_id, :necessidade_id, :componente_id, :descricao)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':aluno_id' => $peigeral->getAlunoId(),
            ':responsavel_id' => $peigeral->getResponsavelId(),
            ':necessidade_id' => $peigeral->getNecessidadeId(),
            ':componente_id' => $peigeral->getComponenteId(),
            ':descricao' => $peigeral->getDescricao()
        ]);

        if($resultado){
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
    }

    function editar($id, PeiGeral $peigeral) {
        $p = $this->buscarPorId($id);
        if (!$p)
            throw new Exception("Pei geral não encontrado!");

        $sql = "UPDATE peis_gerais
                SET aluno_id = :aluno_id, responsavel_id = :responsavel_id, necessidade_id = :necessidade_id, componente_id = :componente_id, descricao = :descricao
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':aluno_id', $peigeral->getAlunoId());
        $query->bindValue(':responsavel_id', $peigeral->getResponsavelId());
        $query->bindValue(':necessidade_id', $peigeral->getNecessidadeId());
        $query->bindValue(':componente_id', $peigeral->getComponenteId());
        $query->bindValue(':descricao', $peigeral->getDescricao());
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        $p->setAlunoId($peigeral->getAlunoId());
        $p->setResponsavelId($peigeral->getResponsavelId());
        $p->setNecessidadeId($peigeral->getNecessidadeId());
        $p->setComponenteId($peigeral->getComponenteId());
        $p->setDescricao($peigeral->getDescricao());
        return $p;
    }

    function apagar($id) {
        $peigeral = $this->buscarPorId($id);
        if (!$peigeral)
            throw new Exception("Pei Geral não encontrado!");

        $sql = "DELETE FROM peis_gerais WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $peigeral;
    }

    function contarPeis() {
        $sql = "SELECT COUNT(*) as total FROM peis_gerais";
        $stmt = $this->pdo->query($sql);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        return $resultado['total'];
    }
}