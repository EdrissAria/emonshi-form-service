import vine from '@vinejs/vine'

export const UploadAudioValidator = vine.compile(
  vine.object({
    form_id: vine.number(),
    audio: vine.file({
      extnames: ['mp3', 'm4a', 'wav', 'mp4', 'flac', 'ogg', 'webm'],
      size: '10mb',
    }),
  })
)
