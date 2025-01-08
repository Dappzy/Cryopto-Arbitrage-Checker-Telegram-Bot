# Crypto Arbitrage Telegram Bot 🤖💰

A Telegram bot that helps you find cryptocurrency arbitrage opportunities across different exchanges in real-time. The bot compares prices across multiple exchanges and shows you where to buy low and sell high.

![Bot Preview](previewbot.jpg)

## Created By 👨‍💻

Built by [@DappChef](https://t.me/DappChef) on Telegram. Feel free to reach out if you:
- Need help with the setup
- Want to discuss custom bot development
- Have feature suggestions
- Are interested in collaboration opportunities
- Need assistance with other development projects

## Features ✨

- Real-time price comparison across major exchanges
- Customizable minimum profit threshold
- Adjustable number of opportunities to display
- User-friendly interface with inline buttons
- Detailed profit calculations per trade
- Support for multiple cryptocurrencies

## Prerequisites 📋

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Telegram account
- RapidAPI account

## Setup Instructions 🚀

### 1. Clone the Repository

```bash
git clone https://github.com/Dappzy/Cryopto-Arbitrage-Checker-Telegram-Bot.git
cd crypto-arbitrage-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Your API Keys

#### Telegram Bot Token:
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command and follow the instructions
3. Copy the bot token provided

#### RapidAPI Key:
1. Visit [Crypto Arbitrage API](https://rapidapi.com/arjunravi868/api/crypto-arbitrage5) on RapidAPI
2. Sign up or log in to RapidAPI
3. Subscribe to the API
4. Copy your RapidAPI key from the dashboard

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API keys:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   RAPIDAPI_KEY=your_rapidapi_key_here
   RAPIDAPI_HOST=crypto-arbitrage5.p.rapidapi.com
   ```

### 5. Start the Bot

```bash
npm start
```

## Usage 📱

1. Start a chat with your bot on Telegram
2. Send `/start` to begin
3. Use the inline buttons to:
   - Check current arbitrage opportunities
   - Adjust settings (minimum profit %, number of results)
   - View help information

## Example Output 📊

```
🔍 Current Arbitrage Opportunities

1. BTC (0.45% profit)
💰 Buy: $47250.25 at Coinbase
💱 Sell: $47463.80 at Bybit
📈 Profit per unit: $213.55

[... more opportunities ...]
```

## Contributing 🤝

Contributions are welcome! Feel free to:
- Fork the repository
- Create a feature branch
- Submit a pull request

## Support & Contact 💬

Need help or interested in custom development work? 
Reach out to me on Telegram [@DappChef](https://t.me/DappChef)

## Star the Project ⭐

If you find this project useful, please give it a star! It helps others discover the bot and supports the development.
