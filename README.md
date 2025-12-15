# 🧠 Meus Lembretes

<p align="center">
  <img src="https://img.shields.io/badge/Cordova-14.0.1-35434F?style=for-the-badge&logo=apache-cordova" alt="Cordova">
  <img src="https://img.shields.io/badge/Android-Ready-3DDC84?style=for-the-badge&logo=android" alt="Android">
  <img src="https://img.shields.io/badge/PHP-Backend-777BB4?style=for-the-badge&logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/DeepSeek-AI-00D9FF?style=for-the-badge" alt="DeepSeek AI">
</p>

Um aplicativo de lembretes inteligente com **assistente IA integrado** para ajudar nos seus estudos! 📚✨

## ✨ Funcionalidades

### 🤖 Chat com IA
- Assistente de estudos alimentado pela API DeepSeek
- Respostas contextuais baseadas nos seus lembretes
- Interface de chat moderna e intuitiva

### 📝 Gerenciamento de Lembretes
- **Criar** novos lembretes com título e conteúdo
- **Editar** lembretes existentes
- **Excluir** lembretes
- **Buscar** rapidamente em todos os lembretes
- **Sincronização** automática com o servidor

### 📱 Interface Moderna
- Design responsivo (funciona em mobile e desktop)
- Navegação por abas intuitiva
- Notificações toast elegantes
- Modal de visualização detalhada

## 🛠️ Tecnologias

| Frontend | Backend | Mobile |
|----------|---------|--------|
| HTML5 | PHP | Apache Cordova |
| CSS3 | MySQL | Android SDK |
| JavaScript | DeepSeek API | - |

## 📁 Estrutura do Projeto

```
Lembrete/
├── www/                    # Frontend do aplicativo
│   ├── index.html          # Página principal
│   ├── css/
│   │   └── index.css       # Estilos
│   └── js/
│       └── index.js        # Lógica do app
├── server/                 # Backend PHP
│   └── api/
│       ├── config.php      # Configurações
│       ├── database.php    # Conexão MySQL
│       ├── lembretes.php   # API CRUD
│       ├── chat.php        # Endpoint IA
│       └── setup.sql       # Script do banco
├── res/                    # Ícones do app
├── config.xml              # Config Cordova
└── package.json            # Dependências
```

## 🚀 Como Usar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v16+)
- [Android Studio](https://developer.android.com/studio) (para compilar APK)
- Servidor com PHP 7.4+ e MySQL

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/Lembrete.git
   cd Lembrete
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o backend**
   - Faça upload da pasta `server/api/` para seu servidor
   - Execute o `setup.sql` no phpMyAdmin
   - Configure as credenciais em `config.php`

4. **Teste localmente**
   ```bash
   cd www
   npx http-server . -p 8080 -c-1
   ```
   Acesse: `http://localhost:8080`

### Compilar APK Android

```bash
cordova build android
```

O APK será gerado em: `platforms/android/app/build/outputs/apk/debug/`

## 🔧 Configuração da API

Edite o arquivo `server/api/config.php`:

```php
// Banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'seu_banco');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');

// API DeepSeek
define('DEEPSEEK_API_KEY', 'sua_chave_api');
```

## 📖 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/lembretes.php` | Lista todos os lembretes |
| POST | `/api/lembretes.php` | Cria novo lembrete |
| PUT | `/api/lembretes.php` | Atualiza lembrete |
| DELETE | `/api/lembretes.php?id=X` | Remove lembrete |
| POST | `/api/chat.php` | Envia mensagem para IA |

## 📸 Screenshots

| Chat IA | Lembretes | Novo Lembrete |
|---------|-----------|---------------|
| 🤖 Converse com a IA | 📋 Veja seus lembretes | ➕ Adicione novos |

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença Apache 2.0. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Karidson Bessa**

- 🌐 Website: [karidsonbessa.com](https://karidsonbessa.com)

---

<p align="center">
  Feito com ❤️ para ajudar nos estudos!
</p>
