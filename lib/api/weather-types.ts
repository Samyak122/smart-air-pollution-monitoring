export interface WeatherAssistantMessage {
  role: "user" | "assistant"
  content: string
}

export interface WeatherAssistantResponse {
  answer: string
  location?: string
}
