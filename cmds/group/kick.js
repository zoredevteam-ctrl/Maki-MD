const handler = async (m, { conn, who }) => {
    if (!who) return m.reply('⚠️ *Menciona al usuario que desea expulsar*')

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    if (who === botJid) return m.reply('⚠️ No puedo expulsarme a mí mismo')

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        m.reply('✅ Usuario eliminado')
    } catch {
        m.reply('❌ No quiero chambear')
    }
}

handler.command = ['kick', 'ban']
handler.tags     = ['group']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
