import { writable,  type Subscriber, type Unsubscriber } from "svelte/store";
import { GraphEdge, GraphVertex } from "../library/graphelement";

export type Snapshot = {
    name : string,
    id : number,
    verts : GraphVertex[],
    edges : GraphEdge[]
};

type SnapshotStore = {
    subscribe : (this: void, run: Subscriber<Snapshot[]>, invalidate?) => Unsubscriber,
    add : (snap : Snapshot) => void
    remove : (index : number) => void,
    clear : () => void,
}

function CreateSnapshotStore() : SnapshotStore{
    let loaded : Snapshot[] = [];
    
    if(localStorage.length === 0)
    {
        localStorage.setItem("snaps", "[]");
    }
    else
    {
        let obj : any[] = JSON.parse(localStorage.getItem("snaps"));
        
        loaded = obj.map((v) => {
            let verts = v.verts.map(({id, pos, color, radius}) => new GraphVertex({id, pos, color, radius}));
            let edges = v.edges.map(({a, b}) => new GraphEdge(a, b));

            return {name: v.name, id: v.id, verts, edges}
        });
    }

    const inner = writable<Snapshot[]>(loaded);
    
    return {
        subscribe: inner.subscribe, 
        add: (snap : Snapshot) => inner.update((snaps) => {
            let newSnaps = [...snaps, snap]; 
            localStorage.setItem("snaps", JSON.stringify(newSnaps));
            return newSnaps;
        }),
        remove: (index : number) => inner.update((snaps) => {
            let newSnaps = snaps.filter((val, ind) => ind !== index);
            localStorage.setItem("snaps", JSON.stringify(newSnaps));
            return newSnaps;
        }),
        clear: () => inner.set([]),
    };
}

export const snapshots : SnapshotStore = CreateSnapshotStore();