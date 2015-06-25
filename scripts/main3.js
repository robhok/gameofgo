//(function () {
    function GoG() {};
    GoG.prototype = {
        init: function(id, handicap) {
            var self = this;
            this.gog = document.getElementById("gog");
            this.plate = document.createElement("div");
            this.size = 19;
			this.plate.className = 'play';
            this.grid = [];
            this.handicap = parseInt(handicap) - 1;
            this.id = parseInt(id);
            this.enemy = (this.id%2)+1;
			this.roundPassed = 0;
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
                    if (i == 0 && j == 0) div.className += ' coinHG';
                    else if (i == 0 && j == this.size-1) div.className += ' coinHD';
                    else if (i == this.size-1 && j == 0) div.className += ' coinBG';
                    else if (i == this.size-1 && j == this.size-1) div.className += ' coinBD';
                    else if (i == 0) div.className += ' bordH';
                    else if (j == 0) div.className += ' bordG';
                    else if (i == this.size-1) div.className += ' bordB';
                    else if (j == this.size-1) div.className += ' bordD';
                    div.addEventListener('click', function(e) {
                        e.preventDefault;
                        var coord = this.getAttribute('data-coord').split("_");
                        self.play(parseInt(coord[0]), parseInt(coord[1]));
                    }, false);
                    this.plate.appendChild(div);
            	}
            }
            this.gog.appendChild(this.plate);
            for (var i = 0; i < 2; i++) {
                this.unplay[i] = [];
            }
        },
        play: function(x, y) {
            var cellPlay = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
            if(this.grid[x][y] == 0 && this.grid[x][y] !== undefined && !cellPlay.classList.contains("unplay"+this.id)) {
                this.roundPassed = 0;
                this.checked = [];
				this.lib = [];
                this.grid[x][y] = this.id;
                var enGrpAround = [];
                var chAround = this.check(x, y, 0);
                for (var i = 0; i < chAround[2].length; i++) { //ennemis
                    var cellGrp = this.grid[chAround[2][i].x][chAround[2][i].y].group;
                    if (enGrpAround.lastIndexOf(cellGrp) == -1) enGrpAround.push(cellGrp);
                }
                for (var i = 0; i < enGrpAround.length; i++) {
                    this.group[enGrpAround[i]][0]--;
                    if (this.group[enGrpAround[i]][0] === 0) {
                        this.kill(this.grid, this.group[enGrpAround[i]]);
                    }
                    else if (this.group[enGrpAround[i]][0] === 1) {
                        for (var j = 1; j < this.group[enGrpAround[i]].length; j++) {
                            this.lib = this.lib.concat(this.check(this.group[enGrpAround[i]][j].x, this.group[enGrpAround[i]][j].y, 2));
                        }
                        this.uncheck(this.grid, this.lib);
                    }
                } //fin ennemis
                for (var i = 0; i < chAround[1].length; i++) { //alliés
                    var alGrpAround = this.grid[chAround[1][i].x][chAround[1][i].y].group;
                    if (this.grid[x][y] === this.id) {
                        this.grid[x][y] = {
                            id: this.id,
                            group: alGrpAround
                        }
                        this.group[alGrpAround].push({x:x, y:y});
                    }
                    else if (this.grid[x][y].group !== alGrpAround) {
                        for (var j = 1; j < this.group[alGrpAround].length; j++) {
                            this.grid[this.group[alGrpAround][j].x][this.group[alGrpAround][j].y].group = this.grid[x][y].group;
                        }
                        this.group[alGrpAround].shift();
                        this.group[this.grid[x][y].group] = this.group[this.grid[x][y].group].concat(this.group[alGrpAround]);
                        this.group[alGrpAround] = [];
                    }
                } //fin alliés
                if (this.grid[x][y] === this.id) {
                    this.grid[x][y] = {
                        id:this.id,
                        group: this.group.length
                    }
                    this.group.push([0, {x:x,y:y}]);
                }
                var libGrp = this.check(x, y, 3);
                this.uncheck(this.grid, this.checked);
                if (libGrp.length == 1) this.libSuicide(libGrp[0].x, libGrp[0].y, 0);
                this.group[this.grid[x][y].group][0] = libGrp.length;
                for (var i = 0; i < chAround[0].length; i++) { //libertés
                    this.libSuicide(chAround[0][i].x, chAround[0][i].y, 0);
                } //fin libertés
				if (this.lib.length == 1) this.libSuicide(this.lib[0].x, this.lib[0].y, 0);
                var lastPlay = document.getElementsByClassName('lastPlay');
                if (lastPlay.length > 0) lastPlay[0].classList.remove('lastPlay');
                var cell = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
                var span = document.createElement('span');
				if (this.id == 1) span.className = ('black lastPlay');
                else span.className = ('white lastPlay');
                cell.appendChild(span);
                if (this.handicap < 1) this.changeRound();
                else this.handicap--;
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
                            else {
								console.log(this.grid[around.x][around.y].id);
								console.log(around);
								console.log(lib);
								lib[this.grid[around.x][around.y].id].push(this.group[this.grid[around.x][around.y].group][0]);
							}
                            break;
                        case 2: 
                            if (this.grid[around.x][around.y] === 0) { 
                                lib.push(around);
                                this.grid[around.x][around.y] += 0.5;
                            }
                            break;
                        case 3:
                            if (this.grid[around.x][around.y] === 0) {
                                this.checked.push(around);
                                this.grid[around.x][around.y] += 0.5;
                                lib.push(around);
                            }
                            else if(this.grid[around.x][around.y].id === this.id) {
                                this.checked.push(around);
                                this.grid[around.x][around.y].id += 0.5;
                                lib = lib.concat(this.check(around.x, around.y, 3));
                            }
                            break;
                        case 4:
                            if (isNaN(this.grid[around.x][around.y])) {
                                if (this.grid[around.x][around.y].id !== this.grid[x][y].id && lib.lastIndexOf(this.grid[around.x][around.y].group) == -1) {
                                    lib.push(this.grid[around.x][around.y].group);
                                }
                            }
                            break;
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
            if (array.length == 2) this.setUnplay(array[1].x, array[1].y, grid[array[1].x][array[1].y].id, 0, 2, 0);
            while (array.length > 1) {
                array.shift();
                var enGrpAround = this.check(array[0].x, array[0].y, 4);
                for (var i = 0; i < enGrpAround.length; i++) this.group[enGrpAround[i]][0]++;
                grid[array[0].x][array[0].y] = 0;
                var cell = document.querySelector('.cell[data-coord="'+array[0].x+'_'+array[0].y+'"]');
                var span = document.querySelector('.cell[data-coord="'+array[0].x+'_'+array[0].y+'"]').firstChild;
                cell.removeChild(span);
            }
            array.shift();
        },
        libSuicide: function (x, y, type) { //0 to check & apply, 1 to check
            var lib = this.check(x, y, 1);
            var idNoLib = [];
            idNoLib[0] = [];
            idNoLib[1] = [];
            switch(type) {
                case 0:
                    if (lib[0].length == 0) {
                        for (var i = 1; i < lib.length; i++) {
                            for (var j = 0; j < lib[i].length; j++) {
                                if (lib[i][j] == 1) idNoLib[0].push(i); //i = id de la case (donc du joueur qui possède la case)
                                else idNoLib[1].push(i);
                            }
                        }
                        if (idNoLib[0].lastIndexOf(this.id) !== -1 && idNoLib[0].lastIndexOf(this.enemy) !== -1) return;
                        else if (idNoLib[0].lastIndexOf(this.id) == -1 && idNoLib[0].lastIndexOf(this.enemy) == -1) {
                            if (lib[this.id].length == 0 && lib[this.enemy].length > 0) this.setUnplay(x, y, this.id, 0, 1, 0);
                            else if (lib[this.id].length > 0 && lib[this.enemy].length == 0) this.setUnplay(x, y, this.enemy, 0, 1, 0);
                        }
                        else {
                            if (idNoLib[1].lastIndexOf(idNoLib[0][0]) == -1) this.setUnplay(x, y, idNoLib[0][0], 0, 1, 0);
                        }
                    }
                    break;
                case 1:
                    if (this.grid[x][y] !== 0) return 0;
                    if (lib[0].length == 0) {
                        for (var i = 1; i < lib.length; i++) {
                            for (var j = 0; j < lib[i].length; j++) {
                                if (lib[i][j] == 1) idNoLib[0].push(i); //i = id de la case (donc du joueur qui possède la case)
                                else idNoLib[1].push(i);
                            }
                        }
                        if (idNoLib[0].lastIndexOf(this.id) !== -1 && idNoLib[0].lastIndexOf(this.enemy) !== -1) return 0;
                        else if (idNoLib[0].lastIndexOf(this.id) == -1 && idNoLib[0].lastIndexOf(this.enemy) == -1) {
                            if (lib[this.id].length == 0 && lib[this.enemy].length > 0) return this.id;
                            else if (lib[this.id].length > 0 && lib[this.enemy].length == 0) return this.enemy;
                        }
                        else {
                            if (idNoLib[1].lastIndexOf(idNoLib[0][0]) == -1) return idNoLib[0][0];
                        }
                    }
                    else return 0;
                    break;
                default:
                    break;
            }
        },
        setUnplay: function(x, y, id, addorrem, last, index) { //add or remove : 0 = add, 1 = remove
            var cell = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
            var unplayExist = 0;
            if (addorrem == 0) {
                for (var i = 0; i < this.unplay[id-1].length; i++) {
                    if (this.unplay[id-1][i].x == x && this.unplay[id-1][i].y == y) unplayExist++;
                }
                if (unplayExist == 0) {
                    cell.classList.add('unplay'+id);
                    this.unplay[id-1].push({x:x,y:y,last:last});
                }
            }
            if (addorrem == 1) {
                if (cell.classList.contains('unplay'+id)) cell.classList.remove('unplay'+id);
                this.unplay[id-1].splice(index, 1);
            }
        },
        changeUnplay: function (allyId, enemyId) {
            for (var i = 0; i < this.unplay[enemyId-1].length; i++) {
                var cell = document.querySelector('.cell[data-coord="'+this.unplay[enemyId-1][i].x+'_'+this.unplay[enemyId-1][i].y+'"]');
                cell.classList.remove('unplay'+enemyId);
            }
            for (var i = 0; i < this.unplay[allyId-1].length; i++) {
                var cell = document.querySelector('.cell[data-coord="'+this.unplay[allyId-1][i].x+'_'+this.unplay[allyId-1][i].y+'"]');
                cell.classList.add('unplay'+allyId);
            }
        },
        changeRound: function() {
            this.enemy = this.id;
            this.id = (this.id%2)+1;
            this.changeUnplay(this.id, this.enemy);
            for (var i = 0; i < this.unplay[this.id-1].length; i++) {
                this.unplay[this.id-1][i].last--;
                if (this.unplay[this.id-1][i].last == 0) {
                    var idSui = this.libSuicide(this.unplay[this.id-1][i].x, this.unplay[this.id-1][i].y, 1);
                    if (idSui == this.id) this.unplay[this.id-1][i].last++;
                    else if (idSui == this.enemy) {
                        this.setUnplay(this.unplay[this.id-1][i].x, this.unplay[this.id-1][i].y, this.id, 1, 0, i);
                        this.setUnplay(this.unplay[this.id-1][i].x, this.unplay[this.id-1][i].y, this.enemy, 0, 1, 0);
                    }
                    else this.setUnplay(this.unplay[this.id-1][i].x, this.unplay[this.id-1][i].y, this.id, 1, 0, i);
                }
            }
        },
        pass: function() {
            this.roundPassed++;
            if (this.roundPassed == 2) this.end();
            else this.changeRound();
        },
        end: function() {
//            for (var i = 0; i
            return;
        }
    }
//}) ();
    
    var gog = new GoG();
    gog.init(1, 1);
