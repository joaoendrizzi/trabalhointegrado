<?php

class Parecer implements JsonSerializable{

    private $id;
    private $periodo;
    private $descricao;
    private $peiAdaptativoId;
    private $dataEnvio;
    private $cursoId;

    function setId($id){
        $this->id = $id;
    }
    function getId(){
        return $this->id;
    }

    function setPeriodo($periodo){
        $this->periodo = $periodo;
    }
    function getPeriodo(){
        return $this->periodo;
    }

    function setDescricao($descricao){
        $this->descricao = $descricao;
    }
    function getDescricao(){
        return $this->descricao;
    }

    function setPeiAdaptativoId($peiAdaptativoId){
        $this->peiAdaptativoId = $peiAdaptativoId;
    }
    function getPeiAdaptativoId(){
        return $this->peiAdaptativoId;
    }

    function setDataEnvio($dataEnvio){
        $this->dataEnvio = $dataEnvio;
    }
    function getDataEnvio(){
        return $this->dataEnvio;
    }

    function setCursoId($cursoId){
        $this->cursoId = $cursoId;
    }
    function getCursoId(){
        return $this->cursoId;
    }

    function jsonSerialize(){
        $json = [
            'id' => $this->getId(),
            'periodo' => $this->getPeriodo(),
            'descricao' => $this->getDescricao(),
            'peiAdaptativoId' => $this->getPeiAdaptativoId(),
            'dataEnvio' => $this->getDataEnvio(),
            'cursoId' => $this->getCursoId(),
        ];
        
        if (isset($this->alunoNome)) {
            $json['alunoNome'] = $this->alunoNome;
        }
        if (isset($this->peiPeriodo)) {
            $json['peiPeriodo'] = $this->peiPeriodo;
        }
        if (isset($this->docente)) {
            $json['docente'] = $this->docente;
        }
        if (isset($this->peiCriadoEm)) {
            $json['peiCriadoEm'] = $this->peiCriadoEm;
        }
        if (isset($this->componenteNome)) {
            $json['componenteNome'] = $this->componenteNome;
        }
        if (isset($this->cursoNome)) {
            $json['cursoNome'] = $this->cursoNome;
        }
        if (isset($this->cursoTipo)) {
            $json['cursoTipo'] = $this->cursoTipo;
        }
        if (isset($this->alunoCursoId)) {
            $json['alunoCursoId'] = $this->alunoCursoId;
        }
        
        return $json;
    }
}