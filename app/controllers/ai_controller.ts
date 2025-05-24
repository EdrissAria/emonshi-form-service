import ai_service from '#services/ai_service';
import { UploadAudioValidator } from '#validators/audio_upload';
import type { HttpContext } from '@adonisjs/core/http'

export default class AiController {
  async convertToForm({ request, response }: HttpContext) {
    const { audio, form_id } = await request.validateUsing(UploadAudioValidator)

    console.log(audio, form_id)

    const responseForm = await ai_service.canvertVoiceToForm(form_id, audio);
    response.status(201).json(responseForm);
  }
}
