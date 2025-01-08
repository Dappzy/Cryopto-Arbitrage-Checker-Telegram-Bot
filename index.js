require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Initialize bot with your token
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Bot initialized with token:', process.env.TELEGRAM_BOT_TOKEN);
console.log('RapidAPI Key:', process.env.RAPIDAPI_KEY);
console.log('RapidAPI Host:', process.env.RAPIDAPI_HOST);

// Add error handler for bot polling errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Add debug logging for bot messages
bot.on('message', (msg) => {
    console.log('Received message:', msg);
});

// Main menu keyboard
const mainMenuKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '🔍 Check Arbitrage', callback_data: 'check_arb' }],
            [{ text: '⚙️ Settings', callback_data: 'settings' }],
            [{ text: 'ℹ️ Help', callback_data: 'help' }]
        ]
    }
};

// Settings keyboard
const settingsKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [{ text: 'Set Min Profit %', callback_data: 'set_min_profit' }],
            [{ text: 'Number of Results', callback_data: 'set_num_results' }],
            [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
        ]
    }
};

// Global settings (default values)
const settings = {
    minProfit: 0.1,  // Lower minimum profit to see more opportunities
    numResults: 10    // Show more results by default
};

async function getArbitrageData() {
    console.log('Fetching arbitrage data...');
    const options = {
        method: 'GET',
        url: 'https://crypto-arbitrage5.p.rapidapi.com/arb',
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        }
    };

    console.log('API Request options:', {
        url: options.url,
        headers: {
            'X-RapidAPI-Host': options.headers['X-RapidAPI-Host']
        }
    });

    try {
        console.log('Making API request...');
        const response = await axios.request(options);
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers
        });
        
        if (response.data && typeof response.data === 'object') {
            return response.data;
        } else {
            console.error('Invalid API response format:', response.data);
            return null;
        }
    } catch (error) {
        console.error('API Error:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers
            } : 'No response'
        });
        return null;
    }
}

function calculateArbitrage(data) {
    const opportunities = [];
    
    // Process each cryptocurrency
    for (const [symbol, exchanges] of Object.entries(data)) {
        console.log(`Processing ${symbol}...`);
        const prices = [];
        
        // Collect valid prices from each exchange
        for (const [exchange, data] of Object.entries(exchanges)) {
            let price = null;
            
            // Extract price based on exchange data structure
            if (data === null) continue;
            
            if (typeof data === 'string') {
                price = parseFloat(data);
            } else if (data.price) {
                price = parseFloat(data.price);
            } else if (data.markPrice) {
                price = parseFloat(data.markPrice);
            }
            
            if (price && !isNaN(price) && price > 0) {  
                prices.push({
                    exchange,
                    price
                });
                console.log(`  ${exchange}: $${price}`);
            }
        }
        
        // Find min and max prices
        if (prices.length >= 2) {
            prices.sort((a, b) => a.price - b.price);
            const lowest = prices[0];
            const highest = prices[prices.length - 1];
            
            const profitPercent = ((highest.price - lowest.price) / lowest.price) * 100;
            console.log(`  Profit opportunity for ${symbol}: ${profitPercent.toFixed(2)}%`);
            console.log(`  Buy at ${lowest.exchange}: $${lowest.price}`);
            console.log(`  Sell at ${highest.exchange}: $${highest.price}`);
            
            // Only add if profit is reasonable (avoid tiny price differences)
            if (profitPercent >= settings.minProfit && profitPercent < 100) {  
                opportunities.push({
                    symbol,
                    buyExchange: lowest.exchange,
                    buyPrice: lowest.price,
                    sellExchange: highest.exchange,
                    sellPrice: highest.price,
                    profitPercent
                });
            }
        } else {
            console.log(`  Not enough valid prices for ${symbol}`);
        }
    }
    
    console.log(`Total opportunities found: ${opportunities.length}`);
    return opportunities;
}

function formatArbitrageMessage(data) {
    console.log('Formatting arbitrage data...');
    
    const opportunities = calculateArbitrage(data);
    console.log(`Found ${opportunities.length} opportunities above ${settings.minProfit}% profit`);
    
    if (opportunities.length === 0) {
        return 'No arbitrage opportunities found matching your criteria.\nTry adjusting your minimum profit settings.';
    }

    // Sort by profit percentage
    opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
    
    // Take top N results
    const topOpportunities = opportunities.slice(0, settings.numResults);
    console.log('Top opportunities:', JSON.stringify(topOpportunities, null, 2));
    
    let message = '🔍 *Current Arbitrage Opportunities*\n\n';
    
    topOpportunities.forEach((opp, index) => {
        message += `${index + 1}. *${opp.symbol}* (${opp.profitPercent.toFixed(2)}% profit)\n`;
        message += `💰 Buy: $${opp.buyPrice.toFixed(4)} at ${formatExchangeName(opp.buyExchange)}\n`;
        message += `💱 Sell: $${opp.sellPrice.toFixed(4)} at ${formatExchangeName(opp.sellExchange)}\n`;
        message += `📈 Profit per unit: $${(opp.sellPrice - opp.buyPrice).toFixed(4)}\n\n`;
    });

    message += `\nSettings:\nMin Profit: ${settings.minProfit}%\nShowing: ${Math.min(settings.numResults, opportunities.length)} of ${opportunities.length} opportunities`;
    return message;
}

function formatExchangeName(exchange) {
    // Clean up exchange names for better readability
    const names = {
        'binanceUMFutures': 'Binance Futures',
        'coinbaseSpot': 'Coinbase',
        'bitstampSpot': 'Bitstamp',
        'bybitLinearPerpetual': 'Bybit',
        'okxPerpetualSwap': 'OKX',
        'geminiSpot': 'Gemini',
        'gateioFutures': 'Gate.io',
        'bitgetFutures': 'Bitget',
        'cryptodotcomFutures': 'Crypto.com',
        'xtFutures': 'XT.com',
        'phemexSpot': 'Phemex'
    };
    
    return names[exchange] || exchange;
}

// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = 'Welcome to the Crypto Arbitrage Bot! 🤖\n\n' +
        'I will help you find the best arbitrage opportunities across different exchanges.\n\n' +
        'Please use the buttons below to navigate:';
    
    console.log('Sending welcome message to user');
    bot.sendMessage(chatId, welcomeMessage, mainMenuKeyboard);
});

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
    console.log('Received callback query:', callbackQuery.data);
    
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const action = callbackQuery.data;

    console.log(`Processing action: ${action} for chat ${chatId}`);

    switch (action) {
        case 'check_arb':
            console.log('Starting arbitrage check...');
            const loadingMessage = await bot.editMessageText('Fetching arbitrage opportunities... 🔄', {
                chat_id: chatId,
                message_id: messageId
            });
            
            try {
                const data = await getArbitrageData();
                console.log('Got arbitrage data, formatting message...');
                const formattedMessage = formatArbitrageMessage(data);
                
                console.log('Sending formatted message to user');
                await bot.editMessageText(formattedMessage, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🔄 Refresh', callback_data: 'check_arb' }],
                            [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
                        ]
                    }
                });
                console.log('Message sent successfully');
            } catch (error) {
                console.error('Error in check_arb handler:', error);
                bot.editMessageText('Sorry, there was an error fetching the data. Please try again later.',
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: mainMenuKeyboard.reply_markup
                    }
                );
            }
            break;

        case 'settings':
            console.log('Showing settings menu');
            bot.editMessageText('⚙️ Settings\n\nCustomize your arbitrage search:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: settingsKeyboard.reply_markup
            });
            break;

        case 'help':
            const helpMessage = '*Crypto Arbitrage Bot Help*\n\n' +
                '🔍 *Check Arbitrage*: View current arbitrage opportunities\n' +
                '⚙️ *Settings*: Customize minimum profit % and number of results\n\n' +
                '*Current Settings*:\n' +
                `Minimum Profit: ${settings.minProfit}%\n` +
                `Number of Results: ${settings.numResults}`;
            
            console.log('Sending help message to user');
            bot.editMessageText(helpMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]
                    ]
                }
            });
            break;

        case 'main_menu':
            console.log('Showing main menu');
            bot.editMessageText('Main Menu:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: mainMenuKeyboard.reply_markup
            });
            break;

        case 'set_min_profit':
            console.log('Showing min profit settings');
            settings.minProfit = Math.max(0.1, settings.minProfit);
            bot.editMessageText('Set Minimum Profit %:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '-0.5%', callback_data: 'min_profit_down' },
                            { text: `${settings.minProfit}%`, callback_data: 'current_min_profit' },
                            { text: '+0.5%', callback_data: 'min_profit_up' }
                        ],
                        [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
                    ]
                }
            });
            break;

        case 'min_profit_up':
            console.log('Increasing min profit');
            settings.minProfit += 0.5;
            callbackQuery.data = 'set_min_profit';
            bot.emit('callback_query', callbackQuery);
            break;

        case 'min_profit_down':
            console.log('Decreasing min profit');
            settings.minProfit = Math.max(0.1, settings.minProfit - 0.5);
            callbackQuery.data = 'set_min_profit';
            bot.emit('callback_query', callbackQuery);
            break;

        case 'set_num_results':
            console.log('Showing num results settings');
            bot.editMessageText('Set Number of Results:', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '3', callback_data: 'num_results_3' },
                            { text: '5', callback_data: 'num_results_5' },
                            { text: '10', callback_data: 'num_results_10' }
                        ],
                        [{ text: '🔙 Back to Settings', callback_data: 'settings' }]
                    ]
                }
            });
            break;

        case 'num_results_3':
        case 'num_results_5':
        case 'num_results_10':
            console.log(`Setting num results to ${action.split('_')[2]}`);
            settings.numResults = parseInt(action.split('_')[2]);
            bot.editMessageText(`Number of results set to: ${settings.numResults}`, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: settingsKeyboard.reply_markup
            });
            break;
    }

    // Answer callback query to remove loading state
    console.log('Answering callback query');
    bot.answerCallbackQuery(callbackQuery.id);
});

console.log('Bot is running...');
