import vine from '@vinejs/vine'

export const TestValidator = vine.compile(
  vine.object({
    form: vine.string(),
    audio: vine.file({
      extnames: ['mp3', 'm4a', 'wav', 'mp4', 'flac', 'ogg', 'webm'],
      size: '10mb',
    }),
  })
)
