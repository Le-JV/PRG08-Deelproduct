enum E_SCENES 
{
    GAME_SCENE
}

enum TILED_LAYERS
{
    TILE_LAYER,
    COLLISION_LAYER
}

enum E_COLLIDER_TYPES
{
    GROUND,
    PLAYER,
    PROP,
    TRIGGER
}

enum ColliderDirection
{
    NONE,
    TOP,
    BOTTOM,
    LEFT,
    RIGHT
}

class Game 
{
    private static _instance: Game;

    public static width:number = 960;
    public static height:number = 540;
    public static gravity:number = 3;
    public static MS_UPDATE_LAG:number = 33; // 30 fps.
    public static DEBUG:Boolean = false;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private activeScene:Scene;
    public date:Date;

    private elapsedTime:number = 0;
    private updateLag:number = 0;
    private currentTime:number;
    private previousTime:number;
    private fpsTimer:number = 0;

    public renderFPS:number = 0;

    constructor() 
    {
        if(Game._instance){
            throw new Error("Kan klasse niet instantieren: Game is een singleton.");
        }

        this.canvas = document.getElementsByTagName("canvas")[0];
        this.canvas.width = Game.width;
        this.canvas.height = Game.height;
        this.date = new Date();

        this.context = this.canvas.getContext('2d');
        
        window.addEventListener("keydown", (e) => this.onKeyDown(e));
        window.addEventListener("keyup"  , (e) => this.onKeyUp(e));

        this.currentTime = this.date.getTime();
        this.previousTime = this.currentTime;

        this.activateScene(E_SCENES.GAME_SCENE);
        
        requestAnimationFrame(() => this.update());    
    }

    public static instance()
    {
        if(!Game._instance)
            Game._instance = new Game();
            
        return Game._instance;
    }
    
    public activateScene(scene:E_SCENES)
    {
        this.activeScene = null;
        switch(scene)
        {
            case E_SCENES.GAME_SCENE:
                this.activeScene = new GameScene();
            break;
        }
    }

    public getActiveScene(): Scene
    {
        return this.activeScene;
    }
    
    // The update loop is based on the 'Fix your Timestep!' article by Glenn Fiedler.
    // I have not taken the time to implement it exactly as described in the article because it's fine for our current needs.
    private update() : void 
    {
        this.renderFPS++;

        this.currentTime = (new Date).getTime();
        this.elapsedTime = this.currentTime - this.previousTime;

        this.updateLag += this.elapsedTime;

        while(this.updateLag >= Game.MS_UPDATE_LAG)
        {
            this.activeScene.update();

            this.updateLag -= Game.MS_UPDATE_LAG;
        }

        this.draw();

        this.previousTime = this.currentTime;

        requestAnimationFrame(() => this.update());  
    }
    
    private draw(): void 
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.activeScene.draw(this.context);
    }
    
    private onKeyDown(event:KeyboardEvent):void 
    {
        this.activeScene.onKeyDown(event);
    }
    
    private onKeyUp(event:KeyboardEvent):void 
    {
        this.activeScene.onKeyUp(event);
    }
} 