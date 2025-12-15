-- =============================================
-- Script de criação do banco de dados
-- Sistema de Lembretes com IA
-- =============================================

-- Usar o banco de dados
USE karids63_lembretes;

-- Criar tabela de lembretes
CREATE TABLE IF NOT EXISTS lembretes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_titulo (titulo),
    FULLTEXT INDEX idx_busca (titulo, conteudo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir alguns lembretes de exemplo (opcional)
INSERT INTO lembretes (titulo, conteudo) VALUES
('Criar App Android com Cordova', 'Para criar um app Android com Cordova, siga estes passos:

1. Instalar Node.js
2. Instalar Cordova globalmente: npm install -g cordova
3. Criar projeto: cordova create NomeProjeto
4. Entrar na pasta: cd NomeProjeto
5. Adicionar plataforma Android: cordova platform add android
6. Compilar: cordova build android
7. O APK fica em: platforms/android/app/build/outputs/apk/

Requisitos:
- Android Studio instalado
- JDK 11 ou superior
- Variáveis de ambiente ANDROID_HOME e JAVA_HOME configuradas'),

('Comando Git Básicos', 'Comandos Git que mais uso:

- git init: Iniciar repositório
- git add .: Adicionar todos os arquivos
- git commit -m "mensagem": Fazer commit
- git push origin main: Enviar para remoto
- git pull: Baixar atualizações
- git clone URL: Clonar repositório
- git branch nome: Criar branch
- git checkout nome: Mudar de branch
- git merge nome: Mesclar branches');
