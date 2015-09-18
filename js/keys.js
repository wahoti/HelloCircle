var up = false
var left = false
var right = false
var down = false
var s = false
var a = false

var keydown = function(c){
	var key = c.keyCode
	switch(key){
		case 38://up
			up = true
			break		
		case 37://left
			left = true
			break
		case 39://right
			right = true
			break
		case 40://down
			down = true
			break
		case 83://s
			s = true
			break
		case 65://a
			a = true
			break
		case 32://space
			socket.emit('action')
			break		
		default:
	}
}

var keyup = function(c){
	var key = c.keyCode
	switch(key){
		case 38://up
			up = false
			break			
		case 37://left
			left = false
			break
		case 39://right
			right = false
			break	
		case 40://down
			down = false
			break
		case 83://s
			s = false
			break
		case 65://a
			a = false
			break
		default:
	}
}

