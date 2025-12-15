# Instruções de Deploy - Sistema de Lembretes

## 1. Upload dos Arquivos PHP

Faça upload de todos os arquivos da pasta `server/api/` para o servidor:

**Local:** `c:\Aplicativos\Android\Lembrete\server\api\`  
**Destino:** `https://karidsonbessa.com/lembretes/api/`

### Arquivos a serem enviados:
- `config.php` - Configurações e credenciais
- `database.php` - Classe de conexão com o banco
- `lembretes.php` - API CRUD de lembretes
- `chat.php` - Endpoint de chat com IA
- `setup.sql` - Script de criação das tabelas

### Via FTP:
1. Conecte-se ao seu servidor via FTP (FileZilla, WinSCP, etc.)
2. Navegue até a pasta `public_html/lembretes/`
3. Crie uma pasta `api/` se não existir
4. Faça upload dos 5 arquivos

### Via Painel de Hospedagem:
1. Acesse o gerenciador de arquivos do seu painel (cPanel, Plesk, etc.)
2. Navegue até `public_html/lembretes/`
3. Crie a pasta `api/`
4. Faça upload dos arquivos

---

## 2. Executar o Script SQL

Acesse o phpMyAdmin do seu servidor e execute o conteúdo do arquivo `setup.sql`:

1. Acesse seu phpMyAdmin
2. Selecione o banco `karids63_lembretes`
3. Vá na aba "SQL"
4. Cole o conteúdo do arquivo `setup.sql`
5. Clique em "Executar"

---

## 3. Testar a API

Após o upload, teste os endpoints:

### Verificar conexão:
```
https://karidsonbessa.com/lembretes/api/lembretes.php
```
Deve retornar: `{"success":true,"data":[...]}`

### Se der erro de conexão:
- Verifique as credenciais no `config.php`
- Confirme que o banco de dados existe
- Verifique se a tabela foi criada

---

## 4. Testar Localmente

Execute o app localmente para testar:

```bash
cd c:\Aplicativos\Android\Lembrete\www
npx http-server . -p 8080 -c-1
```

Acesse: `http://localhost:8080`

---

## 5. Compilar APK (Opcional)

Para gerar o APK Android:

```bash
cd c:\Aplicativos\Android\Lembrete
cordova build android
```

O APK estará em: `platforms/android/app/build/outputs/apk/debug/`

---

## Estrutura Final de Arquivos

```
karidsonbessa.com/
└── lembretes/
    └── api/
        ├── config.php
        ├── database.php
        ├── lembretes.php
        ├── chat.php
        └── setup.sql
```

---

## Solução de Problemas

### Erro CORS:
Os headers já estão configurados no `config.php`. Se ainda tiver problemas, adicione um arquivo `.htaccess` na pasta `api/`:

```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type"
```

### Erro de conexão MySQL:
- Verifique se o host é `localhost` ou precisa ser outro endereço
- Confirme usuário e senha do banco

### Erro da API DeepSeek:
- Verifique se a chave da API está correta
- A API pode ter limite de requisições
