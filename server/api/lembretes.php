<?php
/**
 * API de Lembretes - CRUD
 * 
 * Endpoints:
 * GET    /lembretes.php         - Lista todos os lembretes
 * GET    /lembretes.php?id=X    - Busca lembrete específico
 * POST   /lembretes.php         - Cria novo lembrete
 * PUT    /lembretes.php?id=X    - Atualiza lembrete
 * DELETE /lembretes.php?id=X    - Deleta lembrete
 */

require_once 'database.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Buscar lembrete específico
                $stmt = $db->prepare("SELECT * FROM lembretes WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $lembrete = $stmt->fetch();
                
                if ($lembrete) {
                    echo json_encode(['success' => true, 'data' => $lembrete]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Lembrete não encontrado']);
                }
            } else if (isset($_GET['busca'])) {
                // Buscar lembretes por termo
                $termo = '%' . $_GET['busca'] . '%';
                $stmt = $db->prepare("SELECT * FROM lembretes WHERE titulo LIKE ? OR conteudo LIKE ? ORDER BY criado_em DESC");
                $stmt->execute([$termo, $termo]);
                $lembretes = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $lembretes]);
            } else {
                // Listar todos os lembretes
                $stmt = $db->query("SELECT * FROM lembretes ORDER BY criado_em DESC");
                $lembretes = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $lembretes]);
            }
            break;

        case 'POST':
            // Criar novo lembrete
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['titulo']) || empty($data['conteudo'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Título e conteúdo são obrigatórios']);
                break;
            }
            
            $stmt = $db->prepare("INSERT INTO lembretes (titulo, conteudo) VALUES (?, ?)");
            $stmt->execute([$data['titulo'], $data['conteudo']]);
            
            $id = $db->lastInsertId();
            echo json_encode([
                'success' => true, 
                'message' => 'Lembrete criado com sucesso',
                'id' => $id
            ]);
            break;

        case 'PUT':
            // Atualizar lembrete
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID do lembrete é obrigatório']);
                break;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['titulo']) || empty($data['conteudo'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Título e conteúdo são obrigatórios']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE lembretes SET titulo = ?, conteudo = ? WHERE id = ?");
            $stmt->execute([$data['titulo'], $data['conteudo'], $_GET['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Lembrete atualizado com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Lembrete não encontrado']);
            }
            break;

        case 'DELETE':
            // Deletar lembrete
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID do lembrete é obrigatório']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM lembretes WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Lembrete deletado com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Lembrete não encontrado']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}
