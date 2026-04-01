<?php
class Banco {
    private static $pdo;

    static function getConexao(){
        if (!self::$pdo) {
            try {
                $host = 'localhost';
                $dbname = 'sistema_napne';
                $user = 'root';
                $pass = '';
                $cfgPath = __DIR__ . '/banco.config.php';
                if (is_file($cfgPath)) {
                    $cfg = require $cfgPath;
                    if (is_array($cfg)) {
                        if (!empty($cfg['host'])) {
                            $host = $cfg['host'];
                        }
                        if (!empty($cfg['dbname'])) {
                            $dbname = $cfg['dbname'];
                        }
                        if (!empty($cfg['user'])) {
                            $user = $cfg['user'];
                        }
                        if (array_key_exists('pass', $cfg)) {
                            $pass = $cfg['pass'];
                        }
                    }
                }
                $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
                self::$pdo = new PDO($dsn, $user, $pass, [
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