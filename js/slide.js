'use strict'

const slidewrapper = document.querySelector('[data-slide="wrapper"]')
const slideList = document.querySelector('[data-slide="list"]')
const previousButton = document.querySelector('[data-slide="nav-previous"]')
const nextButton = document.querySelector('[data-slide="nav-next"]')
const controlWrapper = document.querySelector('[data-slide="controls"]')
let slideItens = document.querySelectorAll('[data-slide="itens"]')
let controlButtons 
let slideInterval

const state = {
    startingPoint : 0,
    savedPosition : 0,
    currentPoint : 0,
    movement : 0,
    currentSlideIndex : 0,
    autoPlay: true,
    timeInterval: 0
}

function translateSlide({ position }){
    state.savedPosition = position
    slideList.style.transform = `translateX(${position}px)`
}

function getCenter({ index }){
    const slideItem = slideItens[index]
    const slideWidth = slideItem.clientWidth
    const windowWidth = document.body.clientWidth
    const margin = (windowWidth - slideWidth) / 2 
    const position = margin - (index * slideWidth)
    return position
}

function setVisibleSlide({ index , animate}) {
    if (index === 0 || index === slideItens.length -1) {
        index = state.currentSlideIndex
    }
    const position = getCenter({ index })
    state.currentSlideIndex = index
    slideList.style.transition = animate === true ? 'transform 0.7s' : 'none'
    activeControlButton({ index })
    translateSlide({ position: position})
}

function nextSlide(){
    setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true })
}

function previousSlide(){
    setVisibleSlide({ index: state.currentSlideIndex - 1, animate: true})
}

function createControlButton(){
    slideItens.forEach(function(){
        const controlButton = document.createElement('slidebutton')
        controlButton.classList.add('control-button')
        controlButton.classList.add('fas')
        controlButton.classList.add('fa-circle')
        controlButton.dataset.slide = 'button'
        controlWrapper.append(controlButton)
        
        
    })
}

function activeControlButton({ index }){
    const slideItem = slideItens[index]
    const dataIndex = Number(slideItem.dataset.index)
    const controlButton = controlButtons[dataIndex]
    controlButtons.forEach(controlButtonItem => {
        controlButtonItem.classList.remove('active')
    })
    if(controlButton) controlButton.classList.add('active')
    
}

function createSlideClone(){
    const firstSlide = slideItens[0].cloneNode(true)
    firstSlide.classList.add('slide-cloned')
    firstSlide.dataset.index = slideItens.length

    const secondSlide = slideItens[1].cloneNode(true)
    secondSlide.classList.add('slide-cloned')
    secondSlide.dataset.index = slideItens.length +1

    const lastSlide = slideItens[slideItens.length -1].cloneNode(true)
    lastSlide.classList.add('slide-cloned')
    lastSlide.dataset.index = -1

    const penulSlide = slideItens[slideItens.length -2].cloneNode(true)
    penulSlide.classList.add('slide-cloned')
    penulSlide.dataset.index = -2

    slideList.append(firstSlide)
    slideList.append(secondSlide)
    slideList.prepend(lastSlide)
    slideList.prepend(penulSlide)

   slideItens = document.querySelectorAll('[data-slide="itens"]')
}
    
function onMouseDown(event, index) {
    const slideItem = event.currentTarget
    state.startingPoint = event.clientX
    state.currentPoint = state.startingPoint - state.savedPosition
    slideItem.addEventListener('mousemove', onMouseMove)
    state.currentSlideIndex = index
    slideList.style.transition = 'none'
}

function onMouseMove(event) {
    state.movement = event.clientX - state.startingPoint
    const position = event.clientX - state.currentPoint
    translateSlide({ position })
}

function onMouseUp(event) {
    const pointsToMove = event.type.includes('touch') ? 50 : 150
    const slideItem = event.currentTarget
    if(state.movement < -pointsToMove){
        nextSlide()
    }else if (state.movement > pointsToMove){
        previousSlide()
    }else{
        setVisibleSlide({ index: state.currentSlideIndex, animate: true})
    }

    slideItem.removeEventListener('mousemove', onMouseMove)
   
}

function onTouchStart(event, index){
    event.clientX = event.touches[0].clientX
    onMouseDown(event, index)
    const slideItem = event.currentTarget
    slideItem.addEventListener('touchmove', onTouchMove)
    
}
function onTouchMove(event){
    event.clientX = event.touches[0].clientX
    onMouseMove(event)
}
function onTouchEnd(event){
    const slideItem = event.currentTarget
    slideItem.removeEventListener('touchmove', onTouchMove)
}

function onButtonClick(index){
    setVisibleSlide({ index: index +2, animate: true })
}

function onTransionend(){
    const slideItem = slideItens[state.currentSlideIndex]
    if(slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) > 0) {
        setVisibleSlide({ index: 2, animate: false })
    }
    if(slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) < 0) {
        setVisibleSlide({ index: slideItens.length -3, animate: false })
    } 

}

function setAutoPlay(){
    if (state.autoPlay){
        slideInterval = setInterval(function() {
            setVisibleSlide({index:state.currentSlideIndex +1, animate: true})
        }, state.timeInterval)
    }
}

function setListeners(){
    controlButtons = document.querySelectorAll('[data-slide="button"]')
    controlButtons.forEach(function(controlButton, index){
        controlButton.addEventListener('click', function(event){
            onButtonClick(index)
        })
    })

    slideItens.forEach(function(slideItem, index) {
        slideItem.addEventListener('dragstart', function(event) {
            event.preventDefault()
        })  
       slideItem.addEventListener('mousedown', function(event) {
            onMouseDown(event, index)
        })
       slideItem.addEventListener('mouseup', onMouseUp)
       slideItem.addEventListener('touchstart', function(event) {
            onTouchStart(event, index)
        })
       slideItem.addEventListener('touchend', onTouchEnd)
    
    })
    
    nextButton.addEventListener('click', nextSlide)
    previousButton.addEventListener('click', previousSlide)
    slideList.addEventListener('transitionend', onTransionend)
    slidewrapper.addEventListener('mouseenter', function() {
        clearInterval(slideInterval)
    })
    slidewrapper.addEventListener('mouseleave', function(){
        setAutoPlay()
    })
    let resizeTimeOut
    window.addEventListener('resize', function(){
        clearTimeout(resizeTimeOut)
        resizeTimeOut = setTimeout(function(){
            setVisibleSlide({index: state.currentSlideIndex, animate:true})
        }), 1000
    })
}

function initSlider({startIndex= 0, autoPlay= true, timeInterval= 3000}) {
    state.autoPlay = autoPlay
    state.timeInterval = timeInterval
    createControlButton()
    createSlideClone()
    setListeners()
    setVisibleSlide({ index: startIndex + 2, animate: true})
    setAutoPlay()
}