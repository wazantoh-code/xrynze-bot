import {
    apiUrl, sendMessage, editMessage, answerCallback, getChatMember, getChatAdministrators, getMe,
    restrictChatMember, kickChatMember, unbanChatMember, deleteMessage,
    escapeHtml, mentionHtml, extractUser, extractText, splitQuotes,
    buttonMarkdownParser, buildKeyboard, markdownToHtml, formatText,
    isUserAdmin, getChatMemberCount
} from './utils.js';

// ==========================================
//  DATABASE QUERIES (D1)
// ==========================================

async function getRules(db, chatId) {
    const res = await db.prepare(
        'SELECT rules_text FROM rules WHERE chat_id = ?'
    ).bind(chatId).first();
    return res?.rules_text || null;
}

async function setRules(db, chatId, rulesText) {
    await db.prepare(
        `INSERT INTO rules (chat_id, rules_text) VALUES (?, ?)
         ON CONFLICT(chat_id) DO UPDATE SET rules_text = excluded.rules_text`
    ).bind(chatId, rulesText).run();
}

// ==========================================
//  HELP TEXT
// ==========================================
const RULES_HELP = `
──「 Aturan 」──

❖ /rules: Melihat aturan grup (di grup akan dikirim tombol ke PM)

*Hanya Admin:*
❖ /setrules <teks>: Mengatur aturan grup. Gunakan markdown untuk format.
❖ /clearrules: Menghapus aturan grup.
`;

// ==========================================
//  FUNGSI MENGIRIM ATURAN
// ==========================================
async function sendRules(update, context, chatId, fromPm = false) {
    const { token, bot } = context;
    const user = update.effective_user;
    const message = update.effective_message;
    const chat = await getChat(token, chatId);

    if (!chat && fromPm) {
        await sendMessage(token, user.id, 
            '❌ Aturan untuk grup ini belum diatur dengan benar! Minta admin untuk memperbaikinya.\n' +
            'Mungkin mereka lupa tanda hubung (-) pada ID.');
        return;
    }

    const rules = await getRules(context.db, chatId);
    const chatTitle = chat?.title || 'Grup';

    if (fromPm && rules) {
        const text = `📜 *Aturan untuk ${escapeMarkdown(chatTitle)}:*\n\n${rules}`;
        await sendMessage(token, user.id, text, { parse_mode: 'Markdown' });
    } else if (fromPm && !rules) {
        await sendMessage(token, user.id, 
            '❌ Admin grup belum mengatur aturan untuk obrolan ini.\n' +
            'Tapi bukan berarti tidak ada aturan ya...!');
    } else if (!fromPm && rules) {
        const button = {
            inline_keyboard: [[
                { text: '📋 Lihat Aturan', url: `https://t.me/${bot.username}?start=rules_${chatId}` }
            ]]
        };
        
        if (message.reply_to_message) {
            await sendMessage(token, chatId, 
                'Klik tombol di bawah untuk melihat aturan grup.',
                { reply_markup: button, reply_to_message_id: message.reply_to_message.message_id }
            );
        } else {
            await sendMessage(token, chatId, 
                'Klik tombol di bawah untuk melihat aturan grup.',
                { reply_markup: button }
            );
        }
    } else if (!fromPm && !rules) {
        await sendMessage(token, chatId, 
            '❌ Admin grup belum mengatur aturan untuk obrolan ini.\n' +
            'Tapi bukan berarti tidak ada aturan ya...!');
    }
}

function escapeMarkdown(text) {
    if (!text) return '';
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

async function getChat(token, chatId) {
    try {
        const res = await fetch(apiUrl(token, 'getChat', { chat_id: chatId }));
        const json = await res.json();
        return json.ok ? json.result : null;
    } catch {
        return null;
    }
}

// ==========================================
//  COMMAND HANDLERS
// ==========================================

async function rulesCommand(update, context) {
    const { message, chat } = context;
    
    if (chat.type === 'private') {
        return;
    }
    
    await sendRules(update, context, chat.id, false);
}

async function setRulesCommand(update, context) {
    const { message, db, token, chat, user } = context;
    
    if (!await isUserAdmin(token, chat.id, user.id) && chat.type !== 'private') {
        return sendMessage(token, chat.id, '❌ Perintah ini hanya untuk admin.');
    }

    const text = message.text || '';
    const args = text.split(' ').slice(1).join(' ').trim();
    
    if (!args && !message.reply_to_message) {
        return sendMessage(token, chat.id, '❌ Gunakan: /setrules <teks aturan>');
    }

    let rulesText = '';
    if (message.reply_to_message) {
        if (message.reply_to_message.text) {
            rulesText = message.reply_to_message.text;
        } else if (message.reply_to_message.caption) {
            rulesText = message.reply_to_message.caption;
        } else {
            return sendMessage(token, chat.id, '❌ Pesan yang dibalas tidak mengandung teks.');
        }
    } else {
        rulesText = args;
    }

    const parsedRules = markdownToHtml(rulesText);
    
    await setRules(db, chat.id, parsedRules);
    await sendMessage(token, chat.id, '✅ Aturan grup berhasil disimpan!');
}

async function clearRulesCommand(update, context) {
    const { message, db, token, chat, user } = context;
    
    if (!await isUserAdmin(token, chat.id, user.id) && chat.type !== 'private') {
        return sendMessage(token, chat.id, '❌ Perintah ini hanya untuk admin.');
    }

    await setRules(db, chat.id, '');
    await sendMessage(token, chat.id, '✅ Aturan grup telah dihapus!');
}

// ==========================================
//  EXPORT MODUL
// ==========================================
export default {
    mod_name: "Rules",
    help: RULES_HELP,
    commands: [
        { command: 'rules', handler: rulesCommand },
        { command: 'setrules', handler: setRulesCommand },
        { command: 'clearrules', handler: clearRulesCommand }
    ],
    callbacks: [],
    messageHandlers: []
};

export { sendRules };
