import { NextRequest, NextResponse } from 'next/server'
const FOODS = [
  {name:'Egg',cal:72,protein:6,carb:0.4,fat:5,fiber:0,unit:'piece',baseQty:1},
  {name:'Egg curry',cal:155,protein:10,carb:3,fat:11,fiber:0,unit:'g',baseQty:100},
  {name:'Egg bhurji',cal:160,protein:11,carb:2,fat:12,fiber:0,unit:'g',baseQty:100},
  {name:'Egg roll',cal:220,protein:10,carb:25,fat:10,fiber:1,unit:'piece',baseQty:1},
  {name:'Chicken breast',cal:165,protein:31,carb:0,fat:3.6,fiber:0,unit:'g',baseQty:100},
  {name:'Chicken tikka',cal:150,protein:25,carb:3,fat:4,fiber:0,unit:'g',baseQty:100},
  {name:'Chicken kebab',cal:200,protein:22,carb:5,fat:10,fiber:1,unit:'g',baseQty:100},
  {name:'Chicken 65',cal:280,protein:20,carb:10,fat:18,fiber:1,unit:'g',baseQty:100},
  {name:'Butter chicken',cal:230,protein:18,carb:6,fat:15,fiber:1,unit:'g',baseQty:100},
  {name:'Chicken roast',cal:210,protein:26,carb:2,fat:12,fiber:0,unit:'g',baseQty:100},
  {name:'Chicken keema',cal:250,protein:27,carb:3,fat:16,fiber:0,unit:'g',baseQty:100},
  {name:'Chilli chicken',cal:240,protein:18,carb:10,fat:15,fiber:1,unit:'g',baseQty:100},
  {name:'Chicken roll',cal:280,protein:18,carb:28,fat:12,fiber:2,unit:'piece',baseQty:1},
  {name:'Chicken sandwich',cal:250,protein:15,carb:28,fat:10,fiber:2,unit:'piece',baseQty:1},
  {name:'Chicken fried noodles',cal:220,protein:10,carb:28,fat:8,fiber:2,unit:'g',baseQty:100},
  {name:'Mutton keema',cal:300,protein:25,carb:3,fat:22,fiber:0,unit:'g',baseQty:100},
  {name:'Mutton biryani',cal:220,protein:14,carb:25,fat:8,fiber:1,unit:'g',baseQty:100},
  {name:'Fish curry',cal:180,protein:20,carb:4,fat:10,fiber:0,unit:'g',baseQty:100},
  {name:'Prawn curry',cal:170,protein:19,carb:5,fat:8,fiber:0,unit:'g',baseQty:100},
  {name:'Prawn fry',cal:220,protein:20,carb:6,fat:14,fiber:0,unit:'g',baseQty:100},
  {name:'Crab curry',cal:150,protein:18,carb:4,fat:6,fiber:0,unit:'g',baseQty:100},
  {name:'Rice',cal:130,protein:2.4,carb:28,fat:0.3,fiber:0.4,unit:'g',baseQty:100},
  {name:'Curd rice',cal:130,protein:4,carb:20,fat:4,fiber:1,unit:'g',baseQty:100},
  {name:'Lemon rice',cal:180,protein:4,carb:30,fat:5,fiber:1,unit:'g',baseQty:100},
  {name:'Biryani',cal:200,protein:8,carb:28,fat:7,fiber:1,unit:'g',baseQty:100},
  {name:'Khichdi',cal:120,protein:4,carb:20,fat:2,fiber:2,unit:'g',baseQty:100},
  {name:'Oats',cal:364,protein:13,carb:60,fat:6.5,fiber:11,unit:'g',baseQty:100},
  {name:'Quinoa',cal:120,protein:4,carb:21,fat:2,fiber:2.5,unit:'g',baseQty:100},
  {name:'Daliya',cal:110,protein:3.5,carb:23,fat:1,fiber:3,unit:'g',baseQty:100},
  {name:'Roti',cal:71,protein:2.5,carb:15,fat:0.4,fiber:1.9,unit:'piece',baseQty:1},
  {name:'Chapati',cal:71,protein:2.5,carb:15,fat:0.4,fiber:1.9,unit:'piece',baseQty:1},
  {name:'Jowar roti',cal:120,protein:3,carb:25,fat:1,fiber:2,unit:'piece',baseQty:1},
  {name:'Bajra roti',cal:130,protein:3,carb:26,fat:1.5,fiber:3,unit:'piece',baseQty:1},
  {name:'Bread',cal:79,protein:2.7,carb:15,fat:1,fiber:0.8,unit:'slice',baseQty:1},
  {name:'Pav',cal:150,protein:5,carb:28,fat:2,fiber:1,unit:'piece',baseQty:1},
  {name:'Idli',cal:39,protein:1.8,carb:8,fat:0.2,fiber:0.5,unit:'piece',baseQty:1},
  {name:'Dosa',cal:133,protein:3,carb:25,fat:2.7,fiber:1,unit:'piece',baseQty:1},
  {name:'Masala dosa',cal:250,protein:6,carb:35,fat:10,fiber:2,unit:'piece',baseQty:1},
  {name:'Rava dosa',cal:200,protein:5,carb:30,fat:8,fiber:1,unit:'piece',baseQty:1},
  {name:'Uttapam',cal:210,protein:6,carb:30,fat:8,fiber:2,unit:'piece',baseQty:1},
  {name:'Upma',cal:150,protein:3.5,carb:22,fat:5,fiber:1.5,unit:'g',baseQty:100},
  {name:'Pongal',cal:190,protein:6,carb:28,fat:7,fiber:2,unit:'g',baseQty:100},
  {name:'Poha',cal:130,protein:2,carb:28,fat:1,fiber:0.5,unit:'g',baseQty:100},
  {name:'Sambar',cal:45,protein:2.7,carb:7,fat:0.9,fiber:2,unit:'g',baseQty:100},
  {name:'Dal',cal:116,protein:9,carb:20,fat:0.4,fiber:8,unit:'g',baseQty:100},
  {name:'Dal tadka',cal:130,protein:9,carb:20,fat:4,fiber:5,unit:'g',baseQty:100},
  {name:'Dal makhani',cal:180,protein:9,carb:20,fat:8,fiber:5,unit:'g',baseQty:100},
  {name:'Paneer',cal:265,protein:18,carb:3.4,fat:20,fiber:0,unit:'g',baseQty:100},
  {name:'Palak paneer',cal:180,protein:10,carb:6,fat:13,fiber:2,unit:'g',baseQty:100},
  {name:'Paneer butter masala',cal:260,protein:10,carb:9,fat:20,fiber:1,unit:'g',baseQty:100},
  {name:'Paneer tikka',cal:200,protein:15,carb:4,fat:14,fiber:1,unit:'g',baseQty:100},
  {name:'Chilli paneer',cal:260,protein:14,carb:12,fat:18,fiber:1,unit:'g',baseQty:100},
  {name:'Milk',cal:60,protein:3,carb:4.7,fat:2.3,fiber:0,unit:'ml',baseQty:100},
  {name:'Curd',cal:61,protein:3.5,carb:4.7,fat:2.7,fiber:0,unit:'g',baseQty:100},
  {name:'Whey protein',cal:120,protein:24,carb:3,fat:2,fiber:0,unit:'scoop',baseQty:1},
  {name:'Buttermilk',cal:40,protein:2,carb:4,fat:1,fiber:0,unit:'ml',baseQty:100},
  {name:'Lassi',cal:150,protein:4,carb:25,fat:3,fiber:0,unit:'ml',baseQty:200},
  {name:'Coconut water',cal:19,protein:0.7,carb:4,fat:0.2,fiber:1,unit:'ml',baseQty:100},
  {name:'Banana',cal:89,protein:1.1,carb:23,fat:0.3,fiber:2.6,unit:'piece',baseQty:1},
  {name:'Apple',cal:52,protein:0.3,carb:14,fat:0.2,fiber:2.4,unit:'piece',baseQty:1},
  {name:'Orange',cal:47,protein:0.9,carb:12,fat:0.1,fiber:2.4,unit:'piece',baseQty:1},
  {name:'Mango',cal:60,protein:0.8,carb:15,fat:0.4,fiber:1.6,unit:'g',baseQty:100},
  {name:'Spinach',cal:23,protein:2.9,carb:3.6,fat:0.4,fiber:2.4,unit:'g',baseQty:100},
  {name:'Carrot',cal:41,protein:0.9,carb:10,fat:0.2,fiber:2.8,unit:'g',baseQty:100},
  {name:'Cucumber',cal:16,protein:0.7,carb:3.6,fat:0.1,fiber:0.5,unit:'g',baseQty:100},
  {name:'Green beans',cal:31,protein:1.8,carb:7,fat:0.2,fiber:3.4,unit:'g',baseQty:100},
  {name:'Almonds',cal:579,protein:21,carb:22,fat:50,fiber:12.5,unit:'g',baseQty:100},
  {name:'Peanut butter',cal:588,protein:25,carb:20,fat:50,fiber:6,unit:'g',baseQty:100},
  {name:'Chia seeds',cal:490,protein:17,carb:42,fat:31,fiber:34,unit:'g',baseQty:100},
  {name:'Pani puri',cal:30,protein:1,carb:5,fat:1,fiber:0.5,unit:'piece',baseQty:1},
  {name:'Bhel puri',cal:150,protein:4,carb:28,fat:3,fiber:3,unit:'g',baseQty:100},
  {name:'Pav bhaji',cal:180,protein:5,carb:25,fat:7,fiber:3,unit:'g',baseQty:100},
  {name:'Aloo tikki',cal:150,protein:3,carb:20,fat:7,fiber:2,unit:'piece',baseQty:1},
  {name:'Kathi roll',cal:250,protein:12,carb:30,fat:10,fiber:2,unit:'piece',baseQty:1},
  {name:'Hakka noodles',cal:180,protein:5,carb:30,fat:5,fiber:2,unit:'g',baseQty:100},
  {name:'Spring rolls',cal:200,protein:5,carb:25,fat:10,fiber:2,unit:'piece',baseQty:1},
  {name:'Jalebi',cal:150,protein:1,carb:35,fat:3,fiber:0,unit:'piece',baseQty:1},
  {name:'Kheer',cal:150,protein:4,carb:22,fat:5,fiber:0,unit:'g',baseQty:100},
  {name:'Gajar halwa',cal:220,protein:4,carb:30,fat:10,fiber:2,unit:'g',baseQty:100},
  {name:'Protein bar',cal:200,protein:20,carb:22,fat:7,fiber:5,unit:'piece',baseQty:1},
  {name:'Salmon',cal:208,protein:20,carb:0,fat:13,fiber:0,unit:'g',baseQty:100},
  {name:'Greek yogurt',cal:59,protein:10,carb:3.6,fat:0.4,fiber:0,unit:'g',baseQty:100},
  {name:'Pasta',cal:220,protein:7,carb:30,fat:8,fiber:2,unit:'g',baseQty:100},
  {name:'Veg sandwich',cal:200,protein:6,carb:30,fat:6,fiber:3,unit:'piece',baseQty:1},
  {name:'Sweet potato',cal:86,protein:1.6,carb:20,fat:0.1,fiber:3,unit:'g',baseQty:100},
  {name:'Boiled chickpeas',cal:164,protein:9,carb:27,fat:2.6,fiber:7,unit:'g',baseQty:100},
  {name:'Mushroom curry',cal:120,protein:4,carb:10,fat:7,fiber:2,unit:'g',baseQty:100},
  {name:'Avial',cal:140,protein:3,carb:12,fat:8,fiber:3,unit:'g',baseQty:100},
  {name:'Sprouts salad',cal:100,protein:8,carb:15,fat:1,fiber:4,unit:'g',baseQty:100},
]
function findMatches(query:string){
  const q=query.toLowerCase().trim()
  if(q.length<2)return[]
  return FOODS.map(f=>{
    const name=f.name.toLowerCase();let score=0
    if(name===q)score=10
    else if(name.startsWith(q))score=8
    else if(name.includes(q))score=5
    else{const qw=q.split(' ');const nw=name.split(' ');const m=qw.filter(w=>nw.some(n=>n.startsWith(w)));if(m.length===qw.length)score=6;else if(m.length>0)score=m.length*2}
    return{...f,score}
  }).filter(f=>f.score>0).sort((a,b)=>b.score-a.score).slice(0,7)
}
export async function POST(req:NextRequest){
  try{
    const {query}=await req.json()
    if(!query)return NextResponse.json({results:[]})
    const matches=findMatches(query)
    if(matches.length>0)return NextResponse.json({results:matches})
    const res=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`)
    const data=await res.json()
    const products=(data.products??[]).filter((p:any)=>p.nutriments&&p.product_name).slice(0,5).map((p:any)=>({name:p.product_name,cal:Math.round(p.nutriments['energy-kcal_100g']??0),protein:Math.round((p.nutriments.proteins_100g??0)*10)/10,carb:Math.round((p.nutriments.carbohydrates_100g??0)*10)/10,fat:Math.round((p.nutriments.fat_100g??0)*10)/10,fiber:Math.round((p.nutriments.fiber_100g??0)*10)/10,unit:'g',baseQty:100}))
    return NextResponse.json({results:products})
  }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
