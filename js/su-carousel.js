;(function (w) {
    w.SU = {}    //命名空间
    // 读写操作的元素属性
    SU.css = function (node, type, val) {
        // console.log(typeof node)
        if (typeof node === 'object' && typeof node['transform'] === 'undefined') {
            node['transform'] = {}
        }
        if (arguments.length >= 3) {
            // 写操作
            let text = ''
            node['transform'][type] = val
            for (let item in node['transform']) {
                if (node['transform'].hasOwnProperty(item)) {   //判断item是node['transform']对象上的属性，而不是其原型链上的属性
                    switch (item) {
                        case 'translateX':
                        case 'translateY':
                            text += `${item}(${node['transform'][item]}px)`;
                            break;
                        case 'scale':
                            text += `${item}(${node['transform'][item]})`;
                            break;
                        case 'rotate':
                            text += `${item}(${node['transform'][item]}deg)`;
                            break;
                    }
                }
            }
            node.style.transform = node.style.webkitTransform = text
        } else if (arguments.length === 2) {
            // 读操作
            //此时第三个val变量没有使用，可以用来当做返回结果
            val = node['transform'][type]
            if (typeof val === 'undefined') {
                switch (type) {
                    case 'translateX':
                    case 'translateY':
                    case 'rotate':
                        val = 0;
                        break;
                    case 'scale':
                        val = 1;
                        break;
                }
            }
            return val
        }
    }
    // 无缝滑屏
    SU.carousel = function (setting) {
        // 设置默认参数
        let defaultSetting = {
            loop: false,
            autoPlay: false
        }
        let arr = setting.data
        if(Object.prototype.toString.call(arr) !== '[object Array]'){
            alert('没有传入数据参数')
            return false;
        }
        let carouselWrap = document.querySelector('.carousel-wrap')
        let pointsWrap = document.querySelector('.carousel-wrap>.points-wrap')
        let paginationPoints = null      // 分页对象数组
        let paginationPointsLength = 0   // 分页长度
        let timer = null    //定时器
        let index = 0      //当前图片的索引
        if (setting.loop) {   //无缝滑屏
            arr = arr.concat(arr)
        }
        if (carouselWrap) {
            // 布局
            // 轮播图动态插入
            let ulNode = document.createElement('ul')
            let styleNode = document.createElement('style')
            ulNode.classList.add('list')
            for (let i = 0; i < arr.length; i++) {
                ulNode.innerHTML += `<li><a href="http://www.baidu.com"><img src="${arr[i]}" alt=""></a></li>`
            }
            styleNode.innerHTML = `
                .carousel-wrap>.list {
                    width: ${arr.length}00%;
                } 
                .carousel-wrap>.list>li{
                    width:${1 / arr.length * 100}%
                }`
            document.head.appendChild(styleNode)
            carouselWrap.appendChild(ulNode)
            let imgNode = document.querySelector('.carousel-wrap>.list>li>a>img')
            // 使用定时器，延缓获取图片的高度，否则都是同步代码，获取不到图片节点，JS执行的速度快于渲染速度
            setTimeout(function () {
                carouselWrap.style.height = imgNode.offsetHeight + 'px'
            }, 100)
            // 分页（小圆点）
            if (pointsWrap) {
                if (setting.loop) {
                    paginationPointsLength = arr.length / 2
                } else {
                    paginationPointsLength = arr.length
                }
                for (let i = 0; i < paginationPointsLength; i++) {
                    if (i === 0) {
                        pointsWrap.innerHTML += `<span class="active"></span>`
                    } else {
                        pointsWrap.innerHTML += `<span></span>`
                    }
                }
                paginationPoints = document.querySelectorAll('.carousel-wrap>.points-wrap>span')
            }
            // 基本滑屏
            // 1. 获取元素一开始的位置
            // 2. 获取手指点击开始时的位置
            // 3. 获取手指滑动中的实时距离
            // 4. 将手指滑动的距离加给元素

            // 启动定时器
            if (setting.autoPlay){
                autoPlay()
            }
            let startX = 0
            let elementX = 0
            carouselWrap.addEventListener('touchstart', function (ev) {
                ev = ev || event
                let touchC = ev.changedTouches[0]
                clearInterval(timer)   //手指点上屏幕的瞬间，清除定时器
                startX = touchC.clientX
                if (setting.loop) {
                    index = SU.css(ulNode, 'translateX') / document.documentElement.clientWidth
                    if (-index === 0) {
                        index = -arr.length / 2
                    } else if (-index === arr.length - 1) {
                        index = -(arr.length / 2 - 1)
                    }
                    SU.css(ulNode, 'translateX', index * document.documentElement.clientWidth)
                }
                elementX = SU.css(ulNode, 'translateX')
                ulNode.style.transition = 'none'

            })
            carouselWrap.addEventListener('touchmove', function (ev) {
                ev = ev || event
                let touchC = ev.changedTouches[0]
                let nowX = touchC.clientX
                let disX = (nowX - startX) * 1.5   //设置一个倍数，使图片滑动的距离比手指滑动的距离长一点
                SU.css(ulNode, 'translateX', elementX + disX)
            })
            carouselWrap.addEventListener('touchend', function () {
                index = SU.css(ulNode, 'translateX') / document.documentElement.clientWidth
                index = Math.round(index)
                // 判断无法超出
                if (index > 0) {
                    index = 0
                } else if (index < 1 - arr.length) {
                    index = 1 - arr.length
                }
                setPagination(index % paginationPointsLength)  //无论是不是无缝，index和分页取余获取的都是当前分页的序号
                ulNode.style.transition = '.5s transform'
                SU.css(ulNode, 'translateX', index * document.documentElement.clientWidth)
                ulNode.style.transform = `translateX(${SU.css(ulNode, 'translateX')}px)`
                if (setting.autoPlay) {      //启动定时器
                    autoPlay()   
                }
            })
            // 小圆点根据图片改变索引(分页)
            function setPagination(index) {
                for (let i = 0; i < paginationPoints.length; i++) {
                    paginationPoints[i].classList.remove('active')
                }
                paginationPoints[-index].classList.add('active')
            }
            //轮播
            function autoPlay() {
                timer = setInterval(function () {
                    clearInterval(autoPlay)
                    if (index === -(arr.length - 1)) {
                        ulNode.style.transition = 'none'
                        if(setting.loop){
                            index = -(arr.length / 2 - 1)
                        }
                        SU.css(ulNode, 'translateX', index * document.documentElement.clientWidth)
                    }
                    setTimeout(function () {
                        ulNode.style.transition = '.5s transform'
                        index--
                        setPagination(index % paginationPointsLength)
                        SU.css(ulNode, 'translateX', index * document.documentElement.clientWidth)
                    }, 50)
                }, 2000)
            }
        }

    }
})(window)