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
			this.pass = 0;
			this.group = [];
            this.unplay = [];
            this.libKill = [];
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
                this.grid[x][y] = this.id;
				for (var i = 0; i < this.dir.length; i++) {
					var around = {
						x: x + this.dir[i].x,
						y: y + this.dir[i].y
					}
					if((this.grid[around.x] !== undefined && this.grid[around.x][around.y] !== undefined) && this.grid[around.x][around.y].id === this.id) {
                        var newGroup = this.grid[around.x][around.y].group;
                        if (this.grid[x][y] == this.id) {
                            this.grid[x][y] = {
                                id:this.id,
                                group:newGroup
                            }
                            this.group[newGroup].push({x:x,y:y});
                        }
                        else {
                            var oldGroup = this.grid[x][y].group;
                            while (this.group[oldGroup].length > 0) {
                                this.group[newGroup].push(this.group[oldGroup][i]);
                                this.group[oldGroup].shift();
                            }
                            this.grid[x][y].group = newGroup;
                        }
					}
                    else if((this.grid[around.x] !== undefined && this.grid[around.x][around.y] !== undefined) && this.grid[around.x][around.y].id === (this.id%2)+1) {
                        this.group[this.grid[around.x][around.y].group][0]--;
                        if(this.group[this.grid[around.x][around.y].group][0] == 0) {
                            if (this.group[this.grid[around.x][around.y].group].length == 2) {
                                console.log('unplay1');
                                var cell = document.querySelector('.cell[data-coord="'+around.x+'_'+around.y+'"]');
                                cell.classList.add('unplay'+((this.id%2)+1));
                                this.unplay.push({id:((this.id%2)+1),x:around.x,y:around.y,last:2});
                            }
                            this.kill(this.grid,this.group[this.grid[around.x][around.y].group]);
                        }
                    }
                    else if((this.grid[around.x] !== undefined && this.grid[around.x][around.y] !== undefined) && this.grid[around.x][around.y] === 0) {
                        if (this.check(around.x, around.y, 0, 0, 0) == 0) {
                            if (this.check(around.x, around.y, 1, 0, 1) !== 0 && this.check(around.x, around.y, 0, 0, 0) == 0) {
                                var cell = document.querySelector('.cell[data-coord="'+around.x+'_'+around.y+'"]');
                                cell.classList.add('unplay'+((this.id%2)+1));
                                this.unplay.push({id:((this.id%2)+1),x:around.x,y:around.y,last:'1'});
                            }
                        }
                    }
				}
                if (this.grid[x][y] == this.id) {
                    this.grid[x][y] = {
                        id:this.id,
                        group: this.group.length
                    }
                    this.group.push([0, {x:x,y:y}]);
                }
                var cell = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
				if (this.id == 1) cell.classList.add('black');
                else cell.classList.add('white');
                var lib = 0;
                for (var i = 1; i < this.group[this.grid[x][y].group].length; i++) {
                    lib += this.check(this.group[this.grid[x][y].group][i].x, this.group[this.grid[x][y].group][i].y, 0, 1, 0);
                }
                if (lib == 1) {
                    if (this.check(this.checked[0].x, this.checked[0].y, 1, 0, 1) && (!this.check(this.checked[0].x, this.checked[0].y, 0, 0, 0))) {
                        cell = document.querySelector('.cell[data-coord="'+this.checked[0].x+'_'+this.checked[0].y+'"]');
                        cell.classList.add('unplay'+((this.id%2)+1));
                        this.unplay.push({id:this.id,x:this.checked[0].x,y:this.checked[0].y,last:1});
                    }
                }
                this.uncheck(this.grid, this.checked);
                this.group[this.grid[x][y].group][0] = lib;
                this.changeRound();
			}
        },
        check: function(x, y, element, strongverif, type) { //type : 0 = id, 1 = grp
            if (type == 2) {var lib = []; console.log('lol');}
            else var lib = 0;
            for (var i = 0; i < this.dir.length; i++) {
				var around = {
					x: x + this.dir[i].x,
					y: y + this.dir[i].y
				}
				if(this.grid[around.x] !== undefined && this.grid[around.x][around.y] !== undefined) {
                    switch(type) {
                        case 0:
                            if (this.grid[around.x][around.y] === element || this.grid[around.x][around.y].id === element) {
                                if (strongverif === 1) {
                                    lib++;
                                    if(this.grid[around.x][around.y] !== 0) this.grid[around.x][around.y].id += 0.5;
                                    else this.grid[around.x][around.y] += 0.5;
                                    this.checked.push(around);
                                }
                                else lib++;
                            }
                            break;
                        case 1:
                            if (isNaN(this.grid[around.x][around.y])) {
                                if (this.group[this.grid[around.x][around.y].group][0] === element) lib = around;
                            }
                            break;
                        case 2:
                            if (isNaN(this.grid[around.x][around.y])) {
                                if (this.grid[around.x][around.y].id !== element && lib.lastIndexOf(this.grid[around.x][around.y].group) == -1) {
                                    console.log(lib);
                                    this.group[this.grid[around.x][around.y].group][0]++;
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
            for (var i = 1; i < array.length; i++) {
                this.check(array[i].x, array[i].y, ((this.id%2)+1), 0, 2);
                grid[array[i].x][array[i].y] = 0;
                var cell = document.querySelector('.cell[data-coord="'+array[i].x+'_'+array[i].y+'"]');
                if (cell.classList.contains('white')) cell.classList.remove('white');
                else if (cell.classList.contains('black')) cell.classList.remove('black');
            }
        },
        changeRound : function() {
            this.id = parseInt((this.id%2) + 1);
            for (var i = 0; i < this.unplay.length; i++) {
                if (this.unplay[i].id == this.id && !isNaN(this.unplay[i].last)) {
                    this.unplay[i].last--;
                    if (this.unplay[i].last == 0) {
                        if (this.grid[this.unplay[i].x][this.unplay[i].y] == 0) {
                            if (this.check(this.unplay[i].x, this.unplay[i].y, 1, 0, 1) !== 0) {
                                    var cell = document.querySelector('.cell[data-coord="'+this.unplay[i].x+'_'+this.unplay[i].y+'"]');
                                    if (cell.classList.contains('unplay'+this.id)) cell.classList.remove('unplay'+this.id);
                                    this.unplay.splice(i, 1);
                            }
                            else this.unplay[i].last++;
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
