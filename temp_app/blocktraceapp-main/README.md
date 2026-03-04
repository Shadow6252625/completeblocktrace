# 🌐 BlockTrace: AI-Powered Solana Analytics

BlockTrace is a premium, real-time Solana blockchain visualization and forensics tool. Built with a futuristic glassmorphic aesthetic, it provides deep visibility into the Solana network through an AI-enhanced lens.

![BlockTrace Dashboard](public/logo.png)

## ✨ Features

-   **Autonomous Agent Tracing**: Configure and launch specialized AI agents to scan specific block ranges and program interactions.
-   **Real-Time Data Streaming**: Dynamic visualization of transactions, account movements, and program calls.
-   **Security & Anomalies**: Built-in anomaly detection for high-compute spikes, failed confirmation floods, and suspicious volume.
-   **Multi-Wallet Support**: Secure connection protocol for **Phantom** and **Solflare** wallets.
-   **Futuristic UI**: High-performance animations, video backgrounds, and neon-responsive interface.
-   **Real & Mock Modes**: Seamless switching between authenticated mainnet data and high-fidelity simulated network streams.

## 🚀 Tech Stack

-   **Core**: React 19, TypeScript, Vite
-   **Animation**: Framer Motion
-   **Icons**: Lucide React
-   **Auth**: Solana Wallet Connection Protocol (Phantom, Solflare)
-   **Routing**: React Router 7

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18+)
-   npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/blocktrace-app.git
   cd blocktrace-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🧩 Project Structure

- `/src/lib/antigravity.ts`: Core simulation engine and pub/sub system.
- `/src/components`: Reusable glassmorphic UI components (Logo, ConnectWallet, etc.).
- `/src/pages`: Main application views (Gateway, Configuration, Dashboard).
- `/public`: Static assets including official branding and background video.

## 🛡️ Security

BlockTrace stores session sensitive data (API Keys, Node Endpoints) locally for security. Wallet connections are handled via the standard Solana injection protocol, ensuring private keys never leave your provider.

---

Built with ⚡ by the Antigravity Team.
