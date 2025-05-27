import ai_service from '#services/ai_service'
import { UploadAudioValidator } from '#validators/audio_upload'
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://emonshi.net/site',
  timeout: 5000,
})

export default class PatientController {
  private async fetchSingleForm(token: string, form_id: number) {
    try {
      const { data } = await apiClient.get(`/forms/${form_id}`, {
        headers: { Authorization: token },
      })

      return data.form
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          message: 'Failed to fetch form details',
          error: error.response?.data || error.message,
        }
      }
      return {
        message: 'Unexpected error',
        error: String(error),
      }
    }
  }

  async convertToForm({ request, response }: HttpContext) {
    const token = request.header('Authorization')
    if (!token) {
      return response.status(401).json({ message: 'Authorization token is missing' })
    }

    const { audio, form_id } = await request.validateUsing(UploadAudioValidator)

    const form = await this.fetchSingleForm(token, form_id)
    const responseForm = await ai_service.canvertVoiceToForm(form, audio)

    response.status(201).json(responseForm)
  }

  private async fetchFromAPI(endpoint: string, token: string) {
    try {
      const { data } = await apiClient.get(endpoint, {
        headers: { Authorization: token },
      })
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          status: error.response?.status || 500,
          message: error.response?.data || error.message,
        }
      }
      throw { status: 500, message: String(error) }
    }
  }

  async getPatient({ request, response }: HttpContext) {
    const token = request.header('Authorization')
    if (!token) return response.status(401).json({ message: 'Authorization token is missing' })

    try {
      const data = await this.fetchFromAPI('/patient', token)
      response.status(200).json(data)
    } catch (error) {
      response.status(error.status).json({ message: 'Failed to fetch patient data', error: error.message })
    }
  }

  async getVisits({ request, response }: HttpContext) {
    const token = request.header('Authorization')
    if (!token) return response.status(401).json({ message: 'Authorization token is missing' })

    try {
      const data = await this.fetchFromAPI('/visits', token)
      response.status(200).json(data)
    } catch (error) {
      response.status(error.status).json({ message: 'Failed to fetch visits', error: error.message })
    }
  }

  async getForms({ request, response }: HttpContext) {
    const token = request.header('Authorization')
    if (!token) return response.status(401).json({ message: 'Authorization token is missing' })

    try {
      const data = await this.fetchFromAPI('/forms', token)
      response.status(200).json(data)
    } catch (error) {
      response.status(error.status).json({ message: 'Failed to fetch forms', error: error.message })
    }
  }
}
