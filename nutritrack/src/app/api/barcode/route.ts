import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET(req:NextRequest){
  const code=req.nextUrl.searchParams.get('code')
  if(!code)return NextResponse.json({error:'No barcode'},{status:400})
  try{
    const res=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`,{headers:{'User-Agent':'NutriTrack/1.0'}})
    const data=await res.json()
    if(data.status!==1||!data.product)return NextResponse.json({error:'Product not found'},{status:404})
    const p=data.product;const n=p.nutriments??{}
    return NextResponse.json({result:{name:p.product_name||'Unknown',qty:100,unit:'g',cal:Math.round(n['energy-kcal_100g']??0),protein:Math.round((n.proteins_100g??0)*10)/10,carb:Math.round((n.carbohydrates_100g??0)*10)/10,fat:Math.round((n.fat_100g??0)*10)/10,fiber:Math.round((n.fiber_100g??0)*10)/10}})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
