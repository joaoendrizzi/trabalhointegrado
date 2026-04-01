<?php

class Curso implements JsonSerializable{

    private $id;
    private $nome;
    private $tipo;

    function setId($id){
        $this->id = $id;
    }
    function getId(){
        return $this->id;
    }

    function setNome($nome){
        $this->nome = $nome;
    }
    function getNome(){
        return $this->nome;
    }

    function setTipo($tipo){
        $this->tipo = $tipo;
    }
    function getTipo(){
        return $this->tipo;
    }

    function jsonSerialize(){
        $tipo = $this->getTipo();
        $tipoString = ($tipo !== null && $tipo !== false && $tipo !== '') ? (string)$tipo : '';
        
        return [
            'id' => $this->getId(),
            'nome' => $this->getNome(),
            'tipo' => $tipoString,
        ];
    }
}