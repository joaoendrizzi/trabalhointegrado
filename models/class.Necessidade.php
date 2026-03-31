<?php

class Necessidade implements JsonSerializable{

    private $id;
    private $descricao;

    function setId($id){
        $this->id = $id;
    }
    function getId(){
        return $this->id;
    }

    function setDescricao($descricao){
        $this->descricao = $descricao;
    }
    function getDescricao(){
        return $this->descricao;
    }

    function jsonSerialize(){
        return [
            'id' => $this->getId(),
            'descricao' => $this->getDescricao(),
        ];
    }
}