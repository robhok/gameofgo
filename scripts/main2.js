//(function () {
    function GoG() {};
    GoG.prototype = {
        init: function(id, handicap) {
            var self = this;
            this.gog = document.getElementById("gog");
            this.size = 19;
            this.plate = document.createElement("div");
			this.plate.className = 'play';
            this.grid = [];
            this.handicap = parseInt(handicap) - 1;
            this.id = parseInt(id);
            this.enemy = (this.id%2)+1;
			this.roundPassed = 0;
			this.group = [];
            this.unplay = [];
            this.unplayEx = [];
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
                this.roundPassed = 0;
                this.checked = [];
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
                        var lib = [];
                        for (var j = 1; j < this.group[enGrpAround[i]].length; j++) {
                            lib = this.check(this.group[enGrpAround[i]].x, this.group[enGrpAround[i]].y, 2);
                        }
                        if (lib.length == 1) this.libSuicide(lib[0].x, lib[0].y, 0);
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
                var cell = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
				if (this.id == 1) cell.classList.add('black');
                else cell.classList.add('white');
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
                            else lib[this.grid[around.x][around.y].id].push(this.group[this.grid[around.x][around.y].group][0]);
                            break;
                        case 2: 
                            if (this.grid[around.x][around.y] === 0) lib.push(around);
                            else if(this.grid[around.x][around.y].id === this.id) lib = lib.concat(this.check(around.x, around.y, 2));
                            else return;
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
                if (cell.classList.contains('white')) cell.classList.remove('white');
                else if (cell.classList.contains('black')) cell.classList.remove('black');
            }
            array.shift();
        },
        libSuicide: function (x, y, type) { //0 to check & apply, 1 to check
            var lib = this.check(x, y, 1);
            var idNoLib = [];
            switch(type) {
                case 0:
                    if (lib[0].length == 0) {
                        for (var i = 1; i < lib.length; i++) {
                            for (var j = 0; j < lib[i].length; j++) {
                                if (lib[i][j] == 1) idNoLib.push(i); //i = id de la case (donc du joueur qui possède la case)
                            }
                        }
                        if (idNoLib.lastIndexOf(this.id) !== -1 && idNoLib.lastIndexOf(this.enemy) !== -1) return;
                        else if (idNoLib.lastIndexOf(this.id) == -1 && idNoLib.lastIndexOf(this.enemy) == -1) {
                            if (lib[this.id].length == 0 && lib[this.enemy].length > 0) this.setUnplay(x, y, this.id, 0, 1, 0);
                            else if (lib[this.id].length > 0 && lib[this.enemy].length == 0) this.setUnplay(x, y, this.enemy, 0, 1, 0);
                        }
                        else {
                            if (lib[idNoLib[0]].length == 1) this.setUnplay(x, y, idNoLib[0], 0, 1, 0);
                        }
                    }
                    break;
                case 1:
                    if (lib[0].length == 0) {
                        for (var i = 1; i < lib.length; i++) {
                            for (var j = 0; j < lib[i].length; j++) {
                                if (lib[i][j] == 1) idNoLib.push(i); //i = id de la case (donc du joueur qui possède la case)
                            }
                        }
                        if (idNoLib.lastIndexOf(this.id) !== -1 && idNoLib.lastIndexOf(this.enemy) !== -1) return 0;
                        else if (idNoLib.lastIndexOf(this.id) == -1 && idNoLib.lastIndexOf(this.enemy) == -1) {
                            if (lib[this.id].length == 0 && lib[this.enemy].length > 0) return this.id;
                            else if (lib[this.id].length > 0 && lib[this.enemy].length == 0) return this.enemy;
                        }
                        else {
                            if (lib[idNoLib[0]].length == 1) return idNoLib[0];
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
                for (var i = 0; i < this.unplay.length; i++) {
                    if (this.unplay[i].x == x && this.unplay[i].y == y) unplayExist++;
                }
                if (unplayExist == 0) {
                    cell.classList.add('unplay'+id);
                    this.unplay.push({id:id,x:x,y:y,last:last});
                }
            }
            if (addorrem == 1) {
                if (cell.classList.contains('unplay'+id)) cell.classList.remove('unplay'+id);
                this.unplay.splice(index, 1);
            }
        },
        changeUnplay: function (allyId, enemyId) {
            if (this.unplayEx[enemyId-1]) {
                for (var i = 0; i < this.unplayEx[enemyId-1].length; i++) {
                    this.unplayEx[enemyId-1][i].classList.remove('unplay'+enemyId);
                }
            }
            if (this.unplayEx[allyId-1]) {
                for (var i = 0; i < this.unplayEx[allyId-1].length; i++) {
                    this.unplayEx[allyId-1][i].classList.add('unplay'+allyId);
                }
            }
            this.unplayEx[allyId-1] = document.getElementsByClassName('unplay'+allyId);
            console.log(this.unplayEx);
        },
        changeRound: function() {
            this.enemy = this.id;
            this.id = (this.id%2)+1;
            this.changeUnplay(this.id, this.enemy);
            for (var i = 0; i < this.unplay.length; i++) {
                if (this.unplay[i].id == this.id) {
                    this.unplay[i].last--;
                    if (this.unplay[i].last == 0) {
                        var idSui = this.libSuicide(this.unplay[i].x, this.unplay[i].y, 1);
                        if (idSui == this.id) this.unplay[i].last++;
                        else if (idSui == this.enemy) {
                            this.setUnplay(this.unplay[i].x, this.unplay[i].y, this.id, 1, 0, i);
                            this.setUnplay(this.unplay[i].x, this.unplay[i].y, this.enemy, 0, 1, 0);
                        }
                        else this.setUnplay(this.unplay[i].x, this.unplay[i].y, this.id, 1, 0, i);
                    }
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
