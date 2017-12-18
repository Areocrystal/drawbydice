/**
 * Created by Annab on 2017/12/7.
 */

//if (!Array.prototype.shuffle) {
//    Array.prototype.shuffle = function () {
//        var res = this.slice()
//        for (var j, x, i = res.length;
//             i;
//             j = parseInt(Math.random() * i),
//                 x = res[--i], res[i] = res[j], res[j] = x);
//        return res;
//    }
//}

(function(doc){

    var concatImg = {

        init(){
            var getId = doc.getElementById.bind(doc)
            this.file = getId('uoploadImg')
            this.cas = getId('canvas')
            this.canvas = doc.createElement('canvas')
            this.ctx = this.cas.getContext('2d')
            this.ctx2 = this.canvas.getContext('2d')
            this.img = new Image()
            this.fr = new FileReader()
            this.range = getId('range')
            this.autoCalc = getId('autocalc')
            this.trigger = getId('start')
            this.colour = getId('colour')
            this.path = getId('pathinfo')
            this.selection = getId('selection')
            this.maxUnitPixel = +this.range.value
            this.unitPixelColor = this.colour.value
            this.isAutoCalc = this.autoCalc.checked
            this.selectionValue = this.selection.value
            this.pixelCollection =
                [...'1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+{}|:"<>?-=[]\\;\',./`~']
            this.pixelCollectionLen = this.pixelCollection.length
            this.drawDetail = this.primitiveDrawDetail
            this.bindEvent.call(this)
        },

        bindEvent(){
            doc.addEventListener('change', function (e) {
                switch (e.target) {
                    case this.range:
                        this.maxUnitPixel = +e.target.value
                        break
                    case this.colour:
                        this.unitPixelColor = e.target.value
                        break
                    case this.selection:
                        this.selectionValue = e.target.value
                        this.drawDetail = this.primitiveDrawDetail
                        break
                    case this.autoCalc:
                        this.isAutoCalc = e.target.checked
                        break
                    case this.file:
                        let fe = e.target.files,
                            primitivePath = e.target.value
                        this.path.value = primitivePath.substr(primitivePath.search(/[\\\/][^\\\/]+$/) + 1)
                        if (fe.length > 0 && /image\/\w{3,4}/.test(fe[0].type)) {
                            this.loadFileReader(fe[0]).then((progressEvent) => {
                                return this.loadImage(progressEvent)
                            }).then(() => {
                                this.cw = this.cas.width = this.canvas.width = this.img.width
                                this.ch = this.cas.height = this.canvas.height = this.img.height
                                this.trigger.onclick = () => this.getImgSegments()
                            })
                        }
                        break
                }
            }.bind(this), false)
        },

        loadFileReader(f){
            return new Promise((resolve) => {
                this.fr.readAsDataURL(f)
                this.fr.onload = (progressEvent) => resolve(progressEvent)
            })
        },

        loadImage(progressEvent){
            return new Promise((resolve) => {
                this.img.src = progressEvent.target.result
                this.img.onload = () => resolve()
            })
        },

        getImgSegments(){
            var segmentsX,
                segmentsY
            this.unitImgEdge = this.isAutoCalc ?
            this.minCommonMutiple(this.cw, this.ch) :
            this.maxUnitPixel
            segmentsX = Math.ceil(this.cw / this.unitImgEdge)
            segmentsY = Math.ceil(this.ch / this.unitImgEdge)
            for (let i = 0; i < segmentsX; i++) {
                for (let j = 0; j < segmentsY; j++) {
                    new imgElements(
                        i * this.unitImgEdge,
                        j * this.unitImgEdge
                    )
                }
            }
            this.ctx.drawImage(this.canvas, 0, 0)
        },

        drawUnit(_self){
            var step = _self.grayscale / 25.6 | 0
            this.ctx2.fillStyle = '#000'
            this.ctx2.fillRect(_self._x, _self._y, _self.edge, _self.edge)
            for (let i = dice[step].length - 1; i > -1 ; i--) {
                for (let j = dice[step][i].length - 1; j > -1 ; j--) {
                    dice[step][i][j] === 1 &&
                    this.drawDetail(_self._x, _self._y, _self.r, i, j)
                }
            }
        },

        primitiveDrawDetail(){
            switch(this.selectionValue){
                case '1':
                    this.drawDetail = (x, y, size, I, J) => {
                        this.ctx2.beginPath()
                        this.ctx2.fillStyle = this.unitPixelColor
                        this.ctx2.arc(x + size * (2 * J + 1),
                            y + size * (2 * I + 1), size, 0, 2 * Math.PI)
                        this.ctx2.fill()
                        this.ctx2.closePath()
                    }
                    break
                case '2':
                    this.drawDetail = (x, y, size, I, J) => {
                        this.ctx2.beginPath()
                        this.ctx2.fillStyle = this.unitPixelColor
                        var txt = this.pixelCollection[this.getRnd(this.pixelCollectionLen)]
                        this.ctx2.font = `${size}px consolas`
                        this.ctx2.textBaseline = 'hanging'
                        this.ctx2.fillText(txt,
                            x + 2 * size * J,
                            y + 2 * size * I)
                        this.ctx2.fill()
                        this.ctx2.closePath()
                    }
                    break
                case '3':
                    this.drawDetail = (x, y, size, I ,J) => {
                        this.ctx2.beginPath()
                        this.ctx2.fillStyle = this.unitPixelColor
                        this.ctx2.fillRect(x + size * J, y + size * I, size ,size)
                        this.ctx2.fill()
                        this.ctx2.closePath()
                    }
                    break
            }
        },

        getRnd(n, m) {
            if (arguments.length < 2) {
                m = [n, n = 0][0]
            }
            if (n > m) {
                n = [m, m = n][0]
            }
            return ~~(Math.random() * (m - n)) + n
        },

        minCommonMutiple(a, b){
            if (Math.abs(a) > 1 && Math.abs(b) > 1) {
                var x = Math.min(a, b),
                    y = Math.max(a, b),
                    res = this.maxUnitPixel
                for (let i = x - 1; i > this.maxUnitPixel; i--) {
                    if (x % i == 0 && y % i == 0) {
                        res = i
                    }
                }
                return res > this.maxUnitPixel ? this.maxUnitPixel : res
            }
        },
    }

    class imgElements {
        constructor(x, y) {
            this._x = x
            this._y = y
            this.edge = concatImg.unitImgEdge
            this.r = this.edge / 6
            this.drawElement()
        }

        drawElement() {
            concatImg.ctx2.drawImage(
                concatImg.img,
                this._x, this._y,
                this.edge, this.edge,
                this._x, this._y,
                this.edge, this.edge)
            this.acquireGrayscale()
        }

        acquireGrayscale() {
            var imgData = concatImg.ctx2.getImageData(
                this._x, this._y,
                this.edge, this.edge).data,
                average = 0,
                len = imgData.length,
                count = 0
            for (let i = 0; i < len; i += 4) {
                average +=
                (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3
                count++
            }
            this.grayscale = average / count
            concatImg.drawUnit(this)
        }
    }

    concatImg.init()

})(this.document)
