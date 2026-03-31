<?php

    class PeiAdaptativo implements JsonSerializable{

        private $id;
        private $alunoId;
        private $responsavelId;
        private $necessidadeId;
        private $componenteId;
        private $cursoId;
        private $descricao;
        private $periodo;

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

        function setCursoId($cursoId){
            $this->cursoId = $cursoId;
        }
        function getCursoId(){
            return $this->cursoId;
        }

        function setDescricao($descricao){
            $this->descricao = $descricao;
        }
        function getDescricao(){
            return $this->descricao;
        }

        function setPeriodo($periodo){
            $this->periodo = $periodo;
        }
        function getPeriodo(){
            return $this->periodo;
        }

        function jsonSerialize(){
            $json = [
                'id' => $this->getId(),
                'aluno_id' => $this->getAlunoId(),
                'responsavel_id' => $this->getResponsavelId(),
                'necessidade_id' => $this->getNecessidadeId(),
                'componente_id' => $this->getComponenteId(),
                'curso_id' => $this->getCursoId(),
                'descricao' => $this->getDescricao(),
                'periodo' => $this->getPeriodo(),
            ];
            
            if (isset($this->alunoNome)) {
                $json['alunoNome'] = $this->alunoNome;
            }
            
            if (isset($this->componenteNome)) {
                $json['componenteNome'] = $this->componenteNome;
            }
            
            if (isset($this->docente)) {
                $json['docente'] = $this->docente;
            }
            
            if (isset($this->criado_em)) {
                $json['criado_em'] = $this->criado_em;
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
            
            if (isset($this->curso_id)) {
                $json['curso_id'] = $this->curso_id;
            }
            
            return $json;
    }
}