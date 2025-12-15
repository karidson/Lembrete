<?php
/**
 * API de Chat com IA - DeepSeek
 * 
 * Este endpoint recebe uma pergunta do usuário, busca lembretes relevantes
 * no banco de dados e envia para a IA responder como um professor.
 */

require_once 'database.php';

$db = Database::getInstance()->getConnection();

// Apenas aceitar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit();
}

// Receber dados do request
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['pergunta'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A pergunta é obrigatória']);
    exit();
}

$pergunta = $data['pergunta'];

try {
    // Buscar lembretes relevantes
    // Extrair palavras-chave da pergunta (remover palavras comuns)
    $palavrasIgnorar = ['como', 'fazer', 'o', 'a', 'os', 'as', 'um', 'uma', 'que', 'qual', 'quais', 
                        'para', 'por', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
                        'com', 'sem', 'é', 'são', 'foi', 'será', 'eu', 'você', 'me', 'meu', 'minha',
                        'esse', 'essa', 'isso', 'aquele', 'aquela', 'aquilo', 'quando', 'onde', 'porque'];
    
    $palavras = preg_split('/\s+/', strtolower($pergunta));
    $palavrasChave = array_filter($palavras, function($p) use ($palavrasIgnorar) {
        return strlen($p) > 2 && !in_array($p, $palavrasIgnorar);
    });
    
    $lembretesConcatenados = '';
    $lembretesEncontrados = [];
    
    if (!empty($palavrasChave)) {
        // Construir query de busca
        $conditions = [];
        $params = [];
        
        foreach ($palavrasChave as $palavra) {
            $conditions[] = "(titulo LIKE ? OR conteudo LIKE ?)";
            $params[] = '%' . $palavra . '%';
            $params[] = '%' . $palavra . '%';
        }
        
        $sql = "SELECT DISTINCT id, titulo, conteudo FROM lembretes WHERE " . implode(' OR ', $conditions) . " LIMIT 5";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $lembretesEncontrados = $stmt->fetchAll();
        
        // Concatenar lembretes para o contexto
        foreach ($lembretesEncontrados as $lembrete) {
            $lembretesConcatenados .= "### " . $lembrete['titulo'] . "\n";
            $lembretesConcatenados .= $lembrete['conteudo'] . "\n\n";
        }
    }
    
    // Se não encontrou lembretes, buscar todos para dar contexto geral
    if (empty($lembretesEncontrados)) {
        $stmt = $db->query("SELECT titulo, conteudo FROM lembretes ORDER BY criado_em DESC LIMIT 10");
        $todosLembretes = $stmt->fetchAll();
        
        foreach ($todosLembretes as $lembrete) {
            $lembretesConcatenados .= "### " . $lembrete['titulo'] . "\n";
            $lembretesConcatenados .= $lembrete['conteudo'] . "\n\n";
        }
    }
    
    // Montar prompt do sistema
    $systemPrompt = "Você é um professor particular dedicado, paciente e encorajador. Seu aluno fez anotações sobre diversos assuntos que está aprendendo e agora está consultando você para relembrar ou entender melhor.

SUAS ANOTAÇÕES DE ESTUDO:
" . ($lembretesConcatenados ?: "Nenhuma anotação encontrada ainda.") . "

INSTRUÇÕES:
1. Responda de forma clara, didática e amigável
2. Use exemplos práticos quando possível
3. Se for um processo, divida em passos numerados
4. Encoraje o aluno e seja positivo
5. Se a pergunta estiver relacionada às anotações, use-as como base
6. Se a pergunta NÃO estiver nas anotações, responda com seu conhecimento geral, mas mencione que essa informação não está nas anotações do aluno
7. Use emoji ocasionalmente para tornar a conversa mais amigável
8. Formate a resposta em Markdown para melhor legibilidade";

    // Chamar API do DeepSeek
    $payload = [
        'model' => DEEPSEEK_MODEL,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $pergunta]
        ],
        'temperature' => 0.7,
        'max_tokens' => 2000
    ];
    
    $ch = curl_init(DEEPSEEK_API_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . DEEPSEEK_API_KEY
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception('Erro de conexão com a IA: ' . $curlError);
    }
    
    $responseData = json_decode($response, true);
    
    if ($httpCode !== 200) {
        $errorMsg = $responseData['error']['message'] ?? 'Erro desconhecido da API';
        throw new Exception('Erro da API DeepSeek: ' . $errorMsg);
    }
    
    $resposta = $responseData['choices'][0]['message']['content'] ?? 'Não consegui gerar uma resposta.';
    
    echo json_encode([
        'success' => true,
        'resposta' => $resposta,
        'lembretes_usados' => count($lembretesEncontrados),
        'lembretes_titulos' => array_column($lembretesEncontrados, 'titulo')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
