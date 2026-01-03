# 💰 Gerenciador Financeiro (Finance Manager)

Um sistema de gestão financeira moderno, de alto desempenho e impulsionado por IA, construído com **Bun**, **ElysiaJS** e **React 19**.

---

## 🚀 Visão Geral

Este projeto é uma solução abrangente de gestão financeira projetada para velocidade e segurança. Ele utiliza o **Google Gemini AI** para categorizar transações automaticamente e fornece um dashboard elegante para insights em tempo real.

> [!IMPORTANT]
> Este projeto segue padrões rigorosos de **AppSec** e princípios **SOLID**.

---

## ✨ Funcionalidades Principais

- **Categorização por IA:** Rotulagem inteligente de transações usando Gemini 1.5 Flash.
- **Dashboard Dinâmico:** Visibilidade em tempo real dos padrões de gastos com Recharts.
- **Gestão de Transações:** Operações de CRUD completas com filtragem avançada por data.
- **Stack Tecnológica Avançada:** Impulsionado pelo Bun para execução de backend ultrarrápida.
- **Responsivo:** Totalmente otimizado para todos os tamanhos de dispositivos usando Tailwind CSS v4.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** & **Vite**
- **Tailwind CSS v4** (Estilização moderna baseada em utilitários)
- **Lucide React** (Iconografia elegante)
- **Recharts** (Visualização de dados interativa)
- **React Hook Form** + **Zod** (Validação robusta)

### Backend
- **Bun** (Runtime & Gerenciador de Pacotes)
- **ElysiaJS** (Framework web rápido e amigável)
- **Supabase** (PostgreSQL & Realtime)
- **Google Gemini AI** (Integração com IA Generativa)
- **Swagger/OpenAPI** (Documentação automatizada)

---

## 🏗️ Estrutura do Projeto

```text
gerenciador_financeiro/
├── database/         # Schemas do banco de dados (SQL)
├── server/           # Backend API (ElysiaJS + Bun)
│   ├── src/
│   │   ├── routes/   # Endpoints da API
│   │   └── index.ts  # Ponto de entrada
├── web/              # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── components/
│   │   └── pages/
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- [Bun](https://bun.sh/) instalado.
- Projeto no Supabase (Database URL & Anon Key).
- Chave de API do Google Gemini.

### Configuração do Backend
1. Navegue para `/server`:
   ```bash
   cd server
   ```
2. Instale as dependências:
   ```bash
   bun install
   ```
3. Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   SUPABASE_URL=sua_url
   SUPABASE_KEY=sua_chave
   GEMINI_API_KEY=sua_chave_gemini
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   bun dev
   ```

### Configuração do Frontend
1. Navegue para `/web`:
   ```bash
   cd web
   ```
2. Instale as dependências:
   ```bash
   bun install
   ```
3. Crie um arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   bun dev
   ```

---

## 🔒 Segurança

A segurança é um pilar central desta aplicação:
- **Consultas Parametrizadas:** Prevenção de SQL Injection via Supabase/PostgREST.
- **Configuração de CORS:** Restrito a origens confiáveis.
- **Tratamento de Erros:** Erros semânticos que nunca expõem stack traces internos.
- **Hardening de AppSec:** Headers de segurança e variáveis de ambiente restritas.

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ por [Arlin](https://github.com/arlin).
*Engenheiro de Software Sênior & Especialista em AppSec*
