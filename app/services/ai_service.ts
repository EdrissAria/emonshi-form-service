import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { JsonOutputParser, StringOutputParser } from '@langchain/core/output_parsers'
import { OpenAI } from 'openai'
import env from '#start/env'
import { RunnableSequence } from '@langchain/core/runnables'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

const apiKey = env.get('OPENAI_API_KEY')
const openai = new OpenAI({ apiKey })
const llm = new ChatOpenAI({ apiKey, model: 'gpt-4.1', temperature: 0.2 })

class AiService {
  private async convert(file: any) {
    if (!file.tmpPath) {
      throw new Error('Invalid file path')
    }

    const folder = 'temp'
    const ext = path.extname(file.clientName || '.mp3')
    const tempFilePath = path.join(folder, `temp_audio${ext}`)

    try {
      await fs.mkdir(folder, { recursive: true })

      await fs.copyFile(file.tmpPath, tempFilePath)

      const readStream = fsSync.createReadStream(tempFilePath)

      const transcription = await openai.audio.transcriptions.create({
        file: readStream,
        model: 'whisper-1',
        response_format: 'json',
      })

      console.log('🎙️ Voice Transcript: ', transcription.text)
      return transcription.text
    } catch (e) {
      console.error('❌ Transcription Error: ', e)
      throw new Error('Audio transcription failed')
    } finally {
      try {
        await fs.unlink(tempFilePath)
      } catch {
        console.log('cant delete tempaudio')
      }
    }
  }

  private promptDir = new URL('../../resources/prompts/', import.meta.url)

  private getPrompt(type: 'clean_voice_prompt' | 'form_extract_prompt') {
    const fileMap = {
      clean_voice_prompt: 'clean_voice_prompt.txt',
      form_extract_prompt: 'form_extract_prompt.txt',
    }

    return fs.readFile(new URL(fileMap[type], this.promptDir), 'utf-8')
  }

  public async canvertVoiceToForm(form: object, file: any) {
    const transcriptText = await this.convert(file)

    const cleanVoiceTemplate = await this.getPrompt('clean_voice_prompt')
    const formExtractTemplate = await this.getPrompt('form_extract_prompt')

    const cleanVoicePrompt = ChatPromptTemplate.fromTemplate(cleanVoiceTemplate)

    const cleanVoiceChain = cleanVoicePrompt.pipe(llm).pipe(new StringOutputParser())

    const prompt = ChatPromptTemplate.fromTemplate(formExtractTemplate)

    const parser = new JsonOutputParser()

    const answerChain = prompt.pipe(llm).pipe(parser)

    const chain = RunnableSequence.from([
      cleanVoiceChain,
      (input) => ({ text: input, form_format: form }),
      answerChain,
    ])

    const response = await chain.invoke({
      voice_text: transcriptText,
    })

    return response
  }
}

export default new AiService()
