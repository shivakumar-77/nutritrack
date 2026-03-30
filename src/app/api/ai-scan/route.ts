import { NextRequest, NextResponse } from 'next/server'
export async function POST(req:NextRequest){
  try{
    const {image,mimeType}=await req.json()
    if(!image)return NextResponse.json({error:'No image'},{status:400})
    const response=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY!,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mimeType||'image/jpeg',data:image}},{type:'text',text:`Identify the food and estimate macros. Return ONLY a JSON object:
{"name":"food name","qty":100,"unit":"g","cal":0,"protein":0,"carb":0,"fat":0,"fiber":0}
Only return the JSON object.`}]}]})
    })
    const data=await response.json()
    const text=data.content?.[0]?.text??'{}'
    let result
    try{result=JSON.parse(text.replace(/\`\`\`json|\`\`\`/g,'').trim())}catch{result=null}
    return NextResponse.json({result})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
