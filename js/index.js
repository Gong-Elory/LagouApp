'use strict';

angular.module('app',["ui.router",'ngCookies','validation','validation.rule','ngAnimate']);

'use strict';
angular.module('app').value('dict',{}).run(['$http','dict',function($http,dict){
	$http.get('data/city.json').success(function(data){
		dict.city = data;
	})

	$http.get('data/salary.json').success(function(data){
		dict.salary = data;
	})

	$http.get('data/scale.json').success(function(data){
		dict.scale = data;
	})



}])
'use strict';
angular.module('app').config(['$provide',function($provide){
	$provide.decorator('$http',['$delegate','$q',function($delegate,$q){
		$delegate.post = function(url,data,config){
			var def = $q.defer();
			$delegate.get(url).success(function(resp){
				def.resolve(resp);
			}).error(function(err){
				def.reject(err);
			});
			return {
				success: function(cb){
					def.promise.then(cb);
				},
				error: function(cb){
					def.promise.then(null,cb);
				}
			}
		}

		return $delegate;
	}])
}])
'use strict';

angular.module('app').config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
	$stateProvider.state('main',{
		url: "/main",
		templateUrl: 'view/main.html',
		controller: 'mainCtrl'
	}).state('position',{
		url: '/position/:id',
		templateUrl: 'view/position.html',
		controller: 'positionCtrl'
	}).state('company',{
		url: '/company/:id',
		templateUrl: 'view/company.html',
		controller: 'companyCtrl'
	}).state('search',{
		url: '/search',
		templateUrl: 'view/search.html',
		controller: 'searchCtrl'
	}).state('login',{
		url: '/login',
		templateUrl: 'view/login.html',
		controller: 'loginCtrl'
	}).state('register',{
		url: '/register',
		templateUrl: 'view/register.html',
		controller: 'registerCtrl'
	}).state('me',{
		url: '/me',
		templateUrl: 'view/me.html',
		controller: 'meCtrl'
	}).state('post',{
		url: '/post',
		templateUrl: 'view/post.html',
		controller: 'postCtrl'
	}).state('save',{
		url: '/save',
		templateUrl: 'view/save.html',
		controller: 'saveCtrl'
	})

	$urlRouterProvider.otherwise('main');
}]);
'use strict'

angular.module('app').config(['$validationProvider',function($validationProvider){
	var expression = {
		phone: /^1[\d]{10}$/,
		password: function(value){
			value += '';
			return value.length > 5
		}
		// phone: /^1[\d]{10}$/,
	};

	var defaultMsg = {
		phone:{
			success: '',
			error: '必须是11位手机号'
		},
		password:{
			success: "",
			error: '长度至少6位'
		},
		required:{
			success: "",
			error: '不能为空'
		}
	};

	$validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
}])
'use strict'

angular.module('app').controller('companyCtrl',['$scope','$http','$stateParams',function($scope,$http,$stateParams){
	$http.get('data/company.json?id='+$stateParams.id).success(function(resp){
		$scope.company = resp;
	})
}])
'use strict'
angular.module('app').controller('loginCtrl',['$scope','$http','dict','$state','cache',function($scope,$http,dict,$state,cache){
	$scope.submit = function(){
		$http.post('data/login.json').success(function(resp){
			cache.put('id',resp.id);
			cache.put('name',resp.name);
			cache.put('image',resp.image);
			$state.go('main');
		})
	}
}])
'use strict'
angular.module('app').controller('mainCtrl',['$scope','$http',function($scope,$http){
	$http.get('/data/positionList.json')
	.success(function(data){
		$scope.list = data;
	});
}])
'use strict'
angular.module('app').controller('meCtrl',['$scope','$http','dict','cache','$state',function($scope,$http,dict,cache,$state){
	if(cache.get('name')){
		$scope.name = cache.get('name');
		$scope.image = cache.get('image');
	}

	$scope.logout = function(){
		cache.remove('id');
		cache.remove('name');
		cache.remove('image');
		$state.go('main');
	}
}])
'use strict'

angular.module('app').controller('positionCtrl',['$scope','$state','$http','$stateParams','$q','$log','cache',function($scope,$state,$http,$stateParams,$q,$log,cache){
	$scope.isLogin = !! cache.get('name');
	$scope.message = $scope.isLogin?'投个简历':'未登录';
	
	function getPosition(){
		var def = $q.defer();
		$http.get('/data/position.json?id='+ $stateParams.id).success(function(data){
			$scope.position = data;
			if(data.posted){
					$scope.message = "已投递";
			}
			def.resolve(data)
		}).error(function(err){
			def.reject(err);
		})
		return def.promise;
	};

	function getCompany(id){
		$http.get("data/company.json?id="+id).success(function(data){
			$scope.company = data;
		})
	}
	
	getPosition().then(function(obj){
		getCompany(obj.companyId);
	},function(err){
		console.log(err);
	})

	$scope.go = function(){
		if($scope.isLogin){
			if ($scope.message !== '已投递')
			 {
			    $http.post('data/handle.json', {
			        id: $scope.position.id
			    }).success(function(resp) {
			        $log.info(resp);
			        $scope.message = "已投递";
			    })
			} 
		}else 
		{
		    $state.go('login');
		}
		
	}
}])
'use strict'
angular.module('app').controller('postCtrl',['$scope','$http',function($scope,$http){
	$scope.tabList = [
	{
		id:"all",
		name:"全部"
	},
	{
		id:"pass",
		name:"面试邀请"
	},
	{
		id:"fail",
		name:"不合适"
	}];

	$http.get('data/myPost.json').success(function(res){
		$scope.positionList = res;
	})

	$scope.filterObj = {};
	$scope.tClick  =  function(id,name){
		switch (id){
			case 'all' : 
			delete	$scope.filterObj.state
			break;
			case 'pass':
				$scope.filterObj.state = '1';
			break;
			case 'fail':
				$scope.filterObj.state = '-1';
			break;
		}
	}
}])
'use strict'
angular.module('app').controller('registerCtrl',['$scope','$http','dict','$interval','$state',function($scope,$http,dict,$interval,$state){
	$scope.submit = function(){
		$http.post('data/regist.json',$scope.user).success(function(resp){
			$state.go('login');
		})
	};

	var count = 60;
	$scope.send = function(){
		$http.get('data/code.json').success(function(resp){
			if(1 === resp.state){
				$scope.time = '60s';
				count = 60;
				var interval = $interval(function(){
					if(count <= 0){
						$interval.cancel(interval);
						$scope.time = '';
					}else{
						count--;
						$scope.time = count+'s';
					}
					
				},1000)
			}
		})
	}
}])
'use strict'
angular.module('app').controller('saveCtrl',['$scope','$http','dict',function($scope,$http,dict){
	$http.get('data/myFavorite.json').success(function(resp){
		$scope.list = resp;
	})	
}])
'use strict'
angular.module('app').controller('searchCtrl',['$scope','$http','dict',function($scope,$http,dict){
	$scope.name = '';
	$scope.search = function(){
		$http.get('data/positionList.json?name=' + $scope.name).success(function(resp){
			$scope.positionList = resp;
		});
	};
	$scope.search();
	$scope.sheet = {};
	$scope.tabList = [{
		id: 'city',
		name: '城市'
	},{
		id:"salary",
		name: '薪水'
	},{
		id:"scale",
		name:'公司规模'
	}];

	var tabId = "";
	$scope.filterobj = {};
	$scope.tClick = function(id,name){
		tabId = id;
		$scope.sheet.list = dict[id];
		console.log($scope.sheet.list);
		$scope.sheetvis = true;
		console.log($scope);
	};

	$scope.sClick = function(id,name){
		if(id){
			angular.forEach($scope.tabList,function(item){
				if(item.id === tabId){
					item.name = name;

				}
			});
			console.log(id);
			$scope.filterobj[tabId+"Id"] = id ;
		}else{
			delete $scope.filterobj[tabId + 'Id'];
			angular.forEach($scope.tabList,function(item){
				if(item.id === tabId){
					switch(item.id){
					case 'city':
					item.name = "城市";
					break;
					case 'salary':
					item.name = "薪水";
					break;
					case 'scale':
					item.name = "公司规模";
					break;
					deafult:
					break;
					}
				}
			});
		}
	}
	
}])
'use strict';
angular.module('app').directive('appCompany',function(){
	return {
		restrict: "A",
		replace: true,
		templateUrl: "view/templates/company.html",
		scope:{
			com: '='
		}
	}
})
'use strict';
angular.module('app').directive('appFoot',function(){
	return {
		restrict: "A",
		replace: true,
		templateUrl: "view/templates/foot.html"
	}
})
'use strict';

angular.module('app').directive('appHead',['cache',function(cache){
	return {
		restrict: "A",
		replace: true,
		templateUrl: "view/templates/head.html",
		link:function(scope){
			scope.name = cache.get('name') || '';
		}
	}
}])
'use strict'

angular.module('app').directive('appHeadBar',function(){
	return {
		restrict: "A",
		replace: true,
		templateUrl: 'view/templates/headBar.html',
		scope:{
			text: '='
		},
		link: function(scope){
			scope.back = function(){
				window.history.back();
			};
		}
	};
});
'use strcit';
angular.module('app').directive('appPositionClass',function(){
	return {
		restrict: "A",
		replace: true,
		templateUrl: 'view/templates/positionClass.html',
		scope:{
			com: '='
		},
		link:function(scope){
			scope.showPositionList = function(idx){
				scope.positionList = scope.com.positionClass[idx].positionList;
				scope.isActive = idx;
			}
			scope.$watch('com',function(newval){
				if(newval) scope.showPositionList(0);
			})
			
		}
	}
})
'use strict';

angular.module('app').directive('appPositionInfo',['$http',function($http){
	return {
		restrict: 'A',
		replace: true,
		templateUrl: 'view/templates/positioninfo.html',
		scope:{
			isLogin: "=",
			pos: "="
		},
		link: function(scope){
				

				scope.$watch('pos',function(newVal){
					if(newVal){
						scope.pos.select = scope.pos.select || false;
						scope.imgPath = scope.pos.select?'image/star-active.png':'image/star.png';
					}
				})
				scope.favorite = function(){
					$http.post('data/myFavorite.json',{
						id: scope.pos.id,
						select:  !scope.pos.select
					}).success(function(resp){
						scope.pos.select= !scope.pos.select;
						scope.imgPath = scope.pos.select?'image/star-active.png':'image/star.png';
					})
				}
		}
	}
}])
'use strict';
angular.module('app').directive('appPositionList',['$http','cache',function($http,cache){
	return {
		restrict: "A",
		replace: true,
		templateUrl: "view/templates/positionlist.html",
		scope: {
			data: "=",
			filterobj: "=",
			isFavorite: "="
		},
		link:function($scope){
			$scope.name = cache.get('name') || '';
			$scope.select = function(item){
				$http.post('data/myFavorite.json',{
					id: item.id,
					select: !item.select
				}).success(function(){
					item.select = !item.select;
				});
			}

			$scope.iconclick =function(event,item){
				event.stopPropagation();
				select(item);
			}
		}
	}
}])
'use strict';
angular.module('app').directive('appSheet',function(){
	return {
		restrict: "A",
		replace: true,
		templateUrl: "view/templates/sheet.html",
		scope:{
			list: "=",
			vis: "=",
			select: "&"
		},
	}
})
'use strict';
angular.module('app').directive('appTab',function(){
	return {
		restrict: "A",
		replace: true,
		templateUrl: "view/templates/tab.html",
		scope: {
			tabClick: '&',
			list: "="
		},
		link: function(scope){
			scope.$watch("list",function(newVal){
				scope.selectId = newVal[0].id;
			});
			scope.click = function(tab){
				scope.selectId = tab.id;
				scope.tabClick(tab);
			}
			
		}
	}
})
'use strict';
angular.module('app').filter('filterByObj',function(){
	return function(list,obj){
		var result = [];
		angular.forEach(list,function(item){
			var isEaqul = true;
			for(var e in obj){
				if(item[e] !== obj[e]){
					isEaqul = false;
				}
			}

			if(isEaqul){
				result.push(item);
			}
		});
		return result;
	}
})
"use strict";
angular.module('app').factory('cache',['$cookies',function($cookies){
	return {
		put : function(key, value) {
		    $cookies.put(key, value);
		},

		get : function(key) {
		    return $cookies.get(key);
		},

		remove : function(key) {
		    $cookies.remove(key);
		}
	}
}])