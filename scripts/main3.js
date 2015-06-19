//(function () {
    function GoG() {};
    GoG.prototype = {
        init: function(id) {
            var self = this;
            this.gog = document.getElementById("gog");
            this.size = 19;
            this.plate = document.createElement("div");
			this.plate.className = 'play';
            this.grid = [];
            this.id = parseInt(id);
            this.enemy = (this.id%2)+1;
			this.pass = 0;
			this.group = [];
            this.unplay = [];
            this.lib = [];
			this.dir = [{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:1}];
            this.dirDiag = [{x:-1,y:1},{x:1,y:1},{x:-1,y:-1},{x:1,y:-1}];
            for (var i = 0; i < this.size; i++) {
                this.grid[i] = [];
                for (var j = 0; j < this.size; j++) {
                    this.grid[i][j] = 0;
					var div = document.createElement("div");
                    div.setAttribute('data-coord', i+"_"+j);
                    div.className = 'cell';
                    div.addEventListener('click', function(e) {
                        e.preventDefault;
                        var coord = this.getAttribute('data-coord').split("_");
                        self.play(parseInt(coord[0]), parseInt(coord[1]));
                    }, false);
                    this.plate.appendChild(div);
            	}
            }
            this.gog.appendChild(this.plate);
        },
        play: function(x, y) {
            var cellPlay = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
            if(this.grid[x][y] == 0 && this.grid[x][y] !== undefined && !cellPlay.classList.contains("unplay"+this.id)) {
                this.checked = [];
                var enGrpAround = [];
                this.grid[x][y] = this.id;
                var chAround = this.check(x, y, 0);
                for (var i = 0; i < chAround[2].length; i++) {
                    var cellGrp = this.grid[chAround[2][i].x][chAround[2][i].y].group;
                    if (enGrpAround.lastIndexOf(cellGrp) == -1) enGrpAround.push(cellGrp);
                }
                for (var i = 0; i < enGrpAround.length; i++) {
                    this.group[enGrpAround[i]][0]--;
                    if (this.group[enGrpAround[i]][0].length == 0) this.kill(this.grid, this.group[enGrpAround[i]]);
                    else if (this.group[enGrpAround[i]][0].length == 1) var lib = this.check(
                }
			}
        },
        check: function(x, y, type) { //type : 0 = id, 1 = grp
            if (type == 0 || type == 1) { 
                var lib = [];
                for (var i = 0; i < 3; i++) {
                    lib[i] = [];
                }
            }
            else var lib = [];
            for (var i = 0; i < this.dir.length; i++) {
				var around = {
					x: x + this.dir[i].x,
					y: y + this.dir[i].y
				}
				if(this.grid[around.x] !== undefined && this.grid[around.x][around.y] !== undefined) {
                    switch(type) {
                        case 0: //on push les coord de tout ce qu'il y a autour de la case, libertés / alliés / ennemis
                            if (this.grid[around.x][around.y] === 0) lib[0].push(around);
                            else if (this.grid[around.x][around.y].id === this.id) lib[1].push(around);
                            else if (this.grid[around.x][around.y].id === this.enemy) lib[2].push(around);
                            break;
                        case 1: //on push les coord de toutes les libertés et le nombre de libertés des groupes alliés / ennemis
                            if (this.grid[around.x][around.y] === 0) lib[0].push(around);
                            else lib[this.grid[around.x][around.y].id].push(this.group[this.grid[around.x][around.y].group][0]);
                        case 2:
                            if (this.grid[around.x][around.y] === 0) lib.push(around);
                            else if(this.grid[around.x][around.y].id === this.id) lib.concat(this.check(around.x, around.y, 2));
                        default:
                            break;
                    }
                }
            }
            return lib;
        },
        uncheck: function (grid, array) {
            for (var i = 0; i < array.length; i++) {
                if (isNaN(grid[array[i].x][array[i].y])) grid[array[i].x][array[i].y].id = parseInt(grid[array[i].x][array[i].y].id);
                else grid[array[i].x][array[i].y] = parseInt(grid[array[i].x][array[i].y]);
            }
        },
        kill: function (grid, array) {
            while (array.length > 0) {
                array.shift();
                grid[array[0].x][array[0].y] = 0;
                var cell = document.querySelector('.cell[data-coord="'+array[i].x+'_'+array[i].y+'"]');
                if (cell.classList.contains('white')) cell.classList.remove('white');
                else if (cell.classList.contains('black')) cell.classList.remove('black');
            }
        },
        libSuicide: function (x, y) {
            var lib = this.check(x, y, 1);
            var idNoLib = [];
            if (lib[0].length == 0) {
                for (var i = 1; i < lib.length; i++) {
                    for (var j = 0; j < lib[i].length; j++) {
                        if (lib[i][j] == 1) idNoLib.push(i); //i = id de la case (donc du joueur qui possède la case)
                    }
                }
                if ((idNoLib.lastIndexOf(this.id) == -1 && idNoLib.lastIndexOf(this.enemy) == -1) || (idNoLib.lastIndexOf(this.id) > 0 && idNoLib.lastIndexOf(this.enemy) > 0)) return;
                else this.setUnplay(x, y, idNoLib[0], 0, 1, 0);
            }
        },
        setUnplay: function(x, y, id, addorrem, last, index) { //add or remove = 0 for add, 1 for remove
            var cell = document.querySelector('.cell[data-coord="'+this.checked[0].x+'_'+this.checked[0].y+'"]');
            if (addorrem == 0) {
                cell.classList.add('unplay'+id);
                this.unplay.push({id:id,x:x,y:y,last:last});
            }
            if (addorrem == 1) {
                if (cell.classList.contains('unplay'+id)) cell.classList.remove('unplay'+id);
                this.unplay.splice(index, 1);
            }
        },
        changeRound : function() {
            this.enemy = this.id;
            this.id = (this.id%2)+1;
            for (var i = 0; i < this.unplay.length; i++) {
                if (this.unplay[i].id == this.id) {
                    console.log("toto");
                    this.unplay[i].last--;
                    if (this.unplay[i].last == 0) {
                        console.log("tata");
                        if (this.grid[this.unplay[i].x][this.unplay[i].y] == 0) {
                            console.log("titi");
                            if (isNaN(this.check(this.unplay[i].x, this.unplay[i].y, this.id, 0, 1))) {
                                console.log("tutu");
                                console.log(this.check(this.unplay[i].x, this.unplay[i].y, this.id, 0, 1));
                                var cell = document.querySelector('.cell[data-coord="'+this.unplay[i].x+'_'+this.unplay[i].y+'"]');
                                if (cell.classList.contains('unplay'+this.id)) cell.classList.remove('unplay'+this.id);
                                this.unplay.splice(i, 1);
                            }
                            else {this.unplay[i].last++;
                            console.log("zut");}
                        }
                        else {
                            var cell = document.querySelector('.cell[data-coord="'+this.unplay[i].x+'_'+this.unplay[i].y+'"]');
                            if (cell.classList.contains('unplay'+this.id)) cell.classList.remove('unplay'+this.id);
                            this.unplay.splice(i, 1);
                        }
                    }
                }
            }
        },
        pass: function() {
            this.changeRound();
        },
        end: function() {
            return;
        }
    }
//}) ();
    
    var gog = new GoG();
    gog.init(1);
