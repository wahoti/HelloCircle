var victor = require('victor')

//sword - size, sections, collide, step

// step = function(sword){
	// sword
// }

module.exports = {
	sword: function(person){
		sword = {}
		sword.owner = person.id
		sword.sections = 1
		sword.v = new victor(0,0)
		person.sword = sword
	}
}