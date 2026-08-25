const handler = async (m, { conn }) => {
  try {
    await conn.groupRevokeInvite(m.chat)
    m.reply('✅ Enlace de invitación revocado correctamente')
  } catch {
    m.reply('❌ Error al revocar el enlace')
  }
}

handler.command = ['revoke']
handler.tags = ['group']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler