<?php
interface Controller {
    public function buscarTodos();
    public function buscarPorId($id);
    public function inserir();
    public function editar($id);
    public function apagar($id);
}
