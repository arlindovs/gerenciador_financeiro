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

## � Deploy para Produção

### Build do Frontend
```bash
cd web
bun run build
```
Os arquivos estáticos serão gerados em `web/dist/`.

### Opções de Hospedagem

#### Frontend (Estático)
| Plataforma | Comando/Configuração |
|------------|---------------------|
| **Vercel** | `vercel --prod` |
| **Netlify** | Conectar repo, build: `bun run build`, dir: `dist` |
| **Cloudflare Pages** | Build: `bun run build`, output: `dist` |

#### Backend (ElysiaJS + Bun)
| Plataforma | Configuração |
|------------|--------------|
| **Railway** | Runtime: Bun, Start: `bun start` |
| **Render** | Runtime: Docker, Dockerfile com Bun |
| **Fly.io** | `fly launch` com Dockerfile |
| **VPS (Docker)** | Ver Dockerfile abaixo |

### Dockerfile para Backend
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY server/package.json server/bun.lock* ./
RUN bun install --frozen-lockfile
COPY server/ .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Variáveis de Ambiente (Produção)

> [!CAUTION]
> Nunca commite arquivos `.env` no repositório. Use secrets da plataforma de deploy.

**Backend:**
```env
PORT=3000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_producao
GEMINI_API_KEY=sua_chave_gemini
```

**Frontend:**
```env
VITE_API_URL=https://sua-api.dominio.com
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_producao
```

---

## �🔒 Segurança

A segurança é um pilar central desta aplicação:
- **Consultas Parametrizadas:** Prevenção de SQL Injection via Supabase/PostgREST.
- **Configuração de CORS:** Restrito a origens confiáveis.
- **Tratamento de Erros:** Erros semânticos que nunca expõem stack traces internos.
- **Hardening de AppSec:** Headers de segurança e variáveis de ambiente restritas.

---

## � API Endpoints

A API REST está documentada automaticamente via **Swagger** em `/swagger`.

### Transactions (`/transactions`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/transactions` | Lista todas as transações do usuário |
| `POST` | `/transactions` | Cria uma nova transação (suporta parcelamento) |
| `PUT` | `/transactions/:id` | Atualiza uma transação existente |
| `DELETE` | `/transactions/:id` | Remove uma transação |

### AI (`/ai`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/ai/categorize` | Sugere categoria e tag via Gemini AI |

> [!TIP]
> Acesse `http://localhost:3000/swagger` para explorar a documentação interativa da API.

---

## 🖼️ Screenshots

<details>
<summary>📊 Dashboard Financeiro</summary>

O dashboard exibe:
- **KPIs:** Receita, despesas e saldo total
- **Gráficos:** Distribuição por categoria e evolução mensal
- **Filtros:** Seleção de período por mês/ano

</details>

<details>
<summary>💳 Gestão de Transações</summary>

A página de transações permite:
- Adicionar receitas e despesas
- Categorização automática por IA
- Suporte a parcelamento
- Filtros avançados por data

</details>

<details>
<summary>🎨 Temas</summary>

A aplicação suporta múltiplos temas:
- **Light:** Tema claro para uso diurno
- **Dark:** Tema escuro para conforto visual
- **Pink:** Tema vibrante e moderno

</details>

---

## 🗺️ Roadmap

- [x] Dashboard com KPIs e gráficos
- [x] CRUD completo de transações
- [x] Categorização automática com IA (Gemini)
- [x] Filtros por período
- [x] Múltiplos temas (Light, Dark, Pink)
- [x] Design responsivo (Mobile-first)
- [ ] Autenticação completa com Supabase Auth
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Metas e orçamentos mensais
- [ ] Notificações de gastos excessivos
- [ ] PWA (Progressive Web App)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos abaixo:

1. **Fork** o repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça **commit** das suas alterações:
   ```bash
   git commit -m "feat: adiciona minha feature"
   ```
4. Faça **push** para a branch:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request**

### Padrões de Commit

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alterações na documentação |
| `style` | Formatação, sem alteração de código |
| `refactor` | Refatoração de código |
| `test` | Adição ou correção de testes |
| `chore` | Manutenção geral |

---

## �📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ por [Arlin](https://github.com/arlin).
*Engenheiro de Software Sênior & Especialista em AppSec*
