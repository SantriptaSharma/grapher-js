import { ClampValue } from "./helpers";

export class Color
{
    r : number;
    g : number;
    b : number;
    a : number;

    static RandomColor() : Color
    {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);

        return new Color(`${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
    }
    
    static FromRGBA(r : number, g : number, b : number, a : number) : Color
    {
        let color = new Color("ffffff");
        color.r = ClampValue(r, 0, 1);
        color.g = ClampValue(g, 0, 1);
        color.b = ClampValue(b, 0, 1);
        color.a = ClampValue(a, 0, 1);

        return color;
    }

    constructor(hex : string)
    {
        if(hex.startsWith("#"))
            hex = hex.substring(1);


        if(hex.length < 6)
            throw `Invalid Hex Color: Length`;

        let rHex = hex.substring(0,2);
        let gHex = hex.substring(2,4);
        let bHex = hex.substring(4,6);

        let r = parseInt(rHex, 16);
        let g = parseInt(gHex, 16);
        let b = parseInt(bHex, 16);

        if (isNaN(r) || isNaN(g) || isNaN(b))
            throw "Invalid Hex Color: Not Valid Hexadecimal"

        this.r = r/255;
        this.g = g/255;
        this.b = b/255;

        let a = 255;

        if(hex.length === 8)
        {
            let aHex = hex.substring(6, 8);
            a = parseInt(aHex, 16);
            if(isNaN(a))
                throw "Malformed Hex Color Alpha Value";
        }

        this.a = a/255;
    }

    ToString() : string
    {
        let rString = `${Math.floor(this.r * 255).toString(16).padStart(2, "0")}`;
        let gString = `${Math.floor(this.g * 255).toString(16).padStart(2, "0")}`;
        let bString = `${Math.floor(this.b * 255).toString(16).padStart(2, "0")}`;
        let aString = `${Math.floor(this.a * 255).toString(16).padStart(2, "0")}`;
        return `#${rString}${gString}${bString}${aString}`;
    }
}