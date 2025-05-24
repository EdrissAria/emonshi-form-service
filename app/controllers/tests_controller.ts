import TestService from '#services/test_service'
import { TestValidator } from '#validators/test'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs/promises'

const promptDir = new URL('../../resources/prompts/', import.meta.url)

export default class TestsController {
  async convertToForm({ request, response }: HttpContext) {
    const { audio, form } = await request.validateUsing(TestValidator);

    console.log(audio, form);

    const responseForm = await TestService.canvertVoiceToForm(audio, form)
    response.status(201).json(responseForm)
  }

  public async index({ response }: HttpContext) {
    const cleanVoice = await fs.readFile(new URL('clean_voice_prompt.txt', promptDir), 'utf-8')
    const formPrompt = await fs.readFile(new URL('form_extract_prompt.txt', promptDir), 'utf-8')

    return response.ok({
      clean_voice_prompt: cleanVoice,
      form_extract_prompt: formPrompt,
    })
  }

  public async update({ request, response }: HttpContext) {
    const { type, content } = request.only(['type', 'content']) as {
      type: 'clean_voice_prompt' | 'form_extract_prompt',
      content: string
    };
  
    const fileMap: Record<'clean_voice_prompt' | 'form_extract_prompt', string> = {
      clean_voice_prompt: 'clean_voice_prompt.txt',
      form_extract_prompt: 'form_extract_prompt.txt',
    };
  
    await fs.writeFile(new URL(fileMap[type], promptDir), content, 'utf-8');
  
    return response.ok({ success: true });
  }
  

}
