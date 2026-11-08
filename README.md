# 🎮 Jogo da Velha Pixel Retrô (Multiplayer PT-BR)

Um jogo clássico de **Jogo da Velha (Tic-Tac-Toe)** multiplayer completo, simples, resumido e com um estilo **pixel art retrô**, infantil, colorido e amigável.

Construído com **React 18 + Vite + Tailwind CSS** no frontend e **Node.js (Express + Socket.io)** no backend.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18+ (recomendado v20 ou v22)
- **npm** ou **pnpm**

### Instalação Rápida
Abra o terminal na pasta do projeto (`D:\Work\Repos\TikTakToe`) e execute:

```bash
npm install
```

### Modo de Produção (Recomendado)
Compila o frontend e sobe o servidor unificado na porta 3000:
```bash
npm run build
npm start
```
Acesse no seu navegador: **[http://localhost:3000](http://localhost:3000)**

### Modo de Desenvolvimento
Executa o backend e o Vite com hot-reload simultaneamente:
```bash
npm run dev
```
- Frontend (Vite): **[http://localhost:5173](http://localhost:5173)** (com proxy automático para o backend)
- Backend (Express + Socket.io): **[http://localhost:3000](http://localhost:3000)**

### Executar os Testes Automatizados
```bash
npm test
```
Executa a suíte de testes com **Vitest** cobrindo:
1. `tests/gameLogic.test.js`: Validação de regras do jogo, detecção de vitória nas 3 linhas, 3 colunas e 2 diagonais, empates, bloqueio de jogadas fora de turno e alternância de rodadas.
2. `tests/roomManager.test.js`: Gerenciamento de salas públicas, privadas e com senha, controle de espectadores, revanches e exclusão de salas vazias.
3. `tests/serverIntegration.test.js`: Teste de integração ponta a ponta com múltiplos clientes Socket.IO reais simulando criação de sala, sincronização de jogadas em tempo real e vitória.

---

## 🎨 Funcionalidades e Diferenciais

### 1. Interface e Estilo Visual Pixel Art
- **Estilo Retrô Marcante**: Paleta vibrante e fofa, fontes clássicas 8-bit (`Press Start 2P` e `Silkscreen`), botões com relevo 3D tátil e bordas pixeladas.
- **Avatares Reativos**: 6 personagens pixelados fofos feitos em SVG puro (**Gatinho, Sapinho, Ursinho, Robô, Coelhinho e Patinho**) com expressões dinâmicas que mudam em tempo real:
  - *Feliz / Idle*: Relaxado aguardando.
  - *Pensativo*: Quando é a vez do jogador fazer o movimento.
  - *Surpreso*: Quando o oponente joga ou ao sofrer derrota.
  - *Comemorando*: Quando vence a partida.
- **Chuva de Confetes Pixelados**: Partículas quadradas 8-bit geradas no `<canvas>` animadas na vitória.
- **Efeitos Sonoros 8-Bit Sintetizados**: Criados 100% via **Web Audio API** nativa (sem arquivos de áudio externos):
  - Som de clique tátil
  - Boop de jogada (diferenciado para X e O)
  - Fanfarra arpejada de vitória
  - Som cômico de empate
  - Chime de alerta ao entrar jogador
  - Som de bolha para reações
  - Botão de controle de volume e silenciar (Mute) persistido no `localStorage`.
- **Idioma 100% PT-BR**: Textos amigáveis, claros e infantis.

### 2. Identificação Ultra-Simples
- Entrada apenas com **Apelido (Nickname)** e escolha do avatar pixelado favorito.
- Gerador de nomes divertidos com 1 clique (ex: "Gato Cósmico", "Pato Ninja", "Pipoca Veloz").
- Dados salvos automaticamente no `localStorage`, podendo ser alterados a qualquer momento pelo cabeçalho.

### 3. Modos de Sala e Compartilhamento Fácil
- **Lobby Público em Tempo Real**: Lista todas as salas abertas com contagem de jogadores (1/2, 2/2), espectadores e status (*Aguardando adversário* ou *Partida rolando*).
- **Tipos de Salas**:
  - **Pública**: Listada abertamente no Lobby.
  - **Privada**: Oculta do lobby; acesso exclusivo por link direto.
  - **Com Senha**: Protegida por senha/PIN definida pelo anfitrião.
- **Acesso Direto por Link**:
  - URLs como `/?sala=ID` ou `/sala/ID` permitem entrar direto na sala.
  - Se a pessoa não tiver apelido cadastrado, um modal fofo solicita o apelido e já a coloca imediatamente dentro da sala.
  - Botão **"Copiar Link da Sala"** com feedback instantâneo.
- **Modo Espectador**: Se a sala já tiver 2 jogadores ativos, visitantes entram automaticamente como espectadores para torcer e mandar reações!

### 4. Mecânica de Jogo Multiplayer
- **Sincronização em Tempo Real**: Websockets ultra-rápidos com Socket.IO.
- **Destaque de Vitória**: As 3 casas vitoriosas pulsam com contorno dourado.
- **Placar Persistente da Sala**: Contabiliza vitórias do Jogador X, vitórias do Jogador O, empates e partidas totais.
- **Sistema de Revanche**: Botão "Jogar Novamente / Revanche" com reinício sincronizado e alternância do primeiro a jogar.
- **Reações e Chat Rápido**: Emojis (❤️, 😂, 🔥, 😮, 🏆, 👏, 😴, ✨) e frases rápidas que sobem como balõezinhos sobre o avatar do jogador!

---

## 📂 Estrutura do Código

```
TikTakToe/
├── server/
│   ├── server.js             # Servidor Express + Socket.IO + API REST
│   ├── gameLogic.js          # Regras puras do jogo e detecção de vitórias
│   └── roomManager.js        # Gestão de salas públicas, privadas e com senha
├── src/
│   ├── main.jsx              # Ponto de entrada React
│   ├── App.jsx               # Gerenciador de estado principal e roteamento de salas
│   ├── index.css             # Estilos Tailwind e utilitários pixel art
│   ├── audio/
│   │   └── soundEffects.js   # Sintetizador 8-bit com Web Audio API nativa
│   └── components/
│       ├── Header.jsx        # Cabeçalho com logo retrô, perfil e som
│       ├── Lobby.jsx         # Lista de salas públicas e entrada por código
│       ├── GameRoom.jsx      # Sala de jogo completa com tabuleiro e placar
│       ├── Board.jsx         # Grade 3x3 responsiva e peças pixeladas
│       ├── PlayerCard.jsx    # Card do jogador com avatar reativo
│       ├── PixelAvatars.jsx  # Avatares e peças (X e O) desenhados em pixel art
│       ├── PixelConfetti.jsx # Confetes animados em canvas
│       ├── ReactionBar.jsx   # Barra de emojis e frases rápidas
│       ├── CreateRoomModal.jsx # Modal para criar salas públicas/privadas/senha
│       ├── NicknameModal.jsx # Modal de apelido e escolha de avatar
│       └── PasswordPromptModal.jsx # Modal para digitar senha de salas protegidas
├── tests/
│   ├── gameLogic.test.js     # Testes unitários das regras do jogo
│   ├── roomManager.test.js   # Testes unitários do gerenciamento de salas
│   └── serverIntegration.test.js # Testes de integração em tempo real com Socket.IO
├── index.html                # HTML base com fontes 8-bit do Google Fonts
├── package.json              # Scripts e dependências
├── tailwind.config.js        # Configuração de temas e cores pixel art
└── vite.config.js            # Configuração de build e proxy do Vite
```
