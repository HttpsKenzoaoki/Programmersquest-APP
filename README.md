# 🔮 Programmer's Quest — Mobile App

> **Projeto Integrador / TCC (BentoTech)**  
> **Atividade Prática: The Code Challenge — Hardware & Recursos Nativos**

O **Programmer's Quest** é um aplicativo mobile gamificado com temática de fantasia e magia, projetado para ensinar conceitos de programação de forma interativa. Além da sua mecânica de trilhas, lições e execução de código, o projeto integra múltiplos **recursos nativos de hardware** do dispositivo, atendendo rigorosamente aos requisitos do Code Challenge e aos pilares de Engenharia de Software Mobile.

---

## 📱 Recursos Nativos e Atendimento ao Code Challenge

O aplicativo atende a todos os níveis de desafio e requisitos propostos na atividade:

### 1. Nível Júnior — Tratamento Avançado de Permissões (Câmera)
* **Localização:** `src/screens/ProfileScreen.jsx` e `src/screens/AuditScreen.jsx`
* **Implementação:** No recurso de captura de imagem via câmera (`ImagePicker.launchCameraAsync`), o retorno de `requestCameraPermissionsAsync()` é estritamente validado. Caso o usuário selecione *"Não perguntar novamente"* (`canAskAgain: false`), o aplicativo exibe instruções claras e disponibiliza um botão que redireciona diretamente para a abertura manual das configurações do sistema operacional através da API `Linking.openSettings()`.

### 2. Nível Pleno — Telemetria com Acelerômetro e Trava de Segurança
* **Localização:** `src/screens/AuditScreen.jsx` e `src/screens/LessonScreen.jsx`
* **Implementação:** Monitoramento em tempo real do sensor `Accelerometer` (`expo-sensors`), calculando a aceleração vetorial agregada:
  $$\text{magnitude} = \sqrt{x^2 + y^2 + z^2}$$
  Durante a conclusão/envio de uma auditoria ou lição, se a aceleração ultrapassar **2.0g** (indicando movimentação brusca ou queda), o envio é imediatamente bloqueado com o alerta:
  > **"Instabilidade Física Detectada"**

### 3. Nível Sênior — Agenda Corporativa com Otimização de Alta Performance
* **Localização:** `src/screens/ContactScreen.jsx`
* **Implementação:**
  * **Filtro Direto na Consulta Nativa:** Campo de busca (`TextInput`) com *debounce* que envia o parâmetro `name` diretamente para a consulta nativa da API de contatos (`Contacts.getContactsAsync`).
  * **Paginação sob Demanda (Scroll Infinito):** Carregamento paginado incremental utilizando `pageSize` (20 registros) e `pageOffset` disparado pelo evento `onEndReached`.
  * **FlatList Pura com Reuso de Memória:** Otimizada com `getItemLayout`, `initialNumToRender={15}`, `maxToRenderPerBatch={10}`, `windowSize={5}`, `removeClippedSubviews={true}` e componente de item memoizado (`React.memo`) para suporte a mais de 5.000 registros sem vazamento de RAM e mantendo 60 FPS.

---

## 🛠️ Requisitos Técnicos Adicionais

### Requisitos Funcionais (RF)
* **RF01 — Histórico Local e Persistência Offline:** Implementado em `src/services/storage.js` com `@react-native-async-storage/async-storage`. Os registros de auditoria e visitas técnicas são gravados localmente, permitindo consultas completas mesmo sem qualquer conexão com a internet.
* **RF02 — Feedback Visual de Precisão de GPS:** Implementado em `src/components/GpsAccuracyBadge.jsx` e `src/screens/AuditScreen.jsx`. Exibe um indicador visual dinâmico com base no `accuracy` (em metros) capturado pelo `expo-location`:
  * 🟢 **Verde:** Alta precisão ($< 10\text{ m}$)
  * 🟡 **Amarelo:** Média precisão ($10\text{ m}$ a $30\text{ m}$)
  * 🔴 **Vermelho:** Baixa precisão ($> 30\text{ m}$)

### Requisitos Não Funcionais (RNF)
* **RNF01 — Degradação Graciosa e Tratamento de Erros:**
  * O aplicativo verifica o estado dos provedores de localização (`Location.getProviderStatusAsync()`) e a disponibilidade dos sensores (`Accelerometer.isAvailableAsync()`).
  * Tratamento defensivo com `try/catch` para evitar falhas ou encerramentos inesperados (*crashes*), exibindo alertas e mensagens amigáveis ao usuário caso algum hardware esteja indisponível.
* **RNF02 — UI/UX Responsiva:**
  * Configurado com `"orientation": "default"` no `app.json`, adaptando-se perfeitamente aos modos **Portrait** (Retrato) e **Landscape** (Paisagem) através de layouts flexíveis e `useWindowDimensions()`.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* Gerenciador de pacotes `npm`
* Aplicativo **Expo Go** instalado no smartphone físico ou um emulador Android/iOS configurado.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/HttpsKenzoaoki/Programmersquest-APP.git
   cd Programmersquest-APP
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento do Expo:**
   ```bash
   npx expo start
   ```

4. **Abra no seu dispositivo:**
   * **Dispositivo Físico:** Abra a câmera (iOS) ou o app Expo Go (Android) e escaneie o QR Code exibido no terminal.
   * **Emulador Android:** Pressione `a` no terminal após iniciar o Expo.
   * **Simulador iOS:** Pressione `i` no terminal.
   * **Navegador Web:** Pressione `w` no terminal.

---

## 📂 Estrutura do Projeto

```text
├── assets/                  # Ícones, splash screen e imagens do app
├── src/
│   ├── components/          # Componentes visuais reutilizáveis
│   │   ├── GpsAccuracyBadge.jsx  # Indicador colorido de precisão GPS (RF02)
│   │   ├── MagicButton.jsx       # Botão temático com estados de loading
│   │   ├── GradientBackground.jsx# Fundo estilizado com gradiente
│   │   └── ...
│   ├── data/                # Dados estáticos de trilhas, lições e ligas
│   ├── navigation/          # Configuração de rotas (Stack e Bottom Tabs)
│   ├── screens/             # Telas da aplicação
│   │   ├── AuditScreen.jsx  # Auditoria técnica (GPS, Acelerômetro, Câmera e Histórico)
│   │   ├── ContactScreen.jsx# Agenda corporativa paginada (Sênior) e Fale Conosco
│   │   ├── ProfileScreen.jsx# Perfil do usuário com captura de foto e validação de permissões
│   │   ├── HomeScreen.jsx   # Dashboard inicial com acesso rápido às auditorias
│   │   ├── LessonScreen.jsx # Lições de código com trava por instabilidade
│   │   └── ...
│   ├── services/            # Serviços de mock API e persistência (AsyncStorage)
│   │   └── storage.js       # Persistência de perfil, progresso e histórico offline
│   ├── store/               # Gerenciamento de estado global com Zustand
│   └── theme/               # Paleta de cores, tipografia, raios e espaçamentos
├── app.json                 # Configurações do Expo, plugins de permissão e orientação
├── package.json             # Dependências e scripts do projeto
└── README.md                # Documentação técnica do projeto
```

---

## 🧰 Tecnologias Utilizadas

* **Framework:** [React Native](https://reactnative.dev/) com [Expo (SDK 57)](https://expo.dev/)
* **Sensores e Recursos Nativos:**
  * `expo-sensors` (Acelerômetro)
  * `expo-location` (Geolocalização e Precisão GPS)
  * `expo-image-picker` (Câmera e Galeria de Imagens)
  * `expo-contacts` (Acesso à agenda nativa do dispositivo)
  * `expo-haptics` (Feedback háptico)
* **Persistência Local:** `@react-native-async-storage/async-storage`
* **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand)
* **Navegação:** [@react-navigation/native](https://reactnavigation.org/) (Stack + Bottom Tabs)
