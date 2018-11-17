
(function(){
	document.getElementById('sbox').focus();	
})();

var app=angular.module('app',['ngSanitize']);

app.service('memory',function(){
	
	this.getpastsearches=function(){
		return localStorage.getItem('pastsearches');
	};
	
	this.setcurrentresult=function(result){
		var rstr=JSON.stringify(result);
		localStorage.setItem('currentresult',rstr);
		var pstr=localStorage.getItem('pastsearches');
		if(pstr===null){
			var arr=[];
			arr.push(rstr);
			localStorage.setItem('pastsearches',JSON.stringify(arr));
		}else{
			var arr=JSON.parse(pstr);
			var lobj=JSON.parse(arr[0]);
			if(lobj.hasOwnProperty('imdbID')){
				var imdbid=lobj['imdbID'];
				if(imdbid.localeCompare(result['imdbID'])!==0){
					//add to beginning
					arr.unshift(rstr);
					if(arr.length>5){
						arr.pop();
					}
					localStorage.setItem('pastsearches',JSON.stringify(arr));
				}
			}else{
				//add to beginning
				arr.unshift(rstr);
				if(arr.length>5){
					arr.pop();
				}
				localStorage.setItem('pastsearches',JSON.stringify(arr));
			}
		}
	};
	
	this.getpastskeywords=function(){
		var pks=localStorage.getItem('pastskeywords');
		if(pks===null){
			return null;
		}else{
			return JSON.parse(pks);
		}
	};
	
	this.addkeyword=function(keyword){
		keyword=keyword.toLowerCase();
		var pks=localStorage.getItem('pastskeywords');
		console.log("adding "+keyword);
		console.log("pastskeywords before : "+pks);
		if(pks===null){
			var arr=[];
			arr.push(keyword);
			localStorage.setItem('pastskeywords',JSON.stringify(arr));
		}else{
			var arr=JSON.parse(pks);
			if(arr.includes(keyword))return;
			arr.push(keyword);
			localStorage.setItem('pastskeywords',JSON.stringify(arr));
		}
	};
	
});

app.controller('ctrl',function($scope,$window,$http,$timeout,$sce,memory){
	$scope.myear = "";
	$scope.mtitle = "";
	
	$scope.toast = document.getElementById('toastdiv');
	$scope.toastqueue = [];
	$scope.isshowingtoast = false;
	$scope.timelogs = [5];
	
	$scope.sbuttonmsg="Search";
	
	$scope.instantsearchkeyword='';
	$scope.isrequesting=false;
	
	$scope.searchmovie=function(){
		//search movie with mtitle and myear
		if($scope.isrequesting){
			return;
		}
		
		var title=$scope.mtitle;
		var year=$scope.myear;
		if(title.length===0){
			//no title error
			$scope.toast_message("Missing movie title",2,"warning");
			return;
		}
		var urlstr="";
		if(year.length===0){
			urlstr="http://www.omdbapi.com/?t="+title+"&plot=full&apikey=c5a510c3";
		}else{
			for(var i=0;i<year.length;++i){
				var code=year.charCodeAt(i);
				if((code<48)||(code>57)){
					//invalid year
					$scope.toast_message("Invalid year format",2,"warning");
					return;
				}
			}
			//-------------------------------//
			urlstr="https://www.omdbapi.com/?t="+$scope.mtitle+"&y="+year+"&plot=full&apikey=c5a510c3";
		}

		$scope.sbuttonmsg="Fetching...";
		$scope.isrequesting=true;
		$scope.instantsearchkeyword=document.getElementById('sbox').value;
		$http({
			method : "GET",
			url : urlstr
		}).then(function success(response){
			console.log(response);
			
			$scope.sbuttonmsg="Search";
			$scope.isrequesting=false;
			
			$scope.handleresponse(response);
		}, function error(response){
			console.log(response);
			
			$scope.sbuttonmsg="Search";
			$scope.isrequesting=false;
			
			$scope.toast_message("Something went wrong :(",2,"warning");
		});
	};
	
	$scope.handleresponse=function(response){
		if((response.status===200)||(response.hasOwnProperty('data'))){
			//okay we've got something
			if(response.data.Response==='True'){
				memory.addkeyword($scope.instantsearchkeyword);
				memory.setcurrentresult(response.data);
				$window.location.href="/searchresult";
			}else{
				$scope.toast_message("No results found :(",2,"warning");
			}
		}
	};
	
	//=============================================================================================================================//
	
	$scope.toast_message = function (msg, dur, type) {
		if (!$scope.isshowingtoast) {
			var stylestr="";
			if(type==="warning"){
				stylestr="style='height:42px;line-height:42px;background-color:rgb(150,0,0);border-radius:3px;'";
			}else if(type==="success"){
				stylestr="style='height:42px;line-height:42px;background-color:rgb(16,124,16);border-radius:3px;'";
			}else{
				stylestr="style='height:42px;line-height:42px;background-color:rgb(0,162,232);border-radius:3px;'";
			}
		
			var nwidth = ((msg.length * 11));
			$("#toastdiv").animate({width: nwidth + "px", left: ((($window.innerWidth) - nwidth) / 2) + "px", top:"52px", opacity:1.0}, "slow", function () {
			});

			$scope.toast.innerHTML = "<div "+stylestr+">"+msg+"</div>";
			$scope.timelogs[0] = Date.now();
			$scope.show_toast(dur);
			$scope.isshowingtoast = true;
		} else {
			$scope.toastqueue.push({msg:msg,dur:dur,type:type});
		}
	};
	
	$scope.show_toast = function (dur) {
		var time = ((Date.now() - $scope.timelogs[0]) / 1000);
		if (time < dur) {
			setTimeout(function () {
				$scope.show_toast(dur);
			}, 1);
		} else {
			$("#toastdiv").animate({width: "0px", left: (($window.innerWidth) / 2) + "px", top:"-50px", opacity:0.0}, "slow", function () {
				$scope.isshowingtoast = false;
				if ($scope.toastqueue.length > 0) {
					var obj=$scope.toastqueue.slice(0, 1);
					$scope.toastqueue.shift();
					$scope.toast_message(obj[0].msg,obj[0].dur,obj[0].type);
				} else {
					$scope.toast.innerHTML = "";
				}
			});
		}
	};
	
	$timeout(function(){$scope.toast_message("Search for movies using title and/or year",3,"");},1000);
	
	var pstr=memory.getpastsearches();
	$scope.pastsearches=(pstr === null)?[]:JSON.parse(pstr);
	var pastsearchesarr=$scope.pastsearches;
	if($scope.pastsearches.length === 0){
		var str="";
		str+="<div id='nopastrecdiv'><div><img src='./images/folder.svg' width='200' height='200'></div>"+
			 "<div id='norecmsg'>No past search records</div></div>";
		$scope.pastsearchcontent=$sce.trustAsHtml(str);
	}else{
		var str="";
		str+="<div id='pastrecholder'>";
		console.log("length: "+$scope.pastsearches.length);
		for(var i=0;i<$scope.pastsearches.length;++i){
			var obj=JSON.parse($scope.pastsearches[i]);
			str+="<div class='pastrecdiv' data-obj='"+i+"' onclick='openpast(event)'>";
			
			str+="<div class='rposterdiv' data-obj='"+i+"'>";
			str+=("<div><img data-obj='"+i+"' class='rposter' src='"+obj.Poster+"' width='60' height='89' alt='poster'></div>");
			str+="</div>";
			
			
			str+="<div class='rcontentdiv' data-obj='"+i+"'>";
			
			str+="<div class='rtitle' data-obj='"+i+"'>";
			str+=(obj.Title+" ("+obj.Released+")");
			str+="</div>";
			
			str+="<div class='rlangcont' data-obj='"+i+"'>";
			str+=(obj.Language+"  ("+obj.Country+")");
			str+="</div>";
			
			str+="<div class='rgenre' data-obj='"+i+"'>";
			str+=obj.Genre;
			str+="</div>";
			
			str+="<div class='rrating' data-obj='"+i+"'>";
			str+="<div><img style='margin-top:7px;' data-obj='"+i+"' src='https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg' width='32' height='32'></div>";
			str+=("<div data-obj='"+i+"' style='margin-left:9px'>"+((obj.hasOwnProperty('imdbRating'))?obj['imdbRating']:"--")+"</div>");
			str+="</div>";
			
			str+="</div>";
			str+="</div>";
		}
		str+="<div style='width:10px;height:40px'></div>";
		str+="</div>";
		$scope.pastsearchcontent=$sce.trustAsHtml(str);
	}
	
	var datalist=$('#pastskeywords');
	var pastkeywords=memory.getpastskeywords();
	if(pastkeywords!==null){
		for(var i=0;i<pastkeywords.length;++i){
			var option=$('<option></option>').attr('value',pastkeywords[i]);
			datalist.append(option);
		}
	}
	
});

function openpast(event){
	var div=event.target;
	var arr=JSON.parse(localStorage.getItem('pastsearches'));
	var index=parseInt(div.dataset.obj);
	localStorage.setItem('currentresult',arr[index]);
	window.location.href='/searchresult';
}








	

