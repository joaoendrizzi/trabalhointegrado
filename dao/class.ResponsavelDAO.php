<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Responsavel.php";

class ResponsavelDAO{
    private $pdo;

    function __construct(){
        $this->pdo = Banco::getConexao();
    }

    function buscarTodos() {
        $sql = "SELECT id, nome, telefone, email FROM responsaveis";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $stmt->setFetchMode(PDO::FETCH_CLASS, Responsavel::class);
        $responsaveis = $stmt->fetchAll();

        return $responsaveis ?: [];
    }

    function buscarPorId($id) {
        $sql = "SELECT id, nome, telefone, email
                FROM responsaveis
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $stmt->setFetchMode(PDO::FETCH_CLASS, Responsavel::class);
        $responsavel = $stmt->fetch();

        return $responsavel ?: [];
    }

    function inserir(Responsavel $responsavel){
        $sql = "INSERT INTO responsaveis(nome, telefone, email)
                VALUES (:nome, :telefone, :email)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':nome' => $responsavel->getNome(),
            ':telefone' => $responsavel->getTelefone(),
            ':email' => $responsavel->getEmail(),
        ]);

        if($resultado){
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
    }

    function editar($id, Responsavel $responsavel) {
        $r = $this->buscarPorId($id);
        if (!$r)
            throw new Exception("Responsavel não encontrado!");

        $sql = "UPDATE responsaveis 
                SET nome=:nome, telefone=:telefone, email=:email
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':nome', $responsavel->getNome());
        $query->bindValue(':telefone', $responsavel->getTelefone());
        $query->bindValue(':email', $responsavel->getEmail());
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        $r->setNome($responsavel->getNome());
        $r->setTelefone($responsavel->getTelefone());
        $r->setEmail($responsavel->getEmail());
        return $r;
    }

    function apagar($id) {
        $responsavel = $this->buscarPorId($id);
        if (!$responsavel)
            throw new Exception("Responsavel não encontrado!");

        $sql = "DELETE FROM responsaveis WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $responsavel;
    }
}