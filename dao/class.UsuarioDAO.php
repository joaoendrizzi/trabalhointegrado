<?php

require_once "_lib/class.Banco.php";
require_once "models/class.Usuario.php";

class UsuarioDAO {
    private $pdo;

    function __construct(){
        $this->pdo = Banco::getConexao();
    }

    function verificarCpfExistente($cpf, $excluirId = null) {
        if (empty($cpf)) {
            return false;
        }
        $cpf = preg_replace('/\D/', '', $cpf);
        $sql = "SELECT id FROM usuarios WHERE cpf = :cpf";
        $params = [':cpf' => $cpf];
        
        if ($excluirId !== null) {
            $sql .= " AND id != :excluir_id";
            $params[':excluir_id'] = $excluirId;
        }
        
        $sql .= " LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result !== false;
    }

    function buscarTodos() {
        $sql = "SELECT id, siape, nome, cpf, funcao, email FROM usuarios";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        $stmt->setFetchMode(PDO::FETCH_CLASS, Usuario::class);
        $usuarios = $stmt->fetchAll();

        return $usuarios ?: [];
    }

    function buscarPorId($id) {
        $sql = "SELECT id, siape, nome, cpf, funcao, email FROM usuarios WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        $stmt->setFetchMode(PDO::FETCH_CLASS, Usuario::class);
        $usuario = $stmt->fetch();

        return $usuario ?: [];
    }

    function inserir(Usuario $usuario){
        $senha = $usuario->getSenha();

        if (strlen($senha) < 8) {
            throw new Exception("Senha deve ter pelo menos 8 caracteres.");
        }

        $hash = password_hash($senha, PASSWORD_DEFAULT);

        $sql = "INSERT INTO usuarios (siape, nome, cpf, funcao, email, senha)
                VALUES (:siape, :nome, :cpf, :funcao, :email, :senha)";
        $stmt = $this->pdo->prepare($sql);
        $resultado = $stmt->execute([
            ':siape' => $usuario->getSiape(),
            ':nome'  => $usuario->getNome(),
            ':cpf'   => $usuario->getCpf(),
            ':funcao'=> $usuario->getFuncao(),
            ':email' => $usuario->getEmail(),
            ':senha' => $hash
        ]);

        if ($resultado) {
            $id = $this->pdo->lastInsertId();
            return $this->buscarPorId($id);
        }

        throw new Exception("Erro ao inserir usuário.");
    }

    function editar($id, Usuario $usuario) {
        $atual = $this->buscarPorId($id);
        if (!$atual) {
            throw new Exception("Usuário não encontrado.");
        }

        $sql = "UPDATE usuarios 
                SET siape = :siape, nome = :nome, cpf = :cpf, funcao = :funcao, email = :email
                WHERE id = :id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':siape', $usuario->getSiape());
        $query->bindValue(':nome', $usuario->getNome());
        $query->bindValue(':cpf', $usuario->getCpf());
        $query->bindValue(':funcao', $usuario->getFuncao());
        $query->bindValue(':email', $usuario->getEmail());
        $query->bindValue(':id', $id);

        if (!$query->execute()) {
            throw new Exception("Erro ao atualizar usuário.");
        }

        $atual->setSiape($usuario->getSiape());
        $atual->setNome($usuario->getNome());
        $atual->setCpf($usuario->getCpf());
        $atual->setFuncao($usuario->getFuncao());
        $atual->setEmail($usuario->getEmail());

        return $atual;
    }

    function apagar($id) {
        $usuario = $this->buscarPorId($id);
        if (!$usuario) {
            throw new Exception("Usuário não encontrado.");
        }

        $sql = "DELETE FROM usuarios WHERE id = :id";
        $query = $this->pdo->prepare($sql);
        $query->bindValue(':id', $id);

        if (!$query->execute()) {
            throw new Exception("Erro ao apagar usuário.");
        }

        return $usuario;
    }

    function autenticar($login, $senha){
        try {
            $loginLimpo = trim($login);
            if ($loginLimpo === '') {
                error_log("Autenticação falhou: login vazio");
                return false;
            }

            $sql = "SELECT id, siape, nome, cpf, funcao, email, senha FROM usuarios 
                    WHERE LOWER(email) = LOWER(:loginEmail) 
                       OR cpf = :loginCpf 
                       OR siape = :loginSiape 
                    LIMIT 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':loginEmail' => $loginLimpo,
                ':loginCpf' => $loginLimpo,
                ':loginSiape' => strtoupper($loginLimpo)
            ]);
            $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$userRow) {
                error_log("Autenticação falhou: usuário não encontrado para login: " . $loginLimpo);
                return false;
            }

            $hashBanco = isset($userRow['senha']) ? trim($userRow['senha']) : '';
            
            if (empty($hashBanco)) {
                error_log("Autenticação falhou: senha vazia no banco para usuário ID: " . $userRow['id']);
                return false;
            }

            $senhaConfere = password_verify($senha, $hashBanco);
            
            if (!$senhaConfere) {
                error_log("Autenticação falhou: senha não confere para usuário: " . $userRow['email']);
            }

        if (!$senhaConfere && $hashBanco !== '' && hash_equals($hashBanco, $senha)) {
            $senhaConfere = true;
            $novoHash = password_hash($senha, PASSWORD_DEFAULT);
            $sqlUpd = "UPDATE usuarios SET senha = :senha WHERE id = :id";
            $upd = $this->pdo->prepare($sqlUpd);
            $upd->execute([':senha' => $novoHash, ':id' => $userRow['id']]);
            $hashBanco = $novoHash;
        }

        if ($senhaConfere) {

            if ($hashBanco !== '' && password_needs_rehash($hashBanco, PASSWORD_DEFAULT)) {
                $newHash = password_hash($senha, PASSWORD_DEFAULT);
                $sqlUpd = "UPDATE usuarios SET senha = :senha WHERE id = :id";
                $upd = $this->pdo->prepare($sqlUpd);
                $upd->execute([':senha' => $newHash, ':id' => $userRow['id']]);
                $hashBanco = $newHash;
            }

            $usuario = new Usuario();
            $usuario->setId($userRow['id']);
            $usuario->setSiape($userRow['siape']);
            $usuario->setNome($userRow['nome']);
            $usuario->setCpf($userRow['cpf']);
            $usuario->setFuncao(trim($userRow['funcao']));
            $usuario->setEmail($userRow['email']);

            return $usuario;
        }

        return false;
        } catch (PDOException $e) {
            error_log("Erro PDO em autenticar: " . $e->getMessage());
            return false;
        } catch (Exception $e) {
            error_log("Erro em autenticar: " . $e->getMessage());
            return false;
        }
    }

    function atualizarSenha($idUsuario, $senhaAtual, $novaSenha){
        if (strlen($novaSenha) < 8) {
            throw new Exception("Nova senha deve ter pelo menos 8 caracteres.");
        }

        $sql = "SELECT senha FROM usuarios WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $idUsuario]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            throw new Exception("Usuário não encontrado.");
        }

        $hashBanco = isset($row['senha']) ? trim($row['senha']) : '';
        
        if (empty($hashBanco)) {
            throw new Exception("Senha não encontrada no banco de dados.");
        }

        $senhaConfere = password_verify($senhaAtual, $hashBanco);
        
        if (!$senhaConfere && $hashBanco !== '' && hash_equals($hashBanco, $senhaAtual)) {
            $senhaConfere = true;
        }

        if (!$senhaConfere) {
            throw new Exception("Senha atual inválida.");
        }

        $hash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $sqlUpd = "UPDATE usuarios SET senha = :senha WHERE id = :id";
        $stmtUpd = $this->pdo->prepare($sqlUpd);
        $resultado = $stmtUpd->execute([':senha' => $hash, ':id' => $idUsuario]);
        
        if (!$resultado) {
            throw new Exception("Erro ao atualizar senha no banco de dados.");
        }
        
        return true;
    }

    function setSenhaPorId($idUsuario, $novaSenha){
        if (strlen($novaSenha) < 8) {
            throw new Exception("Senha deve ter pelo menos 8 caracteres.");
        }
        $hash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $sql = "UPDATE usuarios SET senha = :senha WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':senha' => $hash, ':id' => $idUsuario]);
    }
    
    function buscarPorEmail($email) {
        $sql = "SELECT id, siape, nome, cpf, funcao, email, senha FROM usuarios 
                WHERE LOWER(email) = LOWER(:email) LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':email' => trim($email)]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        return $row;
    }
}