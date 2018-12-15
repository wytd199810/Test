/**
 * 小男孩走路
 * @param {[type]} container [description]
 */
function BoyWalk(){
	var container = $("#content");
	//页面可视区域
	var visualWidth = container.width();
	var visualHeight = container.height();
	console.log(visualWidth,visualHeight);
	
	//获取数据
	var getValue = function(className) {
		var $elem = $('' + className + '');
		//走路的线路坐标
		return {
			height: $elem.height(),
			top: $elem.position().top
		};
	};
	//路的Y轴
	var pathY = function() {
		var data = getValue('.a_background_middle');
		return data.top + data.height/2;
	}();
	//取男孩元素
	var $boy = $("#boy");
	var boyHeight = $boy.height();
	//修正小男孩的正确位置
	$boy.css({
		top: pathY - boyHeight + 25
	});

	/////
	// 动画处理  //
	/////

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
		console.log(dist, disY);
		return d1;
	}

	// 计算移动距离
	function calculateDist(direction, proportion) {
		//x轴：页面宽度*百分比；y轴：页面高度*百分比
		return (direction == "x" ?
			visualWidth: visualHeight) * proportion;
	}

	// 函数返回三个接口
	// walkTo、stopWalk、setColoer
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
		//改变图片的背景颜色作为完成走路的标志
		setColoer: function(value){
			$boy.css('background-color', value);
		}
	}
}