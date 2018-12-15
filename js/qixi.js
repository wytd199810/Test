var Qixi = function(){
	/* 最终参数设置 */
	var confi = {
		// 正比缩放
		keepZoomRatio: false,
		//#content样式
		layer: {
			"width": "100%",
			"height": "100%",
			"left": 0,
			"top": 0
		},
		//音乐
		audio: {
			enable: true, //是否开始音乐
			playURL:'music/happy.wav', //正常播放音乐
			cycleURL: 'music/circulation.wav' //循环播放的音乐
		},
		//飘花
		snowflakeURL: [
				'images/snowflake/snowflake1.png',
				'images/snowflake/snowflake2.png',
				'images/snowflake/snowflake3.png',
				'images/snowflake/snowflake4.png',
				'images/snowflake/snowflake5.png',
				'images/snowflake/snowflake6.png'
		],
		//动作所花时间
		setTime: {
			walkToThird: 6000,
			walkToMiddle: 6500,
			walkToEnd: 6500,
			walkTobrige: 2000,
			bridgeWalk: 2000,
			walkToShop: 1500,
			walkOutShop: 1500,
			openDoorTime: 800,
			shutDoorTime:500,
			waitRotate:850,
			waitFlower:800,
		}
	}
	var debug = 0;
	if(debug){
		$.each(confi.setTime, function(key, val){
			confi.setTime[key] = 500;
		})
	}
	//正比缩放
	if(confi.keepZoomRatio){
		var proportionY = 900/1440;
		var screenHeight = $(document).height();
		var zoomHeight = screenHeight * proportionY;
		var zoomTop = (screenHeight - zoomHeight) / 2;
		confi.layer.height = zoomHeight;
		confi.layer.top = zoomTop;
	}
	//定义小男孩的初始X坐标
	var instanceX;
	var container = $("#content");
	container.css(confi.layer);
	var visualWidth = container.width();
	var visualHeight = container.height();
	//获取数据
	var getValue = function(className){
		var $elem = $("" + className + "");
		// 走路的路线坐标
		return {
			height: $elem.height(),
			top: $elem.position().top
		};
	};	
	/* 动画事件结束 */
	var animationEnd = (function(){
		var explorer = navigator.userAgent;
		if(~explorer.indexOf('WebKit')){
			return 'webkitAnimationEnd';
		}
		return 'animationEnd';
	})();
	/* 音乐播放 */
	if(confi.audio.enable){
		var audio1 = Html5Audio(confi.audio.playURL);
		audio1.end(function(){
			Html5Audio(confi.audio.cycleURL, true);
		});
	}
	/* 加载页面 */
	var swipe = Swipe(container);
	//页面滚动到指定位置
	function scrollTo(time, proportionX){
		var distX = visualWidth * proportionX;
		swipe.scrollTo(distX, time);
	}
	//路的Y轴
	var pathY = function() {
		var data = getValue(".a_background_middle");		
		return data.top + data.height/2;
	}();
	// 桥的Y轴
	var bridgeY = function(){
		var data = getValue(".c_background_middle");
		return data.top;
	}();
	//小女孩
	var girl = {
		elem: $(".girl"),
		getHeight: function(){
			return this.elem.height();
		},
		//转身动作
		rotate: function(){
			this.elem.addClass('girl-rotate');
		},
		setOffset: function(){
			this.elem.css({
				left: visualWidth / 2,
				top: bridgeY - this.getHeight()
			});
		},
		getOffset: function(){
			return this.elem.offset();
		},
		getWidth: function(){
			return this.elem.width();
		}
	};
	//鸟动画
	var bird = {
		elem: $(".bird"),
		fly: function(){
			this.elem.addClass('birdFly');
			this.elem.transition({
				right: container.width()
			}, 15000, 'linear');
		}
	};
	// logo动画
	var logo = {
		elem: $(".logo"),
		run: function(){
			this.elem.addClass('logolightSpeedIn')
				 .on(animationEnd, function(){
					$(this).addClass('logoshake').off();
				});
		}
	};
	var boy = BoyWalk();
	$("#sun").addClass('rotation');
	$(".cloud:first").addClass('cloud1Anim');
	$(".cloud:last").addClass('cloud2Anim');
	/* 小男孩的运动时间轴 */
	boy.walkTo(confi.setTime.walkToThird, 0.6)
		.then(function(){
			scrollTo(confi.setTime.walkToMiddle, 1);
			return boy.walkTo(confi.setTime.walkToMiddle, 0.5);
		}).then(function(){
			bird.fly()
		}).then(function(){
			boy.stopWalk();
			return BoyToShop(boy);
		}).then(function(){
			girl.setOffset();
			scrollTo(confi.setTime.walkToEnd, 2);
			return boy.walkTo(confi.setTime.walkToEnd, 0.15);
		}).then(function(){
			return boy.walkTo(confi.setTime.walkTobrige, 0.25, (bridgeY - girl.getHeight()) / visualHeight);
		}).then(function(){
			//实际走路的比例
			var proportionX = (girl.getOffset().left - boy.getWidth() + girl.getWidth() / 5) / visualWidth;
			//第三次走到小女孩跟前
			return boy.walkTo(confi.setTime.bridgeWalk, proportionX);
		}).then(function(){
			//图片原地停止
			boy.resetOriginal();
			setTimeout(function(){
				//增加转身动作
				girl.rotate();
				boy.rotate(function(){
					//开始logo动画
					logo.run();
					//开始飘花
					snowflake();
				});	
			}, confi.setTime.waitRotate);
		});
	/**
	 * 小男孩走路
	 * @param {[type]} container [description]
	 */
	function BoyWalk(){
		//取男孩元素
		var $boy = $("#boy");
		//设置小男孩雪碧图的缩放比例
		//var proportion = 0.5;
		//设置元素缩放
		// $boy.css({
		// 	transform: 'scale(' + proportion + ')'
		// });
		var boyWidth = $boy.width();
		var boyHeight = $boy.height();	
		//计算缩放后元素与实际尺寸的一个距离
		// var boyInsideLeft = (boyWidth - (boyWidth*proportion))/2;
		// var boyInsideTop = (boyHeight - (boyHeight*proportion))/2;	
		//修正小男孩的正确位置
		$boy.css({
			top: pathY - boyHeight + 25
			//中间路的垂直距离 - 人物原始的垂直高度 - 人物缩放后的垂直高度
			//top:pathY - (boyHeight*proportion) -boyInsideTop
		});
		
		/* 男孩的动画 */
		//暂停走路
		function pauseWalk(){
			$boy.addClass('pauseWalk');
		}
		// 恢复走路
		function restorWalk(){
			$boy.removeClass('pauseWalk');
		}
		// css3动作变化
		function slowWalk(){
			$boy.addClass('slowWalk');
		}
		// 用transition 做运动
		function stratRun(options, runTime){
			//完成runTime的运动后回调函数
			var dfdPlay = $.Deferred();

			//恢复走路
			restorWalk();
			//运动的属性
			$boy.transition(
				options,
				runTime,
				'linear',
				function(){
					dfdPlay.resolve(); //动画完成
				});
			return dfdPlay;
		}
		// 开始走路
		function walkRun(time, dist, disY){
			time = time || 3000;
			//脚动作
			slowWalk();
			//开始走路
			var d1 = stratRun({
				'left': dist + 'px',
				'top': disY ? disY :undefined
			}, time);
			return d1;
		}
		//走进商店
		function walkToShop(doorObj, runTime){
			var defer = $.Deferred();
			var doorObj = $(".door");
			//门的坐标
			var offsetDoor = doorObj.offset();
			var doorOffsetLeft = offsetDoor.left;
			//小孩当前坐标
			var offsetBoy = $boy.offset();
			var boyOffsetLeft = offsetBoy.left;

			//当前需要移动的坐标
			instanceX = (doorOffsetLeft + doorObj.width() / 2) - (boyOffsetLeft + $boy.width() /2);

			//开始走路
			var walkPlay = stratRun({
				transform: 'translateX(' + instanceX + 'px),scale(0.3,0.3)',
				opacity: 0.1
			}, runTime);
			//走路完成
			walkPlay.done(function(){
				$boy.css({
					opacity: 0
				});
				defer.resolve();
			});
			return defer;
		}
		//走出商店
		function walkOutShop(runTime){
			var defer = $.Deferred();
			restorWalk();
			//开始走路
			var walkPlay = stratRun({
				transform: 'translateX(' + instanceX + 'px), scale(1,1)',
				opacity: 1
			}, runTime);
			//走路完毕
			walkPlay.done(function(){
				defer.resolve();
			});
			return defer;
		}
		// 计算移动距离
		function calculateDist(direction, proportion) {
			//x轴：页面宽度*百分比；y轴：页面高度*百分比
			return (direction == "x" ?	visualWidth : visualHeight) * proportion;
		}

		// 函数返回五个接口
		// walkTo、stopWalk、resetOriginal、toShop、outShop、rotate、getWidth、getDistance、talkFlower
		return {
			//开始走路
			walkTo: function(time, proportionX, proportionY){
				var distX = calculateDist('x', proportionX);
				var distY = calculateDist('y', proportionY);
				return walkRun(time, distX, distY);
			},
			//停止走路
			stopWalk: function(){
				pauseWalk();
			},
			//复位初始状态
			resetOriginal: function(){
				this.stopWalk();
				//恢复图片
				$boy.removeClass('slowWalk slowFlolerWalk').addClass('boyOriginal');
			},
			//走进商店
			toShop: function(){
				return walkToShop.apply(null, arguments);
			},
			//走出商店
			outShop: function(){
			 	return walkOutShop.apply(null, arguments);
			},
			//转身
			rotate: function(callback){
				restorWalk();
				$boy.addClass('boy-rotate');
				//监听转身完毕
				if(callback){
					$boy.on(animationEnd, function(){
						callback();
						$(this).off();
					})
				}
			},
			//取花
			talkFlower: function(){
				$boy.addClass('slowFlolerWalk');
			},
			//获取男孩的宽度
			getWidth: function(){
				return $boy.width();
			},
			//获取男孩的相对位置
			getDistance: function(){
				return $boy.offset().left;
			}
		}
	}
	/* 小男孩进入商店 */
	var BoyToShop = function(boyObj){
		var defer = $.Deferred();
		var $door = $(".door");
		var doorLeft = $(".door-left");
		var doorRight = $(".door-right");
		// 门动画
		function doorAction(left, right, time){			
			var defer = $.Deferred();
			var count = 2;
			//等待开门完成
			var complete = function(){
				if(count == 1){
					defer.resolve(); //动画结束
					return;
				}
				count--;
			};
			doorLeft.transition({
				'left': left
			}, time, complete);
			doorRight.transition({
				'left': right
			}, time, complete);
			return defer;
		}
		//开门
		function openDoor(time){
			return doorAction('-50%', '100%', time);
		}
		//关门
		function shutDoor(time){
			return doorAction('0%', '50%', time);
		}
		//取花
		function talkFlower(){
			//增加延时等待效果
			var defer = $.Deferred();
			boyObj.talkFlower();
			setTimeout(function(){
				defer.resolve();
			}, confi.setTime.wait);
			return defer;
		}
		//灯动画
		var lamp = {
			elem: $(".b_background"),
			bright: function(){
				this.elem.addClass('lamp-bright');
			},
			dark: function(){
				this.elem.removeClass('lamp-bright');
			}
		};
		var waitOpen = openDoor(confi.setTime.openDoorTime);
		waitOpen.then(function(){
			lamp.bright();
			return boyObj.toShop($door, confi.setTime.walkToShop);
		}).then(function(){
			return talkFlower();
		}).then(function(){
			return boyObj.outShop(confi.setTime.walkOutShop);
		}).then(function(){
			shutDoor(confi.setTime.shutDoorTime);
			lamp.dark();
			defer.resolve();
		});
		return defer;
	}

	/* 飘花 */
	function snowflake(){
		//雪花容器
		var $flakeContainer = $("#snowflake");
		//随机六张图
		function getImagesName(){
			return confi.snowflakeURL[[Math.floor(Math.random()*6)]];
		}
		//创建一个雪花元素
		function createSnowBox(){
			var url = getImagesName();
			return $('<div class="snowbox"></div>').css({
				'width':41,
				'height':41,
				'position':'absolute',
				'backgroundSize':'cover',
				'top':'-41px',
				'zIndex':1000000,
				'backgroundImage':'url(' + url +')'
			}).addClass('snowRoll');
		}
		//开始飘雪花
		setInterval(function(){
			//运动的轨迹
			var startPositionLeft = Math.random() * visualWidth -100,
				 startOpacity = 1,
				 endPositionTop = visualHeight - 40,
				 endPositionLeft = startPositionLeft -100 + Math.random() * 500,
				 duration = visualHeight * 10 + Math.random() *5000;
			//随机透明度，不小于0.5
			var randomStart = Math.random();
			randomStart = randomStart < 0.5 ? startOpacity : randomStart;
			//创建一个雪花
			var $flake = createSnowBox();
			//设计起始点的位置
			$flake.css({
				left: startPositionLeft,
				opacity: randomStart
			});
			//加入到容器
			$flakeContainer.append($flake);

			//开始执行动画
			$flake.transition({
				top: endPositionTop,
				left: endPositionLeft,
				opacity: 0.7
			}, duration, 'ease-out', function(){
				$(this).remove();  //结束后删除
			});
		}, 200);
	}
	/* 音乐 */
	function Html5Audio(url, isloop){
		var audio = new Audio(url);
		audio.autoPlay = true;
		audio.loop = isloop || false;
		audio.play();
		return {
			end: function (callback){
				audio.addEventListener('ended', function(){
					callback();
				}, false);
			}
		};
	}
}
$(function(){
	Qixi()
});
/////
//页面滑动//
/////
/**
 * [Swipe description]
 * @param {[type]} container [页面容器节点]
 * @param {[type]} option [参数]
 */
function Swipe(container) {
	//获取第一个子节点
	var element = container.find(":first");
	//滑动对象
	var swipe = {};
	//li页面的数量
	var slides = element.find(">");
	//获取容器尺寸
	var width = container.width();
	var height = container.height();
	//设置li页面的总宽度
	element.css({
		width : (slides.length * width) + 'px',
		height : height + 'px'
	});
	//设置每一个页面li的宽度
	$.each(slides, function(index) {
		var slide = slides.eq(index);//获取到每一个li元素
		slide.css({
			width: width + 'px',
			height: height + 'px'
		});
	});
	//监控完成与移动	
	swipe.scrollTo = function(x, speed){
		//执行动画移动
		element.css({
			'transition-timing-function': 'linear',
			'transition-duration': speed + 'ms',
			'transform': 'translate3d(-' + x + 'px,0px,0px)'
		});
		return this;
	};
	return swipe;
}
