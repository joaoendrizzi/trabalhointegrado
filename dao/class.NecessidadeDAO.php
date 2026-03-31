<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Necessidade.php";

class NecessidadeDAO{
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
        $sql = "SELECT id, descricao FROM necessidades";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $stmt->setFetchMode(PDO::FETCH_CLASS, Necessidade::class);
        $necessidades = $stmt->fetchAll();

        return $necessidades ?: [];
    }

    function buscarPorId($id) {
        $sql = "SELECT id, descricao
                FROM necessidades
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $stmt->setFetchMode(PDO::FETCH_CLASS, Necessidade::class);
        $necessidades = $stmt->fetch();

        return $necessidades ?: [];
    }

    function inserir(Necessidade $necessidade){
        $sql = "INSERT INTO necessidades(descricao)
                VALUES (:descricao)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':descricao' => $necessidade->getDescricao(),
        ]);

        if($resultado){
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
    }

    function editar($id, Necessidade $necessidade) {
        $n = $this->buscarPorId($id);
        if (!$n)
            throw new Exception("Necessidade não encontrada!");

        $sql = "UPDATE necessidades
                SET descricao=:descricao
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':descricao', $necessidade->getDescricao());
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        $n->setDescricao($necessidade->getDescricao());
        return $n;
    }

    function apagar($id) {
        $necessidade = $this->buscarPorId($id);
        if (!$necessidade)
            throw new Exception("Necessidade não encontrada!");

        $sql = "DELETE FROM necessidades WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $necessidade;
    }
}