const handler = async (m, { conn, command }) => {
  try {
    await conn.groupSettingUpdate(m.chat, command === 'app on' ? 'approval' : 'not_approval')
    m.reply(`✅ Aprobación ${command === 'app on' ? 'activada' : 'desactivada'}`)
  } catch {
    m.reply('❌ Error al cambiar la configuración')
  }
}

handler.command = ['app on', 'app off']
handler.tags = ['group']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler