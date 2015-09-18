var victor = require('victor')

var swords = require('./js/swords.js')

person = {}
person.id = 'a'

swords.sword(person)

console.log(person)

// person.sword = swords['sword']

// console.log(person)

// person2 = {}

// person2.sword = swords['sword']

// console.log(person2)

//console.log(swords['sword'].name)

// var victor = require('victor')


// var a = new victor(1,1)
// a.normalize()
// console.log(a.magnitude())

// a.x = a.x*10
// a.y = a.y*10
// console.log(a.magnitude())


// var SAT = require('SAT')

// var v1 = new SAT.Vector(0,0)
// var v2 = new SAT.Vector(40,0)
// var v3 = new SAT.Vector(40,40)
// var v4 = new SAT.Vector(0,40)

//console.log(v1.x)

// var polygon1 = new SAT.Polygon(v1, [v1, v2, v3, v4])

//console.log(polygon1.calcPoints[0].x)

// var v5 = new SAT.Vector(100,100)
// var v6 = new SAT.Vector(140,100)
// var v7 = new SAT.Vector(140,180)
// var v8 = new SAT.Vector(100,140)

// var polygon2 = new SAT.Polygon(v5, [v5,v6,v7,v8])

// var response = new SAT.Response()

// var collided = SAT.testPolygonPolygon(polygon1, polygon2)

// console.log(collided)