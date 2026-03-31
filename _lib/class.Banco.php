<?php
class Banco {
    private static $pdo;

    static function getConexao(){
        if (!self::$pdo) {
            try {
                $dsn = "mysql:host=localhost;dbname=sistema_napne;charset=utf8mb4";
                self::$pdo = new PDO($dsn, 'root', '', [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
            }catch(Exception $e){
                die("Erro ao conectar com o banco de dados");
            }
        }
        return self::$pdo;
    }    
}