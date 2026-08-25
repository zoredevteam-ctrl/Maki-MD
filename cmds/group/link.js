const handler = async (m, { conn }) => {
  try {
    const code = await conn.groupInviteCode(m.chat)
    m.reply(`https://chat.whatsapp.com/${code}`)
  } catch {
    m.reply('❌ Error al obtener el link')
  }
}

handler.command = ['link']
handler.tags = ['group']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler