function drag() {
        let topBar = document.querySelector('.nav-bar')
        let ulList = document.querySelector('.nav-bar>.nav-bar-list')
        let translateXMin = topBar.clientWidth - ulList.offsetWidth
        console.log(translateXMin)
        let startX = 0;
        let elementX = 0;
        topBar.addEventListener('touchstart', function (ev) {
            ulList.style.transition = 'none'
            ev = ev || event
            let touchedC = ev.changedTouches[0]
            startX = touchedC.clientX
            elementX = SU.css(ulList, 'translateX')
        })
        topBar.addEventListener('touchmove', function (ev) {
            ev = ev || event
            let touchedC = ev.changedTouches[0]
            let nowX = touchedC.clientX
            disX = nowX - startX
            let translateX = disX + elementX
            let w = topBar.clientWidth
            if(translateX>0){
                let scale = document.documentElement.clientWidth/((document.documentElement.clientWidth+translateX)*2)
                translateX = elementX + disX*scale
            }else if(translateX<translateXMin){
                let over = document.documentElement.clientWidth-(ulList.offsetWidth + translateX)
                let scale = document.documentElement.clientWidth/((document.documentElement.clientWidth+over)*2)
                translateX = elementX + disX*scale
            }
            
            SU.css(ulList, 'translateX',translateX)
        })
        topBar.addEventListener('touchend', function () {
            let translateX = SU.css(ulList, 'translateX')
            ulList.style.transition = 'transform .75s'
            if (translateX > 0) {
                translateX = 0
                SU.css(ulList, 'translateX', translateX)
            }else if(translateX<translateXMin){
                translateX = translateXMin
                SU.css(ulList,'translateX',translateX)
            }
        })
}