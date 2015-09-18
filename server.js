//ABDULWAHED WAHEDI

//gamepad api
//audio api

//todo
//wandering bosses
//ship designs
//optimize network traffic - only send particles close to player on server side
//weapons

//CHANGES MADE TODAY
//mine weapon
//random weapon on power up
//index page shows current weapon
//reverse thrust
//

//THOUGHTS
//I dont really like the movement scheme - for now it works need to test to see if it will hold up

//IDEAS
//make your characters look reflect the current weapon

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
var width = 3000
var height = 3000
	
var SPEEDLIMIT = 5
var FRICTION = -.1	
	
//init	
space_dust()
deathstart()	
	
app.set('port', process.env.PORT || 3000)
app.get('/', function(req, res){ res.sendFile(__dirname + '/index.html') })
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
		draw[circle.id].x = randx
		draw[circle.id].y = randy		
	}
	function deathstart(){
		//deathstar = {}
		//deathstar.health = 9000
		//deathstar.health = 9000
		//deathstar.size = 200
		//deathstar.id = 'DEATHSTAR'
		deathstar_draw = {}
		deathstar_draw.color = "#555555"
		deathstar_draw.x = Math.floor(Math.random() * width)
		deathstar_draw.y = Math.floor(Math.random() * height)
		deathstar_draw.size = 200
		draw['DEATHSTAR'] = deathstar_draw
		
		//things['DEATHSTAR'] = deathstar
		
		
	}
	function space_dust(){
		var dust_count = 0
		while(dust_count < 2000){
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
		
		var power_up_count = 0
		while(power_up_count < 5){
			power_up_count++
			draw['power_up-' + power_up_count] = {}			
			draw['power_up-' + power_up_count].x = Math.round(Math.random()*(width-20)) + 10
			draw['power_up-' + power_up_count].y = Math.round(Math.random()*(height-20)) + 10
			draw['power_up-' + power_up_count].size = 40			
			draw['power_up-' + power_up_count].color = "#9933FF"	
			circles['power_up-' + power_up_count] = {}
			circles['power_up-' + power_up_count].id = 'power_up-' + power_up_count
			circles['power_up-' + power_up_count].v = new victor()
			circles['power_up-' + power_up_count]._v = new victor()
			circles['power_up-' + power_up_count].v.x = draw['power_up-' + power_up_count].x
			circles['power_up-' + power_up_count].v.y = draw['power_up-' + power_up_count].y
			circles['power_up-' + power_up_count]._v.x = draw['power_up-' + power_up_count].x
			circles['power_up-' + power_up_count]._v.y = draw['power_up-' + power_up_count].y		
			circles['power_up-' + power_up_count].size = 40			
			circles['power_up-' + power_up_count].color = "#9933FF"				
			circles['power_up-' + power_up_count].collide = function(circle){}						
			circles['power_up-' + power_up_count].step = function(){}						
			circles['power_up-' + power_up_count].isPowerUp = true			
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
				return true
			}
			
		for(var x in circles){
			if(circles[x] == circle){ continue }
			var a = Math.pow(circles[x]._v.x - circle._v.x, 2)
			var b = Math.pow(circles[x]._v.y - circle._v.y, 2)
			var c = Math.sqrt(a + b)
			if(c < (circle.size + circles[x].size)){
				circle.collide(circles[x])
				// if(circles[x].stationary == true){
					// console.log('stationary hit')
					// circles[x].collide(circle)
				// }
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
	function person_spawn(person){
		//sets new x and y for player
		do{
			person.v.x = Math.round(Math.random()*(width-20)) + 10
			person.v.y = Math.round(Math.random()*(height-20)) + 10
			person._v.x = person.v.x
			person._v.y = person.v.y
		}while(circle_colliding(person))
		draw[person.id].x = person.v.x
		draw[person.id].y = person.v.y
	}
	function respawn_person(person){
		if (typeof draw[person.id] == 'undefined') {
			return
		}
		if(person.isdead == 'false'){ return }
		person.size = 10
		draw[person.id].size = 10
		person_spawn(person)
		person.health = 10
		person.energy = 10
		person.isdead = false
		delete draw[person.id + '-tombstone']
	}
	function gameover(person){
		person.isdead = true	
		person.speed.x = 0
		person.speed.y = 0
		person.up    = false
		person.down  = false
		person.left  = false
		person.right = false
		var name = person.id + '-tombstone'
		draw[name] = {}
		draw[name].size = person.size
		draw[name].x = person.v.x
		draw[name].y = person.v.y
		draw[name].color = "#AAAAAA"
		draw[name].type = 'circle'
		
		person.size = 0
		draw[person.id].size = 0
		
		setTimeout(function(){ respawn_person(person) },10000)	
	}
	var update_interval = setInterval(function(){
		for(var x in circles){ circles[x].step() }
		for(var x in people){ people[x].step() }
	}, 16)
	var draw_interval = setInterval(function(){	
		io.sockets.emit('draw', draw) 
	}, 16)
	var energy_interval = setInterval(function(){
		for(var x in people){
			//console.log(people[x].speed + ' ' + people[x].accel)
			if(people[x].energy < 10){
				people[x].energy++ }
			} 
	}, 1000)
}

actions = {
	pewpew: object = {
		cost: 1,
		go: function(player){
			var name = player.id + '-' + count
			count++
			circles[name] = {}
			draw[name] = {}
			circles[name].id = name
			circles[name].speed = 40
			circles[name].name = 'pewpew'
			draw[name].color = "#FF0000"
			circles[name].size = 8
			draw[name].size = 8
			var direction = new victor(player.direction.x, player.direction.y)
			circles[name].direction = direction
			circles[name].destroy_on_wall = true
			circles[name].v = new victor(player.v.x + (20*direction.x), player.v.y + (20*direction.y))
			circles[name]._v = new victor(player.v.x + (20*direction.x), player.v.y + (20*direction.y))
			
			circles[name].end = function(){
				delete draw[this.id]
				delete circles[this.id]
				delete this
			}			
			
			circles[name].collide = function(thing){
				if(thing.block){
					delete things_draw[this.id]
					delete things[this.id]
					delete this
				}
				if(thing.name == "bounce"){
					return
				}
				if(thing.isperson){
					thing.health -= 10
					if(thing.health <= 0){ gameover(thing) }	
					this.end()
					return				
				}
				if(thing.isNPC){
					thing.health -= 10
					if(thing.health <= 0){
						thing.end()
						return	
					}
					this.end()
				}
				return
			}	
			
			circles[name].step = function(){	
				this._v.x = this.v.x + (this.direction.x * this.speed)
				this._v.y = this.v.y + (this.direction.y * this.speed)
				this.v.x = this._v.x
				this.v.y = this._v.y
				draw[this.id].x = this.v.x
				draw[this.id].y = this.v.y					
				circle_colliding(this)
				return
			}			
		}
	},
	mine: object = {
		cost: 2,
		go: function(player){
			var name = player.id + '-' + count
			count++
			circles[name] = {}
			draw[name] = {}
			circles[name].id = name
			circles[name].speed = 0
			circles[name].name = 'mine'
			draw[name].color = "#00FFFF"
			circles[name].size = 16
			draw[name].size = 16
			spacing = 30
			var direction = new victor(player.direction.x, player.direction.y)
			direction.multiply(reverse)
			circles[name].direction = direction
			circles[name].destroy_on_wall = true
			circles[name].stationary = true
			circles[name].v = new victor(player.v.x + (spacing*direction.x), player.v.y + (spacing*direction.y))
			circles[name]._v = new victor(player.v.x + (spacing*direction.x), player.v.y + (spacing*direction.y))
			
			circles[name].end = function(){
				delete draw[this.id]
				delete circles[this.id]
				delete this
			}			
			
			circles[name].collide = function(thing){
				//console.log('mine collide')
				if(thing.block){
					delete things_draw[this.id]
					delete things[this.id]
					delete this
				}
				if(thing.name == "bounce"){
					return
				}
				if(thing.isperson){
					thing.health -= 10
					if(thing.health <= 0){ gameover(thing) }	
					this.end()
					return				
				}
				if(thing.isNPC){
					thing.health -= 10
					if(thing.health <= 0){
						thing.end()
						return	
					}
					this.end()
				}
				return
			}	
			
			circles[name].step = function(){	
				this._v.x = this.v.x + (this.direction.x * this.speed)
				this._v.y = this.v.y + (this.direction.y * this.speed)
				this.v.x = this._v.x
				this.v.y = this._v.y
				draw[this.id].x = this.v.x
				draw[this.id].y = this.v.y					
				circle_colliding(this)
				return
			}			
		}
	}	
}

io.on('connection', function(client){
	//init player
	people[client.id] = {}
	var P = people[client.id]
	P.id = client.id
	P.health = 10
	P.energy = 10
	P.rspeed = .05
	P.size   = 10
	P.thrust = .5
	P.up = false
	P.left = false
	P.right = false
	P.down = false
	P.action = actions['pewpew']
	P.collide = function(circle){
		if(circle.isPowerUp){
			teleport(circle)
			while(true){
				var rnum = Math.round(Math.random()*(Object.keys(actions).length - 1))
				//console.log(rnum)
				var choice = Object.keys(actions)[rnum]
				if(actions[choice] != P.action){
					P.action = actions[choice]
					client.emit('action_change',choice)
					return
				}
			}
		}
	}
	P.direction = new victor(.71,.71)
	P.calc = new victor(0,0)
	P.v = new victor(0,0)
	P._v = new victor(0,0)
	P.speed  = new victor(0,0)
	P.accel  = new victor(0,0)	
	P.isperson = true
	
	draw[client.id] = {}
	draw[client.id].size = P.size
	draw[client.id].color = "#FFFFFF"

	person_spawn(P)	
	
	client.emit("init", client.id)
	
	P.step = function(){
		//update draw
		draw[this.id].x = this.v.x
		draw[this.id].y = this.v.y			
		draw[this.engine.id].x = this.engine.v.x
		draw[this.engine.id].y = this.engine.v.y	
		//store current location
		this._v.x = this.v.x	
		this._v.y = this.v.y						
		//direction
		if(this.right){ this.direction.rotate(this.rspeed) }
		if(this.left){ this.direction.rotate(-this.rspeed) }
		this.engine.v_.x = this.direction.x
		this.engine.v_.y = this.direction.y
		this.engine.v_.multiply(reverse)
		this.engine.v_.x = this.engine.v_.x * 10
		this.engine.v_.y = this.engine.v_.y * 10
		this.engine.v.x = this.v.x
		this.engine.v.y = this.v.y
		this.engine.v.add(P.engine.v_)		

		draw[this.engine.id].color = "#FFFFFF"
		if(this.energy > 0){ draw[this.engine.id].color = "#FF0000" }		
		if(this.energy > 4){ draw[this.engine.id].color = "#FFFF00" }
		if(this.energy > 8){ draw[this.engine.id].color = "#00FF00" }		
		
		if(this.up){//engine on = accelerating
			this.accel.x = (this.direction.x * this.thrust)
			this.accel.y = (this.direction.y * this.thrust)
		}
		else if(this.down){//REVERSE
			this.accel.x = (this.direction.x * this.thrust)
			this.accel.y = (this.direction.y * this.thrust)
			this.accel.x = this.accel.x * -1
			this.accel.y = this.accel.y * -1
		}
		
		else{//engine off = slowing down/drifting
			//set accel to friction
			this.accel.y = FRICTION
			this.accel.x = FRICTION
			//if moving in negative direction reverse accel for deacceleration
			if(this.speed.y < 0){
				this.accel.y = this.accel.y * -1
			}
			if(this.speed.x < 0){
				this.accel.x = this.accel.x * -1
			}
			//if velocity would change directions set to 0 instead
			if(this.speed.x > 0 && (this.speed.x + this.accel.x) < 0){
				this.speed.x = 0
			}
			if(this.speed.x < 0 && (this.speed.x + this.accel.x) > 0){
				this.speed.x = 0
			}	
			if(this.speed.y > 0 && (this.speed.y + this.accel.y) < 0){
				this.speed.y = 0
			}
			if(this.speed.y < 0 && (this.speed.y + this.accel.y) > 0){
				this.speed.y = 0
			}	
			//if not moving can't slow down
			if(this.speed.x == 0){
				this.accel.x = 0
			}
			if(this.speed.y == 0){
				this.accel.y = 0
			}			
		}
		if(this.speed.magnitude() > SPEEDLIMIT){
			this.speed.x = this.speed.x * (SPEEDLIMIT / this.speed.magnitude())
			this.speed.y = this.speed.y * (SPEEDLIMIT / this.speed.magnitude())
		}
		//speed
		this.speed.x += this.accel.x
		this.speed.y += this.accel.y
		//position
		this._v.x += this.speed.x
		this._v.y += this.speed.y
		//collision
		if(circle_colliding(this)){ return }
		//update
		this.v.x = this._v.x
		this.v.y = this._v.y		
		return
	}
	
	//satelite
	P.engine = {}
	P.engine.id = P.id + '-satelite'
	P.engine.size = 5
	P.engine.v = new victor(P.v.x,P.v.y)
	P.engine.v_ = new victor(P.direction.x, P.direction.y)
	P.engine.v_.multiply(reverse)
	P.engine.v_.x = P.engine.v_.x * 10
	P.engine.v_.y = P.engine.v_.y * 10
	P.engine.v.add(P.engine.v_)
	
	draw[P.engine.id] = {}
	draw[P.engine.id].size = P.engine.size
	draw[P.engine.id].color = "#FFFFFF"
	draw[P.engine.id].x = P.engine.v.x
	draw[P.engine.id].y = P.engine.v.y
	
	//socket events
	console.log('connected (' + P.v.x + ', ' + P.v.y + ')')		
	
	client.on('disconnect', function(){
		console.log("disconnected")
		delete draw[client.id + '-satelite']
		delete draw[client.id]
		delete people[client.id]
	})
	
	client.on('keys', function(up, left, right, down){
		if(people[client.id].isdead){ return }		
		people[client.id].up = up
		people[client.id].left = left
		people[client.id].right = right
		people[client.id].down = down
	})
	
	client.on('action', function(){
		if(people[client.id].isdead){ return }
			if((people[client.id].energy - people[client.id].action.cost) < 0){ return }
			people[client.id].energy -= people[client.id].action.cost
			people[client.id].action.go(people[client.id])
	})		
	
	client.on('change',function(action){
		people[client.id].action = actions[action]
	})	
})