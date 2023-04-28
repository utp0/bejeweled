let canv = document.getElementById("canvas1")
let ctx = canv.getContext("2d")

let canvW = canv.getBoundingClientRect().width
let canvH = canv.getBoundingClientRect().height
let canvX = canv.getBoundingClientRect().x
let canvY = canv.getBoundingClientRect().y

canv.addEventListener("click", canvClickHandler)

function canvClickHandler(e) {

}

