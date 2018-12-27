window.onload = function () {
    // 阻止默认事件
    document.addEventListener('touchstart', function (ev) {
        ev = ev || event
        ev.preventDefault()
    }, { passive: false })
    // rem适配
    let styleNode = document.createElement('style')
    let w = document.documentElement.clientWidth / 16
    styleNode.innerHTML = `html{font-size:${w}px !important}`
    document.head.appendChild(styleNode)

    // 使内容区能够纵向滑动
    let contentWrap = document.querySelector('.content')
    contentWrap.addEventListener('touchstart', function (ev) {
        ev.stopPropagation()
        // ev.preventDefault()
    })
    //导航
    SU.dragNav()
    // 导航的点击
    dragNavClick()
    function dragNavClick() {
        let dragNav = document.querySelector('.su-nav-bar')
        let liNodes = dragNav.querySelectorAll('li')
        let isMove = false
        dragNav.addEventListener('touchstart', function () {
            isMove = false
        })
        dragNav.addEventListener('touchmove', function () {
            isMove = true
        })
        dragNav.addEventListener('touchend', function (ev) {
            if (isMove) {
                return
            }
            ev = ev || event
            let target = ev.target
            for (let i = 0; i < liNodes.length; i++) {
                liNodes[i].classList.remove('active')
            }
            if (target.nodeName.toUpperCase() === 'A') {
                target.parentNode.classList.add('active')
            } else if (target.nodeName.toUpperCase() === 'LI') {
                target.classList.add('active')
            }
        })
    }

    // tab选项卡的切换
    tabToggle()
    function tabToggle() {
        let tabWrap = document.querySelector('#wrap .content .mvbox')
        let tabContentList = document.querySelectorAll('#wrap .content .mvbox .mvbox-content')
        let w = tabWrap.offsetWidth
        console.log(tabContentList)
        for (let i = 0; i < tabContentList.length; i++) {
            move(tabContentList[i])
        }

        function move(tab) {
            SU.css(tab, 'translateX', -w)
            let startPoint = { x: 0, y: 0 }
            let elementPoint = { x: 0, y: 0 }
            let nowPoint = {}   //move过程中的实时点坐标
            let dis = {}        //move过程中的与起始坐标实时距离
            let isX = true
            let isFirst = true
            let isOver = false
            let loadingTabs = tab.querySelectorAll('.mvbox-loading')
            tab.addEventListener('touchstart', function (ev) {
                if (isOver) {
                    return
                }
                ev = ev || event
                tab.style.transition = 'none'
                let touchC = ev.changedTouches[0]
                startPoint.x = touchC.clientX
                startPoint.y = touchC.clientY
                elementPoint.x = SU.css(tab, 'translateX')
                elementPoint.y = SU.css(tab, 'translateY')
                isX = true
                isFirst = true
            })
            tab.addEventListener('touchmove', function (ev) {
                if (isOver) {
                    return
                }
                if (!isX) {
                    return
                }
                ev = ev || event
                let touchC = ev.changedTouches[0]
                nowPoint.x = touchC.clientX
                nowPoint.y = touchC.clientY
                dis.x = nowPoint.x - startPoint.x
                dis.y = nowPoint.y - startPoint.y

                if (isFirst) {
                    isFirst = false
                    if (Math.abs(dis.x) < Math.abs(dis.y)) {
                        isX = false
                        return
                    }
                }
                let translateX = dis.x + elementPoint.x
                SU.css(tab, 'translateX', translateX)
                if (Math.abs(dis.x) > w / 2) {
                    jump(dis.x)
                }


            })
            tab.addEventListener('touchend', function (ev) {
                if (isOver) {
                    return
                }
                ev = ev || event
                let touchC = ev.changedTouches[0]
                leavePoint = {}
                leavePoint.x = touchC.clientX
                disX = leavePoint.x - startPoint.x
                if (Math.abs(disX) < w / 2) {
                    tab.style.transition = '1s transform'
                    SU.css(tab, 'translateX', -w)
                }


            })

            function jump(disX) {
                if (isOver) {
                    return
                }
                console.log('jump')
                if (Math.abs(disX) > w / 2) {
                    tab.style.transition = '1s transform'
                    let translateX = disX > 0 ? 0 : (-2 * w)
                    SU.css(tab, 'translateX', translateX)
                    isOver = true
                    tab.addEventListener('transitionend', endFn)
                    tab.addEventListener('webkitTransitionEnd', endFn)

                    function endFn() {
                        tab.removeEventListener('transitionend', endFn)
                        tab.removeEventListener('webkitTransitionEnd', endFn)
                        tab.style.transition = 'none'
                        for (let i = 0; i < loadingTabs.length; i++) {
                            loadingTabs[i].style.opacity = 1
                        }
                        setTimeout(function () {
                            for (var i = 0; i < loadingTabs.length; i++) {
                                loadingTabs[i].style.opacity = 0;
                            }
                            SU.css(tab, 'translateX', -w)
                            isOver = false
                        }, 2000)
                    }

                }
            }
        }
    }
    // 轮播
    let arr = ['./images/01.jpg', './images/02.jpg', './images/03.jpg', './images/04.jpg', './images/05.jpg', './images/06.jpg', './images/07.jpg', './images/08.jpg', './images/09.jpg', './images/10.jpg',]
    let setting = {
        data: arr,
        loop: true,
        autoPlay: true
    }
    SU.carousel(setting)
}