const handler = async (m, { conn, args }) => {
  const op = (args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(op)) return m.reply('⚠️ Debes especificar si deseas *activar* o *desactivar* esta cosa')

  try {
    await conn.groupSettingUpdate(m.chat, op === 'on' ? 'approval' : 'not_approval')
    m.reply(`✅ Aprobación de admin para unirse ${op === 'on' ? 'activada' : 'desactivada'}`)
  } catch {
    m.reply('❌ Error al cambiar la configuración')
  }
}

handler.command = ['app']
handler.tags = ['group']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler