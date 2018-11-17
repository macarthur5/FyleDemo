var app=angular.module('app',['ngSanitize']);

app.controller('ctrl',function($scope,$window,$sce){
	var data= JSON.parse(localStorage.getItem('currentresult')+"");
	
	$scope.posterimagestr='';
	$scope.plotstr='';
	$scope.showingplot=false;

	if(data.hasOwnProperty('Title')){
		$scope.movietitle=data.Title;
	}else{
		$scope.movietitle='--';
	}
	
	if(data.hasOwnProperty('Released')){
		$scope.releasedate=data.Released;
	}else{
		$scope.releasedate='--';
	}
	
	if(data.hasOwnProperty('Genre')){
		$scope.genre=data.Genre;
	}else{
		$scope.genre='--';
	}
	
	var lcval='';
	if(data.hasOwnProperty('Language')){
		lcval+=data.Language;
	}else{
		lcval+="--";
	}

	if(data.hasOwnProperty('Country')){
		lcval+=(" ("+data.Country+")");
	}else{
		lcval+=" (--)";
	}
	
	$scope.langandcountry=lcval;
	
	if(data.hasOwnProperty('Poster')){
		$scope.posterimagestr= $sce.trustAsHtml('<img alt="movie poster" width="300" height="445" src="'+data.Poster+'">');
	}else{
		$scope.posterimagestr=$sce.trustAsHtml('<img alt="movie poster" width="300" height="445" src="">');
	}
	
	if(data.hasOwnProperty('Plot')){
		$scope.plotstr= $sce.trustAsHtml('<div id="movieplotdiv"><div id="movieplotcontent">'+data.Plot+'</div></div>');
	}else{
		$scope.plotstr= $sce.trustAsHtml('<div id="movieplotdiv"><div id="movieplotcontent">'+'Plot not available'+'</div></div>');
	}

	var ratings=data.Ratings;
	$scope.imdbscore=$scope.rtscore=$scope.metascore="--";
	for(var i=0;i<ratings.length;++i){
		if(ratings[i].Source.localeCompare('Internet Movie Database')===0){
			$scope.imdbscore=ratings[i].Value;
		}else if(ratings[i].Source.localeCompare('Rotten Tomatoes')===0){
			$scope.rtscore=ratings[i].Value;
		}else if(ratings[i].Source.localeCompare('Metacritic')===0){
			$scope.metascore=ratings[i].Value;
		}
	}
	//-----------------------------------------------//
	var moviedata=[];
	if(data.hasOwnProperty('Director')){
		moviedata.push({title:'Director',value:data.Director});
	}else{
		moviedata.push({title:'Director',value:'--'});
	}
	
	if(data.hasOwnProperty('Writer')){
		moviedata.push({title:'Writer',value:data.Writer});
	}else{
		moviedata.push({title:'Writer',value:'--'});
	}
	
	if(data.hasOwnProperty('Actors')){
		moviedata.push({title:'Actors',value:data.Actors});
	}else{
		moviedata.push({title:'Actors',value:'--'});
	}
	
	if(data.hasOwnProperty('Runtime')){
		moviedata.push({title:'Runtime',value:data.Runtime});
	}else{
		moviedata.push({title:'Runtime',value:'--'});		
	}
	
	if(data.hasOwnProperty('Awards')){
		moviedata.push({title:'Awards',value:data.Awards});
	}else{
		moviedata.push({title:'Awards',value:'--'});
	}
	
	if(data.hasOwnProperty('Production')){
		moviedata.push({title:'Production',value:data.Production});
	}else{
		moviedata.push({title:'Production',value:'--'});	
	}
	
	if(data.hasOwnProperty('Type')){
		moviedata.push({title:'Type',value:data.Type});
	}else{
		moviedata.push({title:'Type',value:'--'});	
	}
	
	if(data.hasOwnProperty('DVD')){
		moviedata.push({title:'DVD',value:data.DVD});
	}else{
		moviedata.push({title:'DVD',value:'--'});	
	}

	if(data.hasOwnProperty('BoxOffice')){
		moviedata.push({title:'BoxOffice',value:data.BoxOffice});
	}else{
		moviedata.push({title:'BoxOffice',value:'--'});	
	}
	
	if(data.hasOwnProperty('Website')){
		moviedata.push({title:'Website',value:data.Website});
	}else{
		moviedata.push({title:'Website',value:'--'});	
	}
	
	$scope.tabledata=moviedata;
	
	$window.onkeyup = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		if (key == 27) {
			$window.location.href='/';
		}
	};
		
	$scope.posterimagedivcontent=$scope.posterimagestr;
	
	$scope.showplot=function(){
		$scope.showingplot=!$scope.showingplot;
		$scope.posterimagedivcontent=($scope.showingplot)?$scope.plotstr:$scope.posterimagestr;
	};
	
	$scope.plotbutstyle={
		"font-family" : "'Niramit', sans-serif",
		"width" : "100%",
		"font-size" : "24px",
		"height" : "100%",
		"background-color" : "rgb(4,53,102)",
		"color" : "rgb(250,250,250)",
		"border" : "1px solid rgb(0,0,0)",
		"transition" : "background-color 1s",
		"font-weight" : "bold",
		"cursor" : "auto"
	};
	
	$scope.transitmover=function(){
		if(!$scope.showingplot){
			$scope.plotbutstyle['background-color']="rgb(160,35,35)";
			$scope.plotbutstyle['cursor']="pointer";
		}
	};
	
	$scope.transitmout=function(){
		if(!$scope.showingplot){
			$scope.plotbutstyle['background-color']="rgb(4,53,102)";
			$scope.plotbutstyle['cursor']="auto";
		}
	};
	
	$scope.openwebsite=function(){
		window.open(data.Website,"_blank");
	};
	
	$scope.backgstyle={
		"position":"fixed",
		"left":"0px",
		"right":"0px",
		"width":"100%",
		"height":"100%",
		"z-index":"1",
		"display":"block",
		"background-image":"url('"+data.Poster+"')",
		"background-size":"cover",
		"filter":"blur(9px)"
	};
	
});