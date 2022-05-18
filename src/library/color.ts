export class Color
{
    r : number;
    g : number;
    b : number;
    a : number;

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
        return `#${(this.r*255).toString(16).padStart(2, "0")}${(this.g*255).toString(16).padStart(2, "0")}${(this.b*255).toString(16).padStart(2, "0")}${(this.a*255).toString(16).padStart(2, "0")}`;
    }
}