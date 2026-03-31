<?php

class Componente implements JsonSerializable{

    private $id;
    private $nome;
    private $ementa;

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

    function setEmenta($ementa){
        $this->ementa = $ementa;
    }
    function getEmenta(){
        return $this->ementa;
    }

    function jsonSerialize(){
        return [
            'id' => $this->getId(),
            'nome' => $this->getNome(),
            'ementa' => $this->getEmenta(),
        ];
    }
}