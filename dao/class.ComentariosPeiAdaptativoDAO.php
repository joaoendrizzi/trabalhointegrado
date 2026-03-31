<?php

require_once "_lib/class.Banco.php";
require_once "models/class.ComentariosPeiAdaptativo.php";

class ComentariosPeiAdaptativoDAO{
    private $pdo;

    function __construct(){
        $this->pdo = Banco::getConexao();
    }

    function buscarPorId($id) {
        $sql = "SELECT cpa.id, cpa.pei_adaptativo_id AS peiAdaptativoId, cpa.comentario, 
                       cpa.criado_em AS criadoEm, cpa.usuario_id AS usuarioId,
                       u.nome AS usuarioNome
                FROM comentarios_peis_adaptativos cpa
                LEFT JOIN usuarios u ON u.id = cpa.usuario_id
                WHERE cpa.id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return [];
        }

        $comentario = new ComentariosPeiAdaptativo();
        $comentario->setId($row['id']);
        $comentario->setPeiAdaptativoId($row['peiAdaptativoId']);
        $comentario->setComentario($row['comentario']);
        $comentario->setCriadoEm($row['criadoEm']);
        $comentario->setUsuarioId($row['usuarioId']);
        $comentario->usuarioNome = $row['usuarioNome'] ?? null;

        return $comentario;
    }

    function buscarTodos() {
        $sql = "SELECT cpa.id, cpa.pei_adaptativo_id AS peiAdaptativoId, cpa.comentario, 
                       cpa.criado_em AS criadoEm, cpa.usuario_id AS usuarioId,
                       u.nome AS usuarioNome
                FROM comentarios_peis_adaptativos cpa
                LEFT JOIN usuarios u ON u.id = cpa.usuario_id
                ORDER BY cpa.criado_em DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultado = [];

        foreach ($rows as $row) {
            $comentario = new ComentariosPeiAdaptativo();
            $comentario->setId($row['id']);
            $comentario->setPeiAdaptativoId($row['peiAdaptativoId']);
            $comentario->setComentario($row['comentario']);
            $comentario->setCriadoEm($row['criadoEm']);
            $comentario->setUsuarioId($row['usuarioId']);
            $comentario->usuarioNome = $row['usuarioNome'] ?? null;
            $resultado[] = $comentario;
        }

        return $resultado;
    }

    function buscarPorPeiAdaptativoId($peiAdaptativoId) {
        $sql = "SELECT cpa.id, cpa.pei_adaptativo_id AS peiAdaptativoId, cpa.comentario, 
                       cpa.criado_em AS criadoEm, cpa.usuario_id AS usuarioId,
                       u.nome AS usuarioNome
                FROM comentarios_peis_adaptativos cpa
                LEFT JOIN usuarios u ON u.id = cpa.usuario_id
                WHERE cpa.pei_adaptativo_id = :pei_adaptativo_id
                ORDER BY cpa.criado_em ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':pei_adaptativo_id' => $peiAdaptativoId]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $resultado = [];

        foreach ($rows as $row) {
            $comentario = new ComentariosPeiAdaptativo();
            $comentario->setId($row['id']);
            $comentario->setPeiAdaptativoId($row['peiAdaptativoId']);
            $comentario->setComentario($row['comentario']);
            $comentario->setCriadoEm($row['criadoEm']);
            $comentario->setUsuarioId($row['usuarioId']);
            $comentario->usuarioNome = $row['usuarioNome'] ?? null;
            $resultado[] = $comentario;
        }

        return $resultado;
    }

    function inserir(ComentariosPeiAdaptativo $comentario){
        $sql = "INSERT INTO comentarios_peis_adaptativos(pei_adaptativo_id, comentario, usuario_id)
                VALUES (:pei_adaptativo_id, :comentario, :usuario_id)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':pei_adaptativo_id' => $comentario->getPeiAdaptativoId(),
            ':comentario' => $comentario->getComentario(),
            ':usuario_id' => $comentario->getUsuarioId(),
        ]);

        if($resultado){
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }
        return false;
    }

    function editar($id, ComentariosPeiAdaptativo $comentario) {
        $c = $this->buscarPorId($id);
        if (!$c || (is_array($c) && empty($c)))
            throw new Exception("Comentario de Pei Adaptativo não encontrado!");

        $sql = "UPDATE comentarios_peis_adaptativos 
                SET comentario=:comentario
                WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':comentario', $comentario->getComentario());
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao atualizar o registro.");

        return $this->buscarPorId($id);
    }

    function apagar($id) {
        $comentario = $this->buscarPorId($id);
        if (!$comentario || (is_array($comentario) && empty($comentario)))
            throw new Exception("Comentario de Pei Adaptativo não encontrado!");

        $sql = "DELETE FROM comentarios_peis_adaptativos WHERE id=:id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute())
            throw new Exception("Erro ao apagar registro!");

        return $comentario;
    }
}