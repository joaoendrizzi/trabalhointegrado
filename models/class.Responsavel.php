<?php

class Responsavel implements JsonSerializable{
    
    private $id;
    private $nome;
    private $telefone;
    private $email;

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

    function setTelefone($telefone){
        $this->telefone = $telefone;
    }
    function getTelefone(){
        return $this->telefone;
    }

    function setEmail($email){
        $this->email = $email;
    }
    function getEmail(){
        return $this->email;
    }

    function jsonSerialize(){
        return [
            'ID responsavel' => $this->getId(),
            'Nome' => $this->getNome(),
            'Telefone' => $this->getTelefone(),
            'Email' => $this->getEmail(),
        ];
    }
}