import { FibonacciHeap } from "@tyriar/fibonacci-heap";
import { GraphEdge, GraphVertex } from "./graphelement";
import { Point } from "./point";

export function Dijkstra(graph : {verts : GraphVertex[], edges: GraphEdge[], matrix : boolean[][]}, a : number, b : number) : {edges : number[], success : boolean}
{
    const edgesMarked : number[] = []
    const vert_count = graph.verts.length;

    const distance_between = (a : number, b : number) => Point.Distance(graph.verts[a].pos, graph.verts[b].pos);
    const edge_connecting = (a : number, b : number) => graph.edges.findIndex((v, i) => (v.a === graph.verts[a] && v.b === graph.verts[b]) || (v.a === graph.verts[b] && v.b === graph.verts[a]))
    const get_neighbours = (a : number) => {const neighbourList = []; graph.matrix[a].forEach((v, i) => {if(v) neighbourList.push(i)}); return neighbourList;};

    const heap = new FibonacciHeap<number, number>();
    const distances : Array<number> = Array.from(new Array(vert_count), (_) => Infinity);
    const previousInPath : Array<number> = Array.from(new Array(vert_count), (_) => undefined);
    const heapNodes : Array<any> = Array.from(new Array(vert_count), undefined);
    const vertsConsidered = [];

    distances[a] = 0;

    distances.forEach((v, i) => {
        heapNodes[i] = heap.insert(v, i);
    });

    while(!heap.isEmpty())
    {
        const u = heap.extractMinimum();

        vertsConsidered.push(u.value);

        get_neighbours(u.value).forEach((vert) => {
            if(vertsConsidered.findIndex((v) => vert === v) !== -1)
            {
                return;
            }

            const alt_dist_through_u = distances[u.value] + distance_between(u.value, vert);

            if(alt_dist_through_u < distances[vert])
            {
                distances[vert] = alt_dist_through_u;
                previousInPath[vert] = u.value;
                heap.decreaseKey(heapNodes[vert], alt_dist_through_u);
            }
        });

        if(u.value === b)
        {
            break;
        }
    }

    previousInPath[a] = undefined;

    if(previousInPath[b] === undefined)
    {
        alert("No Path Found");
        return {success: false, edges: edgesMarked};
    }

    let cur = b;
    while(cur !== a)
    {
        const previous = previousInPath[cur];
        if(previous === undefined) break;
        const edgeToMark = edge_connecting(cur, previous);
        if(edgeToMark === -1) break;
        edgesMarked.push(edgeToMark);
        cur = previous;
    }

    return {success: true, edges: edgesMarked};
}