<?php

class Usuario implements JsonSerializable{

    private $id;
    private $siape;
    private $nome;
    private $cpf;
    private $funcao;
    private $email;
    private $senha;

    function setId($id){
        $this->id = $id;
    }
    function getId(){
        return $this->id;
    }

    function setSiape($siape){
        $this->siape = $siape;
    }
    function getSiape(){
        return $this->siape;
    }

    function setNome($nome){
        $this->nome = $nome;
    }
    function getNome(){
        return $this->nome;
    }

    function setCpf($cpf){
        $this->cpf = $cpf;
    }
    function getCpf(){
        return $this->cpf;
    }

    function setFuncao($funcao){
        $this->funcao = $funcao;
    }
    function getFuncao(){
        return $this->funcao;
    }

    function setEmail($email){
        $this->email = $email;
    }
    function getEmail(){
        return $this->email;
    }

    function setSenha($senha){
        $this->senha = $senha;
    }
    function getSenha(){
        return $this->senha;
    }

    function jsonSerialize(){
        return [
            'id' => $this->getId() ?? null,
            'siape' => $this->getSiape() ?? null,
            'nome' => $this->getNome() ?? '',
            'cpf' => $this->getCpf() ?? null,
            'funcao' => $this->getFuncao() ?? '',
            'email' => $this->getEmail() ?? '',
        ];
    }
}