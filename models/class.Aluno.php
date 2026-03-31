<?php

class Aluno implements JsonSerializable{

    private $id;
    private $nome;
    private $dataNasc;
    private $cpf;
    private $endereco;
    private $telefone;
    private $email;
    private $matricula;
    private $cursoId;
    private $matriculaAtiva;
    private $monitoria;
    private $atendPsico;
    private $maior18;
  
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

    function setDataNasc($dataNasc){
        $this->dataNasc = $dataNasc;
    }
    function getDataNasc(){
        return $this->dataNasc;
    }

    function setCpf($cpf){
        $this->cpf = $cpf;
    }
    function getCpf(){
        return $this->cpf;
    }

    function setEndereco($endereco){
        $this->endereco = $endereco;
    }
    function getEndereco(){
        return $this->endereco;
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

    function setMatricula($matricula){
        $this->matricula = $matricula;
    }
    function getMatricula(){
        return $this->matricula;
    }

    function setCursoId($cursoId){
        $this->cursoId = $cursoId;
    }
    function getCursoId(){
        return $this->cursoId;
    }

    function setMatriculaAtiva($matriculaAtiva){
        $this->matriculaAtiva = $matriculaAtiva;
    }
    function getMatriculaAtiva(){
        return $this->matriculaAtiva;
    }

    function setMonitoria($monitoria){
        $this->monitoria = $monitoria;
    }
    function getMonitoria(){
        return $this->monitoria;
    }

    function setAtendPsico($atendPsico){
        $this->atendPsico = $atendPsico;
    }
    function getAtendPsico(){
        return $this->atendPsico;
    }

    function setMaior18($maior18){
        $this->maior18 = $maior18;
    }
    function getMaior18(){
        return $this->maior18;
    }

    function jsonSerialize(){
        $json = [
            'id' => $this->getId(),
            'nome' => $this->getNome(),
            'dataNasc' => $this->getDataNasc(),
            'cpf' => $this->getCpf(),
            'endereco' => $this->getEndereco(),
            'telefone' => $this->getTelefone(),
            'email' => $this->getEmail(),
            'matricula' => $this->getMatricula(),
            'curso_id' => $this->getCursoId(),
            'matriculaAtiva' => $this->getMatriculaAtiva(),
            'monitoria' => $this->getMonitoria(),
            'atendPsico' => $this->getAtendPsico(),
            'maior18' => $this->getMaior18(),
        ];
        
        if (isset($this->curso)) {
            $json['curso'] = $this->curso;
        }
        
        if (isset($this->necessidades)) {
            $json['necessidades'] = $this->necessidades;
        }
        
        if (isset($this->responsavel)) {
            $json['responsavel'] = $this->responsavel;
        }
        
        return $json;
    }
}