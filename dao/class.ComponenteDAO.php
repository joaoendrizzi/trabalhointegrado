<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Componente.php";

class ComponenteDAO{
    private $pdo;

    function __construct() { 
        $this->pdo = Banco::getConexao(); 
    }

    function buscarTodos() {
        $sql = "SELECT id, nome, ementa FROM componentes";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $stmt->setFetchMode(PDO::FETCH_CLASS, Componente::class);
        $componentes = $stmt->fetchAll();

        return $componentes ?: [];
    }

    function buscarPorId($id) {
        $sql = "SELECT id, nome, ementa
                FROM componentes 
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $stmt->setFetchMode(PDO::FETCH_CLASS, Componente::class);
        $componente = $stmt->fetch();

        return $componente ?: [];
    }

    function inserir(Componente $componente){
        $sql = "INSERT INTO componentes (nome, ementa)
                VALUES (:nome, :ementa)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':nome' => $componente->getNome(),
            ':ementa' => $componente->getEmenta(),
        ]);

        if($resultado){
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
    }

    function editar($id, Componente $componente) {
        $c = $this->buscarPorId($id);
        if (!$c)
            throw new Exception("Componente não encontrado!");

        $sql = "UPDATE componentes
                SET nome=:nome, ementa=:ementa
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':nome', $componente->getNome());
        $query->bindValue(':ementa', $componente->getEmenta());
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        $c->setNome($componente->getNome());
        $c->setEmenta($componente->getEmenta());
        return $c;
    }

    function apagar($id) {
        $componente = $this->buscarPorId($id);
        if (!$componente)
            throw new Exception("Componente não encontrado!");

        $sql = "DELETE FROM componentes WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $componente;
    }
}