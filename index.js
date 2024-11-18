import TelegramBot from 'node-telegram-bot-api';
import {configDotenv} from 'dotenv';
configDotenv();

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, {
	polling: true
});

const gameName = process.env.GAME_NAME;
const queries = {};

bot.setMyCommands([
	{command: '/start', description: 'Звпуск игры'}
]);

bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements a blast game."));

bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));

bot.on('callback_query', function (query) {
	if (query.game_short_name !== gameName) {
		bot.answerCallbackQuery(query.id, `Sorry, ${query.game_short_name} is not available.`);
	} else {
		queries[query.id] = query;
		let gameurl = 'https://piratetreasures.com/play/';
		bot.answerCallbackQuery({
			callback_query_id: query.id,
			url: gameurl
		});
	}
});

bot.on("inline_query", function (iq) {
	bot.answerInlineQuery(iq.id, [{
		type: "game",
		id: "0",
		game_short_name: gameName
	}]);
});
