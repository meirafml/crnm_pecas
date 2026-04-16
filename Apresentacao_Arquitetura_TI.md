# Arquitetura do CRM Preditivo — Peças & Consumíveis (Bouwman)

Prezados da equipe de TI,

Este documento formaliza a arquitetura e os requisitos de infraestrutura para o nosso novo sistema de CRM Preditivo focado em Peças e Parque de Máquinas. O objetivo principal deste desenho foi garantir **Acesso Moderno para os nossos vendedores (Móvel/Cloud)**, mantendo a **Segurança absoluta e o Isolamento do nosso ERP Protheus local**.

## 1. Topologia do Sistema

O CRM será hospedado na plataforma **Vercel** sob o domínio `bouwmaninterno.com.br`. Como um sistema Moderno B2B SaaS, a aplicação jamais tentará acessar a rede interna da empresa ou apontar diretamente para portas abertas na internet.

Para escalar o sistema e não onerar o banco de dados principal de produção (`PRD2410`), dividimos a arquitetura nos seguintes pilares:

### A. Frontend e Backend Serverless (Nuvem Vercel)
A interface dos vendedores e o processamento pesado de cálculos preditivos (como churn, prospecções e análise de máquina) roda 100% num cluster Serverless na nuvem com Vercel. Não há consumo de processamento da rede interna na hora em que o vendedor usa a tela do CRM.

### B. Banco de Dados Cloud (Supabase/PostgreSQL)
Para manter dados sempre disponíveis, utilizamos um Banco de Dados na nuvem ultra-rápido focado em leitura (PostgreSQL no Supabase ou Vercel KV/Postgres). **O Sistema CRM só lê desse banco da nuvem.**

### C. A Ponte de Sincronização (O Papel do TI)
Nenhum dado é gravado localmente pelos Vendedores de volta no ERP. Todo o ecossistema é baseado numa **Sincronização Unidirecional (ERP → Nuvem)**. O papel do servidor local (`SRV-103`) é apenas rodar um Script CronJob periodicamente.

### D. Autenticação e Segurança (Single Sign-On)
Vale ressaltar que a plataforma `bouwmaninterno.com.br` **já possui regras de acesso bloqueadas e exclusivas**. O sistema obriga o login via Single Sign-On (SSO) utilizando contas corporativas associadas ao e-mail `@bouwman.com.br` via Microsoft/Azure AD. Ou seja, pessoas de fora da organização ou sem e-mail ativo não conseguem passar pela tela inicial, garantindo sigilo absoluto dos dados enviados pelo ERP.

---

## 2. O Que Precisamos (Execução Técnica)

Sabemos que a versão atual do SQL Server rejeitou nativamente algumas conexões de leitura diretas (Erro de Logon 18456) possivelmente devido a bloqueios de rede, rotinas NTLM ou instâncias mascaradas do SQL.

Com base nisso, a solução mais elegante que adotamos é o modelo Async Push (que vocês inclusive já chegaram a validar com o script Python/PowerShell `sync_erp_bouwman`). 

### Como Funcionará na Prática:

1. **Gatilho Local:** Nós forneceremos um Script seguro (em Python ou Node.js).
2. **Setup do Servidor:** A TI agenda esse script no "Task Scheduler" do Windows Server local para rodar a cada 1 a 4 horas (conforme definirmos).
3. **Execução Segura:** O Script faz uma query no SQL Database `PRD2410` (Tabelas de Cliente, Máquinas e Orçamento), compacta os dados em JSON e dispara via porta padrão de Saída HTTPS (Porta 443) até o nosso Edge Hub de Recepção (via chave de API Autenticada).
4. **Alimento do Dashboard:** Nossa nuvem recebe os dados limpos num funil assíncrono e imediatamente espelha no Painel dos vendedores do `bouwmaninterno.com.br`.

### Resumo das Vantagens para o TI:
* **Zero portas de entrada abertas no Firewall (No Inbound traffic).**
* Conexão local no SQL rápida sem drivers ou middlewares externos complicados.
* Controle total de que os dados exportados são **somente-leitura** e as regras restritas são executadas a nível de Query Local.

Caso tenham dúvidas sobre a criptografia dos pacotes enviados à nossa Edge Function ou sobre os IPs de saída envolvidos, estamos à disposição para documentar. Agradecemos a parceria constante!
