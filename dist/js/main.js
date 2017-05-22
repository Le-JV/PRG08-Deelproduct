var E_SCENES;
(function (E_SCENES) {
    E_SCENES[E_SCENES["GAME_SCENE"] = 0] = "GAME_SCENE";
})(E_SCENES || (E_SCENES = {}));
var TILED_LAYERS;
(function (TILED_LAYERS) {
    TILED_LAYERS[TILED_LAYERS["TILE_LAYER"] = 0] = "TILE_LAYER";
    TILED_LAYERS[TILED_LAYERS["COLLISION_LAYER"] = 1] = "COLLISION_LAYER";
})(TILED_LAYERS || (TILED_LAYERS = {}));
var E_COLLIDER_TYPES;
(function (E_COLLIDER_TYPES) {
    E_COLLIDER_TYPES[E_COLLIDER_TYPES["GROUND"] = 0] = "GROUND";
    E_COLLIDER_TYPES[E_COLLIDER_TYPES["PLAYER"] = 1] = "PLAYER";
    E_COLLIDER_TYPES[E_COLLIDER_TYPES["PROP"] = 2] = "PROP";
    E_COLLIDER_TYPES[E_COLLIDER_TYPES["TRIGGER"] = 3] = "TRIGGER";
})(E_COLLIDER_TYPES || (E_COLLIDER_TYPES = {}));
var ColliderDirection;
(function (ColliderDirection) {
    ColliderDirection[ColliderDirection["NONE"] = 0] = "NONE";
    ColliderDirection[ColliderDirection["TOP"] = 1] = "TOP";
    ColliderDirection[ColliderDirection["BOTTOM"] = 2] = "BOTTOM";
    ColliderDirection[ColliderDirection["LEFT"] = 3] = "LEFT";
    ColliderDirection[ColliderDirection["RIGHT"] = 4] = "RIGHT";
})(ColliderDirection || (ColliderDirection = {}));
var Game = (function () {
    function Game() {
        var _this = this;
        this.elapsedTime = 0;
        this.updateLag = 0;
        this.fpsTimer = 0;
        this.renderFPS = 0;
        if (Game._instance) {
            throw new Error("Kan klasse niet instantieren: Game is een singleton.");
        }
        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = Game.width;
        this.canvas.height = Game.height;
        this.date = new Date();
        this.context = this.canvas.getContext('2d');
        window.addEventListener("keydown", function (e) { return _this.onKeyDown(e); });
        window.addEventListener("keyup", function (e) { return _this.onKeyUp(e); });
        this.currentTime = this.date.getTime();
        this.previousTime = this.currentTime;
        this.activateScene(E_SCENES.GAME_SCENE);
        requestAnimationFrame(function () { return _this.update(); });
    }
    Game.instance = function () {
        if (!Game._instance)
            Game._instance = new Game();
        return Game._instance;
    };
    Game.prototype.activateScene = function (scene) {
        this.activeScene = null;
        switch (scene) {
            case E_SCENES.GAME_SCENE:
                this.activeScene = new GameScene();
                break;
        }
    };
    Game.prototype.getActiveScene = function () {
        return this.activeScene;
    };
    Game.prototype.update = function () {
        var _this = this;
        this.renderFPS++;
        this.currentTime = (new Date).getTime();
        this.elapsedTime = this.currentTime - this.previousTime;
        this.updateLag += this.elapsedTime;
        while (this.updateLag >= Game.MS_UPDATE_LAG) {
            this.activeScene.update();
            this.updateLag -= Game.MS_UPDATE_LAG;
        }
        this.draw();
        this.previousTime = this.currentTime;
        requestAnimationFrame(function () { return _this.update(); });
    };
    Game.prototype.draw = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.activeScene.draw(this.context);
    };
    Game.prototype.onKeyDown = function (event) {
        this.activeScene.onKeyDown(event);
    };
    Game.prototype.onKeyUp = function (event) {
        this.activeScene.onKeyUp(event);
    };
    Game.width = 960;
    Game.height = 540;
    Game.gravity = 3;
    Game.MS_UPDATE_LAG = 33;
    Game.DEBUG = false;
    return Game;
})();
var GameObject = (function () {
    function GameObject(position, width, height, needsInput, collider, hasGravity, canMove, type) {
        if (needsInput === void 0) { needsInput = false; }
        if (collider === void 0) { collider = false; }
        if (hasGravity === void 0) { hasGravity = false; }
        if (canMove === void 0) { canMove = false; }
        if (type === void 0) { type = E_COLLIDER_TYPES.PROP; }
        this.position = position;
        this.width = width;
        this.height = height;
        this.maxHorSpeed = 15;
        this.maxVertSpeed = 7.5;
        this.drag = 0.25;
        this.speed = 0;
        this.gravity = false;
        this.grounded = false;
        this.canMove = false;
        this.name = "";
        this.dirty = false;
        this.width = width;
        this.height = height;
        this.position = position;
        this.hasGravity = hasGravity;
        this.canMove = canMove;
        this.needsInput = needsInput;
        this.hasCollider = collider;
        this.direction = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.hasCollided = false;
        if (this.hasCollider) {
            this.collider = new BoxCollider(position, width, height, type);
        }
        if (this.hasGravity)
            this.gravity = true;
    }
    GameObject.prototype.isColliding = function (r) {
        return this.collider.hitsOtherCollider(r.collider);
    };
    GameObject.prototype.update = function () {
        if (this.canMove) {
            var vl = this.velocity.sqrMagnitude();
            this.velocity = Vector2.add(this.velocity, Vector2.multiply(this.direction, this.speed));
            if (vl > 0) {
                this.velocity = Vector2.add(this.velocity, Vector2.multiply(Vector2.inverse(this.velocity), this.drag));
            }
            if ((this.hasGravity && this.gravity) && !this.grounded) {
                this.velocity.y += Game.gravity;
            }
            var nv = Vector2.add(this.position, this.velocity);
            var angle = Math.atan2(nv.x - this.position.x, nv.y - this.position.y) * cMath.rad2deg;
            if (angle < 0)
                angle *= -1;
            if (vl > this.maxHorSpeed && angle > 75)
                this.velocity = Vector2.clamp(this.velocity, this.maxHorSpeed);
            else if (vl > this.maxVertSpeed)
                this.velocity = Vector2.clamp(this.velocity, this.maxVertSpeed);
            if (vl > 0 && vl < 0.1) {
                this.velocity = Vector2.zero;
            }
            this.position = Vector2.add(this.position, this.velocity);
            if (this.hasGravity) {
                this.grounded = false;
                this.gravity = true;
            }
            if (this.hasCollider) {
                this.collider.updatePosition(this.position);
            }
        }
    };
    GameObject.prototype.collided = function (co) {
    };
    GameObject.prototype.colliderType = function () {
        return this.collider.type;
    };
    GameObject.prototype.draw = function (ctx) { };
    GameObject.prototype.onKeyDown = function (event) { };
    GameObject.prototype.onKeyUp = function (event) { };
    return GameObject;
})();
var Scene = (function () {
    function Scene() {
        this.gameObjects = [];
        this.goNeedInput = [];
        this.goHasCollider = [];
        this.init();
    }
    Scene.prototype.init = function () {
    };
    Scene.prototype.destroy = function () {
    };
    Scene.prototype.handleCollisions = function () {
        for (var i = 0; i < this.goHasCollider.length; i++) {
            for (var j = 0; j < this.goHasCollider.length; j++) {
                if (i == j)
                    continue;
                var col = this.goHasCollider[i].isColliding(this.goHasCollider[j]);
                if (col.collided) {
                    this.goHasCollider[i].collided({ object: this.goHasCollider[j], direction: col.direction });
                }
            }
        }
    };
    Scene.prototype.update = function () {
        for (var i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update();
        }
        this.handleCollisions();
    };
    Scene.prototype.draw = function (ctx) {
        for (var i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].draw(ctx);
        }
    };
    Scene.prototype.onKeyDown = function (event) {
        for (var i = 0; i < this.goNeedInput.length; i++) {
            this.goNeedInput[i].onKeyDown(event);
        }
    };
    Scene.prototype.onKeyUp = function (event) {
        for (var i = 0; i < this.goNeedInput.length; i++) {
            this.goNeedInput[i].onKeyUp(event);
        }
    };
    Scene.prototype.processGameObjects = function () {
        for (var i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].needsInput) {
                this.goNeedInput.push(this.gameObjects[i]);
            }
            if (this.gameObjects[i].hasCollider) {
                this.goHasCollider.push(this.gameObjects[i]);
            }
        }
    };
    return Scene;
})();
/// <reference path="classes/Game.ts" />
/// <reference path="classes/GameObject.ts" />
/// <reference path="classes/Collider.ts" />
/// <reference path="classes/Scene.ts" />
window.addEventListener("load", function () {
    new Game();
});
/**
 * BoxCollider
 */
var BoxCollider = (function () {
    function BoxCollider(pos, width, height, type, offset) {
        if (offset === void 0) { offset = Vector2.zero; }
        this.size = { width: 0, height: 0 };
        this.position = pos;
        this.size = { width: width, height: height };
        this.type = type;
        this.offset = offset;
    }
    BoxCollider.prototype.hitsOtherCollider = function (rec) {
        var rtn = { collided: false, direction: ColliderDirection.NONE };
        var w = 0.5 * (this.size.width + rec.size.height);
        var h = 0.5 * (this.size.height + rec.size.height);
        var dx = ((this.position.x + (this.size.width / 2)) - (rec.position.x + (rec.size.width / 2)));
        var dy = ((this.position.y + (this.size.height / 2)) - (rec.position.y + (rec.size.height / 2)));
        if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
            var wy = w * dy;
            var hx = h * dx;
            if (wy > hx) {
                if (wy > -hx)
                    rtn = { collided: true, direction: ColliderDirection.TOP };
                else
                    rtn = { collided: true, direction: ColliderDirection.RIGHT };
            }
            else {
                if (wy > -hx)
                    rtn = { collided: true, direction: ColliderDirection.LEFT };
                else
                    rtn = { collided: true, direction: ColliderDirection.BOTTOM };
            }
        }
        return rtn;
    };
    BoxCollider.prototype.updatePosition = function (pos) {
        this.position = new Vector2(pos.x + this.offset.x, pos.y + this.offset.y);
    };
    return BoxCollider;
})();
var Color = (function () {
    function Color(r, g, b, a) {
        if (a === void 0) { a = 1; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.cacheColorString();
    }
    Color.prototype.cacheColorString = function () {
        this.colorString = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    };
    return Color;
})();
var Level = (function () {
    function Level() {
    }
    return Level;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SpriteObject = (function (_super) {
    __extends(SpriteObject, _super);
    function SpriteObject(position, width, height, img, needsInput, collider, hasGravity, canMove, type) {
        if (needsInput === void 0) { needsInput = false; }
        if (collider === void 0) { collider = false; }
        if (hasGravity === void 0) { hasGravity = false; }
        if (canMove === void 0) { canMove = false; }
        if (type === void 0) { type = E_COLLIDER_TYPES.PROP; }
        _super.call(this, position, width, height, needsInput, collider, hasGravity, canMove, type);
        this.sprite = new Image(this.width, this.height);
        this.sprite.src = 'images/' + img + '.png';
    }
    SpriteObject.prototype.update = function () {
        _super.prototype.update.call(this);
    };
    SpriteObject.prototype.draw = function (ctx) {
        ctx.drawImage(this.sprite, this.position.x - (this.width / 2), this.position.y - (this.height / 2), this.width, this.height);
    };
    return SpriteObject;
})(GameObject);
/// <reference path="SpriteObject.ts" />
var Projectile = (function (_super) {
    __extends(Projectile, _super);
    function Projectile(pos) {
        _super.call(this, pos, 15, 15, "projectile", false, true, false, true);
        this.speed = 15;
        this.direction.y = -1;
    }
    return Projectile;
})(SpriteObject);
/// <reference path="SpriteObject.ts" />
/// <reference path="Projectile.ts" />
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(pos) {
        _super.call(this, pos, 75, 75, "player", true, true, false, true);
        this.projectiles = [];
        this.speed = 15;
    }
    Player.prototype.update = function () {
        _super.prototype.update.call(this);
        for (var i = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i].dirty) {
                delete this.projectiles[i];
                this.projectiles[i] = null;
            }
            this.projectiles[i].update();
        }
    };
    Player.prototype.draw = function (ctx) {
        _super.prototype.draw.call(this, ctx);
        for (var i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].draw(ctx);
        }
    };
    Player.prototype.onKeyDown = function (event) {
        switch (event.keyCode) {
            case 32:
                this.projectiles.push(new Projectile(this.position));
                break;
            case 39:
                this.direction.x = 1;
                break;
            case 37:
                this.direction.x = -1;
                break;
        }
    };
    Player.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case 39:
                if (this.direction.x == 1)
                    this.direction.x = 0;
                break;
            case 37:
                if (this.direction.x == -1)
                    this.direction.x = 0;
                break;
        }
    };
    return Player;
})(SpriteObject);
var TextObject = (function (_super) {
    __extends(TextObject, _super);
    function TextObject(position, width, height, text, size, color) {
        _super.call(this, position, width, height, false, false);
        this.text = text;
        this.size = size;
        this.color = color;
    }
    TextObject.prototype.update = function () {
    };
    TextObject.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color.colorString;
        ctx.font = this.size + "px Arial";
        ctx.fillText(this.text, this.position.x, this.position.y, this.width);
    };
    return TextObject;
})(GameObject);
var Vector2 = (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.multiply = function (v1, scalar) {
        return new Vector2(v1.x * scalar, v1.y * scalar);
    };
    Vector2.add = function (v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    };
    Vector2.substract = function (v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    };
    Vector2.prototype.magnitude = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };
    Vector2.prototype.sqrMagnitude = function () {
        return (this.x * this.x) + (this.y * this.y);
    };
    Vector2.inverse = function (v1) {
        return new Vector2(-v1.x, -v1.y);
    };
    Vector2.isZero = function (v1) {
        return ((v1.x == Vector2.zero.x && v1.y == Vector2.zero.y) ? true : false);
    };
    Vector2.clamp = function (v1, n) {
        return new Vector2(cMath.clamp(v1.x, -n, n), cMath.clamp(v1.y, -n, n));
    };
    Vector2.zero = new Vector2(0, 0);
    return Vector2;
})();
var GameScene = (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        _super.apply(this, arguments);
    }
    GameScene.prototype.init = function () {
        _super.prototype.init.call(this);
        this.gameObjects.push(new TextObject(new Vector2(Game.width / 2 - 200, 200), 350, 50, "Shoot all the balloons before they reach the top!", 24, new Color(0, 100, 0)));
        this.gameObjects.push(new Player(new Vector2(Game.width / 2 - 40, Game.height - 40)));
        _super.prototype.processGameObjects.call(this);
    };
    GameScene.prototype.onKeyDown = function (event) {
        _super.prototype.onKeyDown.call(this, event);
    };
    GameScene.prototype.onKeyUp = function (event) {
        _super.prototype.onKeyUp.call(this, event);
    };
    GameScene.prototype.update = function () {
        _super.prototype.update.call(this);
    };
    GameScene.prototype.draw = function (ctx) {
        _super.prototype.draw.call(this, ctx);
    };
    return GameScene;
})(Scene);
var cMath = (function () {
    function cMath() {
    }
    cMath.clamp = function (n, min, max) {
        return Math.min(Math.max(n, min), max);
    };
    ;
    cMath.deg2rad = Math.PI / 180;
    cMath.rad2deg = 180 / Math.PI;
    return cMath;
})();
//# sourceMappingURL=main.js.map