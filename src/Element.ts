import { Renderer } from "clirenderer";
import { Rectangle, Shape,Point} from "clirenderer/dist/Shapes";


export interface Element {
    children: Element[];
    context: {point?: Point, renderer?: Renderer};
    render(point: Point,renderer: Renderer,style? : style): void;
    on(event: string, context: {renderer: Renderer, point?: Point, data?: any}): void;
    isSelectable: boolean;

}


export class Menu implements Element {
    public children: Element[];
    private _name = "";
    private index = 0;
    style: style = {
        backgroundColor: "white",
        forewardColor: "black",
        shadowColor: "black",
        hasShadow: false,
        height: 0,
        width: 100
    };
    readonly isSelectable: boolean = true;
    
    //make getter name
    public get name(): string {
        return this._name;
    }
    public set name(name: string) {
        this._name = name.toUpperCase();
    }


    constructor(public Name: string) {
        this._name = Name.toUpperCase();
        this.children = [];
    }
    context: { point?: Point; renderer?: Renderer; } = {};

    on(event: string,context: {point: Point,renderer: Renderer,data?: any}) {
        switch (event) {
            case "hover":
                this.style.forewardColor = "blue";
                this.children[this.index].on("hover",{renderer: context.renderer});
                this.render(context.point,context.renderer,{forewardColor: "blue"});
                break;
            case "blur":
                this.style.forewardColor = "black";
                this.children[this.index].on("blur",{renderer: context.renderer});
                this.render(context.point,context.renderer);
                this.children[this.index].on(event,context);
                break;
            case "click":
                if (this.children[this.index] instanceof Button) this.children[this.index].on(event,context);
                break;
            case "keydown":
                this.children[this.index].on("blur",{renderer: context.renderer});
                if (context.data === "right") {
                    this.index++;
                    if (this.index >= this.children.length) this.index = 0;
                } else if (context.data === "left") {
                    this.index--;
                    if (this.index < 0) this.index = this.children.length - 1;
                }
                this.children[this.index].on("hover",{renderer: context.renderer});
                break;
            default:
                break;
            }

        
    }


    render(point: Point,renderer: Renderer,style?: style): void {
        Object.assign(this.style,style); 
        const body = new Rectangle(point, this.style.width!, 0, this.style.backgroundColor,true);
        renderer.renderShape(body);
        renderer.renderText(this._name,new Point(point.x , point.y));
        let prevLength = this._name.length + 2;
        for (let i = 0; i < this.children.length; i++) {
            let item = this.children[i] as Button;
            item.context = {point: new Point(point.x + prevLength, point.y), renderer: renderer};
            item.render(new Point(point.x, point.y + prevLength), renderer,{height: 1,hasShadow: false});
            prevLength += item.text.length + 2;
        }
    }

    public add(child: Element) : Element {
        if (child instanceof Button) {
            child.style.height = 1;
            this.children.push(child);
            if (this.context.renderer && this.context.point) child.render(this.context.point,this.context.renderer);
        }
        return this;
    }
}

export interface style {
    backgroundColor?: string;
    forewardColor?: string;
    shadowColor?: string;
    hasShadow?: boolean;
    height?: number;
    width?: number;
}


export class Button implements Element {
    children: Element[];
    callback: () => void;
    text: string;
    style: style = {
        backgroundColor: "white",
        forewardColor: "black",
        shadowColor: "black",
        hasShadow: true,
        height: 2,
        width: 2
    };
    context: { point?: Point; renderer?: Renderer; } = {};
    readonly isSelectable: boolean = true;


    
    on(event: string,context: {renderer: Renderer,point?: Point,data?: any}) {
        if (!this.context.point) {
            if (!context.point) return;
            this.context.point = context.point;
        } 
        switch (event) {
            case "click":
                this.callback();
                let nPoint = new Point(this.context.point.x + 1, this.context.point.y + 1);
                this.render(nPoint,context.renderer,{
                    hasShadow: false,
                    backgroundColor: "blue"
                });
                setTimeout(() => {
                    this.render(this.context.point!,context.renderer,{
                        hasShadow: true,
                        backgroundColor: "blue"
                    });
                }, 1000);
                break;
            case "hover":
                this.render(this.context.point,context.renderer,{
                    backgroundColor: "blue"
                });
                break;
            case "blur":
                this.render(this.context.point,context.renderer,{backgroundColor: "white"});
                break;
            default:
                break;
        }

    }

    public render(point: Point, renderer: Renderer, style?: style) {
        this.context = {
            point: point,
            renderer: renderer
        };

         Object.assign(this.style, style);
        if (this.style.hasShadow) {
            const shadow = new Rectangle(new Point(point.x + 1, point.y + 1), this.text.length + 1, this.style.height!, "black", true);
            renderer.renderShape(shadow);
        }
        const body = new Rectangle(point, this.text.length + 1 , this.style.height!, this.style.backgroundColor, true);
        let centerText = (this.style.height! >= 1 ? 1 : 0);
        let textPoint = new Point(point.x + 1, point.y + centerText);
        const text = new Text(this.text);
        renderer.renderShape(body);
        text.render(textPoint, renderer);
    }

    constructor(public content: string, onClick: () => void, style?: style) {
        this.children = [];
        this.callback = onClick;
        this.text = content;
        this.context = {
            point: new Point(0, 0),
            renderer: undefined
        };
        Object.assign(this.style, style);

    }

}

export class Text implements Element {
    children: Element[];
    _text: string;
    context: { point?: Point; renderer?: Renderer; } = {};
    readonly isSelectable: boolean = false;

    //make a setter and getter for text
    get text(): string {
        return this._text;
    }

    set text(text: string) {
        this._text = " ".repeat(this._text.length);
        if (this.context.renderer && this.context.point) {
            this.render(this.context.point, this.context.renderer);
        }
        this._text = text;
        if (this.context.renderer && this.context.point) {
            this.render(this.context.point, this.context.renderer);
        }
    }


    public render(point: Point,renderer: Renderer) {
        this.context = {
            point: point,
            renderer: renderer
        };
        renderer.renderText(this.text, point);
    }

    constructor(text: string) {
        this.children = [];
        this._text = text;
    }

    on(event: string, context: { point: Point; renderer: Renderer; }): void {
        
    }
}

export class Input implements Element {
    children: Element[];
    context: { point?: Point | undefined; renderer?: Renderer | undefined; };
    style: style = {
        backgroundColor: "white",
        forewardColor: "black",
        shadowColor: "black",
        hasShadow: true,
        height: 2,
        width: 20
    };
    private _text: string = "";
    readonly isSelectable: boolean = true;

    get text(): string {
        return this._text;
    }

    set text(text: string) {
        this._text = " ".repeat(this._text.length);
        if (this.context.renderer && this.context.point) {
            this.render(this.context.point, this.context.renderer);
        }
        this._text = text;
        if (this.context.renderer && this.context.point) {
            this.render(this.context.point, this.context.renderer);
        }
    }

    render(point: Point, renderer: Renderer, style?: style): void {
        this.context = {
            point: point,
            renderer: renderer
        };
        Object.assign(this.style, style);
        const body = new Rectangle(point, this.style.width!, this.style.height!, this.style.backgroundColor!, true);
        renderer.renderShape(body);
        renderer.renderText(this.text.substring(this._text.length - this.style.width! + 1), new Point(point.x + 1, point.y + 1));
    }
    on(event: string, context: { renderer: Renderer; point?: Point | undefined; data?: any; }): void {
        switch (event) {
            case "click":
                break;
            case "hover":
                break;
            case "blur":
                break;
            case "keydown":
                if (context.data === "backspace") this.text = this.text.slice(0, -1);
                else if (context.data === "space") this.text += " ";
                else if (context.data === "undefined") this.text += "";
                else this.text = this.text + context.data;
                break;
            default:
                break;
        }
    }

    constructor (public content?: string) {
        if (content) {
            this._text = content;
        }
        this.style.width = this._text.length + 1;
        this.children = [];
        this.context = {
            point: undefined,
            renderer: undefined
        };
    }

}

export class ProgressBar implements Element {
    children: Element[];
    context: { point?: Point | undefined; renderer?: Renderer | undefined; };
    style: style = {
        backgroundColor: "white",
        forewardColor: "black",
        shadowColor: "black",
        hasShadow: true,
        height: 0,
        width: 20
    };
    private _value: number = 0;
    private _max: number = 100;
    readonly isSelectable: boolean = false;


    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
        if (this.context.renderer && this.context.point) {
            this.render(this.context.point, this.context.renderer);
        }
    }

    get max(): number {
        return this._max;
    }

    set max(max: number) {
        this._max = max;
        if (this.context.renderer && this.context.point) {
            this.render(this.context.point, this.context.renderer);
        }
    }

    render(point: Point, renderer: Renderer, style?: style): void {
        this.context = {
            point: point,
            renderer: renderer
        };
        Object.assign(this.style, style);
        const body = new Rectangle(point, this.style.width!, this.style.height!, this.style.backgroundColor!, true);
        renderer.renderShape(body);
        const progress = new Rectangle(new Point(point.x, point.y), this.style.width! * (this._value / this._max), this.style.height!, "green", true);
        renderer.renderShape(progress);
        const percent = new Text(`${Math.round(this._value / this._max * 100)}%`);
        percent.render(new Point(point.x, point.y + this.style.width! - percent.text.length + 2), renderer);
    }

    on(event: string, context: { renderer: Renderer; point?: Point | undefined; data?: any; }): void {
        switch (event) {
            case "click":
                break;
            case "hover":
                break;
            case "blur":
                break;
            case "keydown":
                break;
            default:
                break;
            }
            
    }

    constructor (maxValue: number) {
        this._max = maxValue;
        this._value = 0 ;
        this.children = [];
        this.context = {
            point: undefined,
            renderer: undefined
        };
    }
}