import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: image }
            },
            {
              type: 'text',
              text: `Look at this food image carefully. Identify every food item visible and estimate the total macros for a typical serving of what you see.

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "name": "descriptive food name",
  "qty": 100,
  "unit": "g",
  "cal": 0,
  "protein": 0,
  "carb": 0,
  "fat": 0,
  "fiber": 0,
  "description": "brief description of what you see"
}

For Indian foods be specific (dal tadka, chicken biryani, masala dosa etc).
Estimate realistic portion size from what is visible in the image.
Only return the JSON object.`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
    const text = data.content?.[0]?.text ?? '{}'
    let result
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      result = JSON.parse(clean)
    } catch { result = null }

    return NextResponse.json({ result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
