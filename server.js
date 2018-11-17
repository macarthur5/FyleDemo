const express=require('express');
const app=express();

app.set('view engine','pug');

app.use(express.static(__dirname+'/public'));

app.get('/',(req,res)=>{
	res.render('index');
});

app.get('/searchresult', (req,res) =>{
	res.render('searchresult');
});

const server=app.listen( process.env.PORT||8080,()=>{
	console.log('express running');
});