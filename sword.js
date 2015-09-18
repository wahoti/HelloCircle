//ABDULWAHED WAHEDI


{//variables
var victor = require('victor')
var app  = require("express")()
var http = require('http').Server(app)
var io   = require('socket.io')(http)

var people = {}
var circles = {}
var draw = {}
var count = 0
var reverse = new victor(-1,-1)	
var width = 2000
var height = 2000		
	
//init	
space_dust()	
	
app.set('port', process.env.PORT || 3000)
app.get('/', function(req, res){ res.sendFile(__dirname + '/sword.html') })
app.get('/style.css', function(req, res){ res.sendFile(__dirname + '/style.css') })
app.get('/js/socket-io.js', function(req, res){ res.sendFile(__dirname + '/js/socket-io.js') })
app.get('/js/keys.js', function(req, res){ res.sendFile(__dirname + '/js/keys.js') })

http.listen(app.get('port'), function(){ console.log('listening on ' + app.get('port') + '...') })
}

{//functions
	function teleport(circle){
		do{
			var randx = Math.round(Math.random()*(width-20)) + 10
			var randy = Math.round(Math.random()*(height-20)) + 10
			circle._v.x = randx
			circle._v.y = randy
		}while(circle_colliding(circle))
		circle.v.x = randx
		circle.v.y = randy				
	}
	
	function space_dust(){
		var dust_count = 0
		while(dust_count < 100){
			dust_count++
			draw['spacedust-' + dust_count] = {}
			switch(Math.round(Math.random()*(5-20)) + 10){
				case 1:
					draw['spacedust-' + dust_count].color = "#FFFF00"
					break
				case 2:
					draw['spacedust-' + dust_count].color = "#00FFFF"
					break
				case 3:
					draw['spacedust-' + dust_count].color = "#FF0066"
					break
				case 4:
					draw['spacedust-' + dust_count].color = "#FF9933"
					break
				case 5:
					draw['spacedust-' + dust_count].color = "#66FF33"
					break
				default:
					draw['spacedust-' + dust_count].color = "#808080"
					
			}
			switch(Math.round(Math.random()*(5-20)) + 10){
				case 1:
					draw['spacedust-' + dust_count].size = 1
					break
				case 2:
					draw['spacedust-' + dust_count].size = 3
					break
				case 3:
					draw['spacedust-' + dust_count].size = 4
					break
				default:
					draw['spacedust-' + dust_count].size = 2
					
			}			
			draw['spacedust-' + dust_count].x = Math.round(Math.random()*(width-20)) + 10
			draw['spacedust-' + dust_count].y = Math.round(Math.random()*(height-20)) + 10		
			
		}
	}
	
	function circle_colliding(circle){
		//returns true if circle would be colliding with another circle or wall		
		if( (circle._v.x < (circle.size)) || 
			(circle._v.x > (width - circle.size)) ||
			(circle._v.y < (circle.size)) ||
			(circle._v.y > (height - circle.size)) )
			{
				if(circle.destroy_on_wall){ circle.end() }
				if(!circle.issword){ return true }
			}
			
		for(var x in circles){
			if(circles[x] == circle){ continue }
			var a = Math.pow(circles[x]._v.x - circle._v.x, 2)
			var b = Math.pow(circles[x]._v.y - circle._v.y, 2)
			var c = Math.sqrt(a + b)
			if(c < (circle.size + circles[x].size)){
				circle.collide(circles[x])
				return true
			}
		}
		
		for(var x in people){
			if(people[x] == circle){ continue }
			var a = Math.pow(people[x]._v.x - circle._v.x, 2)
			var b = Math.pow(people[x]._v.y - circle._v.y, 2)
			var c = Math.sqrt(a + b)
			if(c < (circle.size + people[x].size)){
				circle.collide(people[x])
				return true
			}
		}		
		
		return false
	}
	
	function respawn_person(person){
		if (typeof draw[person.id] == 'undefined') { return }
		if(person.isdead == 'false'){ return }
		teleport(person)
		person.health = 10
		person.energy = 10
		person.isdead = false
		// delete draw[person.id + '-tombstone']
	}
	
	function gameover(person){
		person.isdead = true	
		
		var name = person.id + '-tombstone'
		// draw[name] = {}
		// draw[name].size = person.size
		// draw[name].x = person.v.x
		// draw[name].y = person.v.y
		// draw[name].color = "#AAAAAA"
		
		person.v.x = -1000
		person.v.y = -1000
		for(var s in person.sword.sections){
			person.sword.sections[s].v.x = -2000
			person.sword.sections[s].v.y = -2000
		}
		
		
		setTimeout(function(){ respawn_person(person) },10000)	
	}
	
	var update_interval = setInterval(function(){
		for(var x in circles){ circles[x].step() }
		for(var x in people){ people[x].step() }
	}, 8)
	var draw_interval = setInterval(function(){	
		io.sockets.emit('draw', draw) 
	}, 16)
	var energy_interval = setInterval(function(){
		for(var x in people){
			if(people[x].energy < 10){
				people[x].energy++ }
			} 
	}, 1000)
}

io.on('connection', function(client){
	people[client.id] = {}
	var P = people[client.id]
	P.id = client.id
	P.isperson = true
	
	P.health = 10
	P.energy = 10
	P.speed = 10
	P.rspeed = .1
	P.size   = 20
	
	P.up = false
	P.left = false
	P.right = false
	P.down = false
	P.a = false
	P.s = false
	
	P.collide = function(circle){
	}
	
	P.direction = new victor(.71,.71)
	P.calc = new victor(0,0)
	P.v = new victor(0,0)
	P._v = new victor(0,0)
	
	draw[client.id] = {}
	draw[client.id].size = P.size
	draw[client.id].color = "#FFFFFF"

	teleport(P)	
	
	client.emit("init", client.id)
	
	P.sword = {}
	P.sword.id = P.id + '-sword'
	P.sword.sections = []
	for(var z = 0; z < 4; z++){
		var n = {}
		n.id = P.sword.id + z.toString()
		n.size = 10
		n.v = new victor(-1000, -1000)
		n._v = new victor(-1000, -1000)
		n.issword = true
		
		n.collide = function(circle){
			if(circle.isperson){ gameover(circle) }
		}
		
		n.step = function(){
			//console.log(this.v)
		}
		
		var m = {}
		m.id = n.id
		m.size = n.size
		m.color = "#FFFFFF"
		m.x = 0
		m.y = 0
		
		draw[n.id] = m
		circles[n.id] = n
		P.sword.sections.push(n)
	}
	
	P.step = function(){
		//console.log(this.v.x + ' ' + this.v.y)
		//update draw
		draw[this.id].x = this.v.x
		draw[this.id].y = this.v.y
		for(var s in this.sword.sections){
			draw[this.sword.sections[s].id].x = this.sword.sections[s].v.x
			draw[this.sword.sections[s].id].y = this.sword.sections[s].v.y	
		}
		
		//store current location
		this._v.x = this.v.x	
		this._v.y = this.v.y						
		
		//direction
		if(this.a){ this.direction.rotate(this.rspeed) }
		if(this.s){ this.direction.rotate(-this.rspeed) }
		
		//player movement
		if(this.up){         this._v.y -= this.speed }
		else if(this.down){  this._v.y += this.speed }
		if(this.left){       this._v.x -= this.speed }
		else if(this.right){ this._v.x += this.speed }
		
		//sword movement
		scount = 1
		distance = 50
		for(var s in this.sword.sections){
			this.sword.sections[s]._v.x = (this._v.x + (this.direction.x * scount * distance))
			this.sword.sections[s]._v.y = (this._v.y + (this.direction.y * scount * distance))
			scount ++
		}
		
		//collision
		collision = false
		if(circle_colliding(this)){ collision = true }
		for(var s in this.sword.sections){
			if(circle_colliding(this.sword.sections[s])){ collision = true }
		}
		
		//update
		if(!collision){
			this.v.x = this._v.x
			this.v.y = this._v.y
			for(var s in this.sword.sections){
				//console.log(this.sword.sections[s].v.x)
				this.sword.sections[s].v.x = this.sword.sections[s]._v.x
				this.sword.sections[s].v.y = this.sword.sections[s]._v.y
			}
		}	
		
		return
	}

	P.disconnect = function(){
		console.log('disconnecting')
		hold = this
		delete people[this.id]
		for(var s in hold.sections){
			delete draw[sections[s].id]
		}
		delete draw[hold.id]
		delete this
	}
	
	//socket events
	console.log('connected (' + P.v.x + ', ' + P.v.y + ')')		
	
	client.on('disconnect', function(){
		people[client.id].disconnect()
	})
	
	client.on('keys', function(up, left, right, down, a, s){
		if(people[client.id].isdead){ return }		
		people[client.id].up = up
		people[client.id].left = left
		people[client.id].right = right
		people[client.id].down = down
		people[client.id].a = a
		people[client.id].s = s
	})
	
	client.on('action', function(){
		return
		if(people[client.id].isdead){ return }
			if((people[client.id].energy - people[client.id].action.cost) < 0){ return }
			people[client.id].energy -= people[client.id].action.cost
			people[client.id].action.go(people[client.id])
	})		
	
	client.on('change',function(action){
		people[client.id].action = actions[action]
	})	
})