import { Renderer,InputHandler } from "clirenderer";
import { Point,Rectangle } from "clirenderer/dist/Shapes";
import { Button, Element,Menu,Text,Input, ProgressBar } from "./Element";


export class App {
    private renderer: Renderer;
    private _Elements: Map<Point, Element> = new Map<Point, Element>();
    private _cursor: number = 0;
    private height: number;
    private width: number;
    public menu: Menu;
    onKeyDown: ((key: string) => void) | undefined;


    //make an elements getter
    public get Elements(): Map<Point, Element> {
        return this._Elements;
    }

    private set Elements(elements: Map<Point, Element>) {
        this._Elements = elements;
    }

    get cursor(): number {
        return this._cursor;
    }

    private set cursor(cursor: number) {
        this._cursor = cursor;
    }



    
    
    constructor(height: number = 30, width: number = 100) {
        this.renderer = new Renderer();
        this.height = height;
        this.width = width;
        this.onKeyDown = undefined;
        this.menu = new Menu("App");
        this.add(new Point(0, 0), this.menu);
        this.renderer.renderShape(new Rectangle(new Point(0, 0), width,height, "cyan",true));
    }

    private keyHandler(key: string) {
        let {point, element} = this.select(this.cursor);
        switch (key) {
            case "tab":
                if (element) element.on("blur",{point: point,renderer: this.renderer});
                do {
                    if (this.Elements.size -1 <= this.cursor) this.cursor = 0;
                    else this.cursor++;
                    point = this.select(this.cursor).point;
                    element = this.select(this.cursor).element;
                } while (!element.isSelectable)
                if (element) element.on("hover",{point: point,renderer: this.renderer});
                break;
            case "escape":
                this.cursor = 0;
                element = this.select(this.cursor).element;
                if (element) element.on("hover",{renderer: this.renderer});
                break;
            case "return":
                if (element) element.on("click",{point: point,renderer: this.renderer});
                break;
            default:
                if (element) element.on("keydown",{point: point,renderer: this.renderer,data: key});
                break;
        }
        if (this.onKeyDown) {
            this.onKeyDown(key);
        }
    };

    private select(index: number): { point: Point, element: Element } {
        let element: Element = [...this.Elements.values()][index];
        let point: Point = [...this.Elements.keys()][index];
        return { point: point, element: element };
    
    }
    
    public add(point: Point,element: Element): App {
        this.Elements.set(point, element);
        return this;
    }

    public refresh() {
        this.renderer.clear();
        this.renderer.renderShape(new Rectangle(new Point(0, 0), this.width,this.height, "cyan",true));
        this.Elements.forEach((element, point) => {
            element.render(point,this.renderer);
        });
    }

    public run() {
        let {point, element} = this.select(this.cursor);
        this.menu.add(new Button("Quit", this.Quit.bind(this)));
        this.Elements.forEach((element, point) => {
            element.render(point,this.renderer);
        });
        if (element) element.on("hover",{point: point,renderer: this.renderer});
        InputHandler.getInput(this.keyHandler.bind(this));
    }
    
    public Quit() {
        this.renderer.clear();
        process.exit(0);
    }
    
}

const app = new App();
app.menu.add(new Button("Refresh", app.refresh.bind(app)));
let number = 0;
const text = new Text("0 /" + app.Elements.size.toString());
const text2 = new Text(number.toString());
const button = new Button("Hello", () => {
    text2.text = (++number).toString();


});

const button2 = new Button("World", () => {
    text2.text = (--number).toString();
});

const input = new Input("Esto es un cuadro de texto");

const pb = new ProgressBar(20);

app.add(new Point(5, 10), button)
    .add(new Point(15, 10), button2)
    .add(new Point(11, 20), text)
    .add(new Point(12, 30), text2)
    .add(new Point(10, 40), input)
    .add(new Point(20, 40), pb);


function increasePB() {
    setTimeout(() => {
        pb.value++;
        if (pb.value < pb.max) {
            increasePB();
        }
    }, 500);    
}


app.onKeyDown = (key: string) => {
    text.text =  `${app.cursor.toString()} / ${app.Elements.size} ${key}`;
}
app.run();
increasePB();