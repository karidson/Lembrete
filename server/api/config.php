<?php
/**
 * Configurações do Sistema de Lembretes
 * 
 * Este arquivo contém as configurações de conexão com o banco de dados
 * e a API do DeepSeek. NUNCA compartilhe este arquivo publicamente.
 */

// Configurações do Banco de Dados MySQL
define('DB_HOST', 'localhost');
define('DB_NAME', 'karids63_lembretes');
define('DB_USER', 'karids63_lembretes');
define('DB_PASS', 'Kaka2303!');
define('DB_CHARSET', 'utf8mb4');

// Configuração da API DeepSeek
define('DEEPSEEK_API_KEY', 'sk-7c06ec3c2fcb45e38da2fd54e4248341');
define('DEEPSEEK_API_URL', 'https://api.deepseek.com/v1/chat/completions');
define('DEEPSEEK_MODEL', 'deepseek-chat');

// Configurações de CORS (permitir acesso do app)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Tratamento de preflight requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timezone
date_default_timezone_set('America/Sao_Paulo');
