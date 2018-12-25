!(function (w) {
    // 将函数绑给window的cl属性上
    w.cl = {};
    w.cl.css = function(node,type,val) {
      // 判断节点transform对象是否存在，不存在则添加
      if (typeof node === "object" && typeof node["transform"] == "undefined") {
        node["transform"] = {};
      }
      if(arguments.length >= 3){// 写操作
        //设置
        var text = "";
        // 加入两次传入同样属性的变换，则会被覆盖
        // 只会更改改变的值，之前没有改变的值则不会改变
        node["transform"][type] = val;
        // in操作符，会查找对象实例本身及原型链上所有的属性，可能会对后续操作产生影响
        for (item in node["transform"]) {
          if(node["transform"].hasOwnProperty(item)){
            switch (item){
              case "translateX":
              case "translateY":
                text += item + "(" + node["transform"][item] + "px)";
                break;
              case "scale":
                text += item + "(" + node["transform"][item] + ")";
                break;
              case "roate":
                text += item + "(" + node["transform"][item] + "deg)";
                break;
            }
          }
        }
        // 兼容性问题
        node.style.transform = node.style.webkitTransform = text;
      }else if(arguments.length == 2){
        // 读操作
        // 此时只传入了2个参数，第3个参数并没有用上，所以可以利用未使用的第3个参数返回结果
        val = node["transform"][type];
        if (typeof val === 'undefined'){
          switch (type){
            case "translateX":
            case "translateY":
            case "rotate":
              val = 0;
              break;
            case "scale":
              val = 1;
              break;
          }
        }
        return val;
      }
    }
    w.cl.carousel = function (arr) {
      // 布局
      var carouselWrap = document.querySelector(".carousel-wrap");
      if(carouselWrap){
        var pointsLength = arr.length;
   
        // 无缝
        var needCarousel = carouselWrap.getAttribute('needCarousel');
        needCarousel = needCarousel == null? false:true;
        //console.log(needCarousel);
        if(needCarousel){
          arr = arr.concat(arr);
        }
        var ulNode = document.createElement('ul');
        var styleNode = document.createElement('style')
        ulNode.classList.add('list');
        for(var i=0;i<arr.length;i++){
          ulNode.innerHTML += "<li><a href='javascript:;'><img src="+ arr[i] + " alt='picture'></a></li>"
        }
        styleNode.innerHTML = ".carousel-wrap > .list{width:"+ (arr.length*100) +"%;}.carousel-wrap > .list > li{width:"+ (1/arr.length*100) +"%;}"
        carouselWrap.appendChild(ulNode);
        document.head.appendChild(styleNode);
        var imgNode = document.querySelector('.carousel-wrap > .list > li > a > img')
        // 如果不设置定时器，可能获取到img时，还没有渲染完，此时无法获取其高度
        setTimeout(function () {
          carouselWrap.style.height = imgNode.offsetHeight + 'px';
        },100)
        var pointsWrap = document.querySelector('.carousel-wrap > .points-wrap');
        if(pointsWrap) {
          for (var i = 0; i < pointsLength; i++) {
            if(i == 0){
              pointsWrap.innerHTML += "<span class='active'></span>";
            } else {
              pointsWrap.innerHTML += "<span></span>";
            }
   
          }
          var pointsSpan = document.querySelectorAll('.carousel-wrap > .points-wrap > span');
        }
   
        // 滑屏
        /*
        * 1 拿到元素一开始的位置
        * 2 拿到手指一开始点击的位置
        * 3 拿到手指move的实时距离
        * 4 将手指移动的距离加给元素
        */
        var index = 0;
        // 手指的位置
        var startX = 0;
        // 元素的位置
        var elementX = 0;
        // 保存实时偏移量
        //var translateX = 0;
        carouselWrap.addEventListener('touchstart',function (ev) {
          ev = ev || event;
          // changedTouches是列表，取一个就够了
          var touchC = ev.changedTouches[0];
          ulNode.style.transition = 'none';
          // 无缝逻辑，点击第一组的第一张是瞬间跳到第二组的第一张
          //点击第二组的最后一张时，瞬间跳到第一组的最后一张
          // index代表ul的位置
          // 无缝
          if(needCarousel){
            var index = cl.css(ulNode,"translateX")/document.documentElement.clientWidth;
            if(-index === 0){
              index = -pointsLength;
            } else if (-index === arr.length-1) {
              index = -pointsLength + 1;
            }
            cl.css(ulNode,"translateX",index*document.documentElement.clientWidth);
          }
          startX = touchC.clientX;
          //elementX = ulNode.offsetLeft;
          //elementX = translateX;
          elementX = cl.css(ulNode,"translateX")
   
          // 停止自动轮播
          clearInterval(timer)
        })
        carouselWrap.addEventListener('touchmove',function (ev) {
          ev = ev || event;
          var touchC = ev.changedTouches[0]
          // 获取滑动时手指的位置
          var nowX = touchC.clientX;
          // 手指移动的距离
          var disX = nowX - startX;
          //translateX = elementX + disX
          //ulNode.style.left = elementX + disX + 'px';
          cl.css(ulNode,"translateX",elementX+disX);
        })
        carouselWrap.addEventListener('touchend',function (ev) {
          ev = ev || event;
          //var index = ulNode.offsetLeft/document.documentElement.clientWidth;
          //var index = translateX/document.documentElement.clientWidth;
          index = cl.css(ulNode,"translateX")/document.documentElement.clientWidth;
          index = Math.round(index)
          if(index > 0){
            index = 0
          } else if (index < -arr.length+1) {
            index = -arr.length+1
          }
          syncPoints(index)
          ulNode.style.transition = '.5s left';
          //ulNode.style.left = index * (document.documentElement.clientWidth) + 'px'
          // translate造成的元素偏移并不会同步到offsetLeft上，因为两者不在同个一个图层
          //translateX = index * (document.documentElement.clientWidth)
          //ulNode.style.transform = "translateX("+ translateX + "px)" ;
          cl.css(ulNode,"translateX",index * (document.documentElement.clientWidth));
          // 开启自动轮播
          if(needAuto){
            auto();
          }
        })
   
        // 自动轮播
        var timer = 0;
        var needAuto = carouselWrap.getAttribute('needAuto')
        needAuto = needAuto == null ? false:true;
        //console.log(needAuto);
        if(needAuto){
          auto();
        }
        function auto() {
          clearInterval(timer)
          timer = setInterval(function () {
            if(index === -arr.length+1){
              ulNode.style.transition = "none";
              index = -arr.length/2+1;
              cl.css(ulNode,"translateX",index*document.documentElement.clientWidth)
            }
            setTimeout(function () {
              index--;
              ulNode.style.transition = "1s transform"
              syncPoints(index)
              cl.css(ulNode,"translateX",index*document.documentElement.clientWidth)
            },50)
   
          },2000)
        }
   
        // 同步小圆点的函数
        function syncPoints(index) {
          if(!pointsWrap){
            return;
          }
          // 同步小圆点
          for (var i = 0; i < pointsSpan.length; i++) {
            pointsSpan[i].classList.remove('active');
          }
          pointsSpan[-index%pointsLength].classList.add('active');
        }
      }
    }
  })(window)
  