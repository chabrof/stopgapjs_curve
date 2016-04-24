define([], function () {
	"use strict"

	var StopGapJs_Curve = function() {
		this._originPoint = { x: null, y: null, z: 0 }
		this._originControlPoint = { x: null, y: null, z: 0 }
		this._destinPoint = { x: null, y: null, z: 0 }
		this._destinControlPoint = { x: null, y: null, z: 0 }
		this._originSpeedVector = { x: null, y: null, z: 0 }
		this._destinSpeedVector = { x: null, y: null, z: 0 }

		this._virtualEndPoint = { x: null, y: null, z: 0 }
		this._correctionUnitVector = { x: null, y: null, z: 0 }
		this._diffVector = { x: null, y: null, z: 0 }
		this._nbPoints = null
		this._curveLength = null
	}

	StopGapJs_Curve.prototype.setOrigPoint = function(x, y, z) {
		this._originPoint.x = x
		this._originPoint.y = y
		this._originPoint.z = (z !== undefined ? z : 0)
	}

	StopGapJs_Curve.prototype.setOrigControlPoint = function(x, y, z) {
		this._originControlPoint.x = x
		this._originControlPoint.y = y
		this._originControlPoint.z = (z !== undefined ? z : 0)
	}

	StopGapJs_Curve.prototype.setDestinPoint = function(x, y, z) {
		this._destinPoint.x = x
		this._destinPoint.y = y
		this._destinPoint.z = (z !== undefined ? z : 0)
	}

	StopGapJs_Curve.prototype.setDestinControlPoint = function(x, y, z) {
		this._destinControlPoint.x = x
		this._destinControlPoint.y = y
		this._destinControlPoint.z = (z !== undefined ? z : 0)
	}

	StopGapJs_Curve.prototype.setDefinition = function(value) {
		// pre
		console.assert(value > 0);

		this._definition = value
		this.setCurvLength(this._curveLength)
	}

	StopGapJs_Curve.prototype.setCurvLength = function(value) {
		this._curveLength = value
		if (this._definition !== null) {
			this._nbPoints = value * this._definition
    }
	}

	StopGapJs_Curve.prototype.vectorMinus = function(v1, v2) {
		return {
			x: v1.x - v2.x,
			y: v1.y - v2.y,
			z: v1.z - v2.z
		}
	}

	StopGapJs_Curve.prototype.vectorPlus = function(v1, v2) {
		return {
			x: v1.x + v2.x,
			y: v1.y + v2.y,
			z: v1.z + v2.z
		}
	}

	StopGapJs_Curve.prototype.vectorDivide = function(v1, divider) {
		return {
			x: v1.x / divider,
			y: v1.y / divider,
			z: v1.z / divider
		}
	}

	StopGapJs_Curve.prototype.vectorMultiply = function(v1, factor) {
		return {
			x: v1.x * factor,
			y: v1.y * factor,
			z: v1.z * factor
		}
	}

	StopGapJs_Curve.prototype._setDiffVector = function() {
		// pre
		console.assert(this._definition > 0)
		console.assert(this._originPoint.x !== null)
		console.assert(this._destinPoint.x !== null)
		console.assert(this._originControlPoint.x !== null)
		console.assert(this._destinControlPoint.x !== null)

		this._originSpeedVector = this.vectorDivide(this.vectorMinus(this._originControlPoint, this._originPoint), this._definition)
		this._destinSpeedVector = this.vectorDivide(this.vectorMinus(this._destinControlPoint, this._destinPoint), this._definition)

		this._diffVector = this.vectorMinus(this._destinSpeedVector, this._originSpeedVector)
	}

	StopGapJs_Curve.prototype._setVirtualEndPoint = function() {
		this._virtualEndPoint = {
			x : this._originPoint.x + this._nbPoints * this._originSpeedVector.x + this._nbPoints * (this._diffVector.x / 2),
			y : this._originPoint.y + this._nbPoints * this._originSpeedVector.y + this._nbPoints * (this._diffVector.y / 2),
			z : this._originPoint.z + this._nbPoints * this._originSpeedVector.z + this._nbPoints * (this._diffVector.z / 2)
		}
	}

	StopGapJs_Curve.prototype._setUnitCorrectionVector = function() {
		// pre
		console.assert(this._nbPoints > 1)

		this._setVirtualEndPoint()
		var correctionVector = this.vectorMinus(this._destinPoint, this._virtualEndPoint)
		var factor = 4 / ((this._nbPoints - 1) * (this._nbPoints - 1))

		this._correctionUnitVector = this.vectorMultiply(correctionVector, factor)

		// post
		console.assert(factor > 0)
		console.assert(this._correctionUnitVector.x !== null)
	}

	StopGapJs_Curve.prototype.getUnitCorrectionVector = function() { return this._correctionUnitVector }
	StopGapJs_Curve.prototype.getVirtualEndPoint = function() { return this._virtualEndPoint }
	StopGapJs_Curve.prototype.getNbPoints = function() { return this._nbPoints }
	StopGapJs_Curve.prototype.getDiffVector = function() { return this._diffVector }
	StopGapJs_Curve.prototype.getOriginSpeedVector = function() { return this._originSpeedVector }
	StopGapJs_Curve.prototype.getDestinSpeedVector = function() { return this._destinSpeedVector }

	StopGapJs_Curve.prototype.init = function() {
		this._setDiffVector()
		this._setUnitCorrectionVector()
	}

	StopGapJs_Curve.prototype.render = function(cbk) {
		var currentPoint = {
			x : this._originPoint.x,
			y : this._originPoint.y,
			z : this._originPoint.z
		}

		for (var ct = 0; ct < this._nbPoints; ct++) {
			currentPoint.x += (this._originSpeedVector.x + ((this._diffVector.x) * ct / (this._nbPoints - 1) ))
			currentPoint.y += (this._originSpeedVector.y + ((this._diffVector.y) * ct / (this._nbPoints - 1) ))

			if (ct <= (this._nbPoints - 1) / 2) {
				currentPoint.x += (this._correctionUnitVector.x * ct)
				currentPoint.y += (this._correctionUnitVector.y * ct)
			}
			else {
				currentPoint.x += this._correctionUnitVector.x * (((this._nbPoints - 1) - ct) )
				currentPoint.y += this._correctionUnitVector.y * (((this._nbPoints - 1) - ct) )
			}
			cbk(currentPoint)
		}
	}

	return StopGapJs_Curve
})
