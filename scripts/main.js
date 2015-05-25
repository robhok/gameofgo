//(function () {
    function GoG() {};
    GoG.prototype = {
        init: function(id) {
            var self = this;
            this.gog = document.getElementById("gog");
            this.size = 19;
            this.plate = document.createElement("div");
            this.grid = [];
            this.id = id;
            for (var j = 0; j < this.size; j++) {
                this.grid[j] = [];
                for (var i = 0; i < this.size; i++) {
                    var div = document.createElement("div");
                    div.setAttribute('data-coord', i+"_"+j);
                    div.className = 'cell';
                    div.addEventListener('click', function(e) {
                        e.preventDefault;
                        var coord = this.getCoord();
                        self.play(e, coord[0], coord[1]);
                    }, false);
                    this.plate.appendChild(div);
                }
            }
            this.gog.appendChild(this.plate);
        },
        play: function(e, x, y) {
            this.checked = [];
            this.grid[x][y] = this.id;
            var cell = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
            if (this.id == 1) cell.classList.add('black');
            else cell.classList.add('white');
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (this.grid[x][y] == (this.id%2) + 1) {
                        if (this.check(x, y) == 0) this.kill(this.grid, this.checked);
                        else this.uncheck(this.grid, this.checked);
                    }
                }
            }
            this.changeRound();
        },
        getCoord: function(e) {
            var coord = this.getAttribute('data-coord').split("_");
            return coord;
        },
        check: function(x, y) {
            var lib = 0,
                dir = [{x:x-1,y:y},{x:x+1,y:y},{x:x,y:y-1},{x:x,y:y+1}]
            for (var i = 0; i < dir.length; i++) {
                if(this.grid[dir[i].x][dir[i].y] == 0) lib++;
            }
            for (var i = 0; i < dir.length; i++) {
                if(this.grid[dir[i].x][dir[i].y] == (this.id%2) + 1) {
                    this.grid[dir[i].x][dir[i].y] += 0.5;
                    this.checked.push(dir[i]);
                    return lib + this.check(dir[i].x, dir[i].y);
                }
            }
            return lib;
        },
        unckeck: function (grid, array) {
            for (var i = 0; i < array.length; i++) {
                grid[array[i].x][array[i].y] = parseInt(grid[array[i].x][array[i].y]);
            }
        },
        kill: function (grid, array) {
            for (var i = 0; i < array.length; i++) {
                grid[array[i].x][array[i].y] = 0;
                var cell = document.querySelector('.cell[data-coord="'+array[i].x+'_'+array[i].y+'"]');
                if (cell.classList.contains('white')) cell.classList.remove('white');
                else if (cell.classList.contains('black')) cell.classList.remove('black');
            }
        },
        changeRound : function() {
            this.id = (this.id%2) + 1;
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
    gog.init();
