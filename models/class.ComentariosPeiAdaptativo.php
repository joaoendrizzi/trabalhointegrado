<?php

class ComentariosPeiAdaptativo implements JsonSerializable{

    private $id;
    private $peiAdaptativoId;
    private $comentario;
    private $criadoEm;
    private $usuarioId;
    public $usuarioNome; 

    function setId($id){
        $this->id = $id;
    }
    function getId(){
        return $this->id;
    }

    function setPeiAdaptativoId($peiAdaptativoId){
        $this->peiAdaptativoId = $peiAdaptativoId;
    }
    function getPeiAdaptativoId(){
        return $this->peiAdaptativoId;
    }

    function setComentario($comentario){
        $this->comentario = $comentario;
    }
    function getComentario(){
        return $this->comentario;
    }

    function setCriadoEm($criadoEm){
        $this->criadoEm = $criadoEm;
    }
    function getCriadoEm(){
        return $this->criadoEm;
    }

    function setUsuarioId($usuarioId){
        $this->usuarioId = $usuarioId;
    }
    function getUsuarioId(){
        return $this->usuarioId;
    }

    function jsonSerialize(){
        return [
            'id' => $this->getId(),
            'pei_adaptativo_id' => $this->getPeiAdaptativoId(),
            'comentario' => $this->getComentario(),
            'criado_em' => $this->getCriadoEm(),
            'usuario_id' => $this->getUsuarioId(),
            'usuario_nome' => $this->usuarioNome ?? null,
        ];
    }
}