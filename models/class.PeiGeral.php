<?php

class PeiGeral implements JsonSerializable{

    private $id;
    private $alunoId;
    private $responsavelId;
    private $necessidadeId;
    private $componenteId;
    private $descricao;

    function setId($id){
        $this->id = $id;
    }
    function getId(){
        return $this->id;
    }

    function setAlunoId($alunoId){
        $this->alunoId = $alunoId;
    }
    function getAlunoId(){
        return $this->alunoId;
    }

    function setResponsavelId($responsavelId){
        $this->responsavelId = $responsavelId;
    }
    function getResponsavelId(){
        return $this->responsavelId;
    }

    function setNecessidadeId($necessidadeId){
        $this->necessidadeId = $necessidadeId;
    }
    function getNecessidadeId(){
        return $this->necessidadeId;
    }

    function setComponenteId($componenteId){
        $this->componenteId = $componenteId;
    }
    function getComponenteId(){
        return $this->componenteId;
    }

    function setDescricao($descricao){
        $this->descricao = $descricao;
    }
    function getDescricao(){
        return $this->descricao;
    }

    function jsonSerialize(){
        $json = [
            'id' => $this->getId(),
            'aluno_id' => $this->getAlunoId(),
            'responsavel_id' => $this->getResponsavelId(),
            'necessidade_id' => $this->getNecessidadeId(),
            'componente_id' => $this->getComponenteId(),
            'descricao' => $this->getDescricao(),
        ];
        
        if (isset($this->alunoNome)) {
            $json['alunoNome'] = $this->alunoNome;
        }
        
        if (isset($this->criadoEm)) {
            $json['criado_em'] = $this->criadoEm;
        }
        
        if (!empty($this->getDescricao())) {
            $descData = json_decode($this->getDescricao(), true);
            if (is_array($descData)) {
                $json['dificuldades'] = $descData['dificuldades'] ?? '';
                $json['habilidades'] = $descData['habilidades'] ?? '';
                $json['historico'] = $descData['historico'] ?? '';
                $json['historicoNoIFRS'] = $descData['historicoNoIFRS'] ?? '';
                $json['estrategiasDeEnsino'] = $descData['estrategiasDeEnsino'] ?? '';
            } else {
                $json['dificuldades'] = $this->getDescricao();
                $json['habilidades'] = '';
                $json['historico'] = '';
                $json['historicoNoIFRS'] = '';
                $json['estrategiasDeEnsino'] = '';
            }
        } else {
            $json['dificuldades'] = '';
            $json['habilidades'] = '';
            $json['historico'] = '';
            $json['historicoNoIFRS'] = '';
            $json['estrategiasDeEnsino'] = '';
        }
        
        return $json;
    }
}